# Backend deploy: server setup + CI/CD variables

Pipeline: `.gitlab-ci.yml` (repo root). Runs on every push to `dev` that changes `backend_v2/**`.

```
build    → docker build backend_v2 → push Harbor (<version>, dev-latest); version = pipeline number or manual IMAGE_VERSION
migrate  → ssh deploy@server → docker run <new image> npm run migration:run:prod
deploy   → ansible (ntnduc/ansible-docker-compose) → set image tag → docker compose pull → up -d
test     → defined but disabled (rules: when: never)
```

Files in this folder:

| File | Copy to server? |
|---|---|
| `docker-compose.yml` | ✅ `/opt/home-tour/backend/docker-compose.yml` |
| `.env.production.example` | ✅ `/opt/home-tour/backend/.env` (fill values) |
| `docker-compose.host-gateway.yml` | Only if you switch network mode (see end of file) |
| `ansible/*.example` | No, reference only (CI generates them) |

---

## 1. GitLab

### 1.1 Mirror
Settings → Repository → Mirroring repositories: pull mirror from GitHub, and enable
**"Trigger pipelines for mirror updates"**, otherwise mirror syncs will not start pipelines.

### 1.2 Runner (Docker executor)
`build` uses Docker-in-Docker. In the runner `config.toml`:
```toml
[runners.docker]
  privileged = true
  volumes = ["/certs/client", "/cache"]
```
The runner must reach `DEPLOY_HOST` on SSH. If the runner host is in the tailnet, job containers can reach
`100.x.y.z` through the host. **Use the Tailscale IP, not the MagicDNS name** (DNS inside job containers may not use MagicDNS).

### 1.3 CI/CD variables (Settings → CI/CD → Variables, all **Protected**; protect branch `dev`)

| Variable | Type | Masked | Example |
|---|---|---|---|
| `HARBOR_HOST` | Variable | | `harbor.example.com` |
| `HARBOR_PROJECT` | Variable | | `home-tour` |
| `HARBOR_USERNAME` | Variable | | `robot$home-tour+ci` (push + pull) |
| `HARBOR_PASSWORD` | Variable | ✅ | robot secret |
| `DEPLOY_HOST` | Variable | | `100.x.y.z` (Tailscale IP of backend server) |
| `DEPLOY_PORT` | Variable | | `22` |
| `DEPLOY_USER` | Variable | | `deploy` |
| `DEPLOY_DIR` | Variable | | `/opt/home-tour/backend` |
| `SSH_PRIVATE_KEY` | **File** | | content of `gitlab_deploy` (keep trailing newline) |
| `SSH_KNOWN_HOSTS` | **File** | | output of `ssh-keyscan -p 22 100.x.y.z` |
| `ANSIBLE_REPO_REF` | Variable | | `v1.2.0` (tag of `ntnduc/ansible-docker-compose`: `docker compose` v2 + version in `.env`) |

App secrets (DB, JWT) are **not** stored in GitLab. They live only in the server `.env`.

### 1.4 Harbor
- Project `home-tour` (private).
- Robot account **CI** (push + pull) → `HARBOR_USERNAME` / `HARBOR_PASSWORD`.
- Robot account **server** (pull only) → used once on the server in step 2.5.

---

## 2. Backend server (one time)

### 2.1 Requirements
Docker Engine + compose plugin (`docker compose version`), `python3` (needed by Ansible), Tailscale.

### 2.2 Deploy user
```bash
sudo groupadd deploy
sudo useradd -m -g deploy -G docker -s /bin/bash deploy
sudo mkdir -p /opt/home-tour/backend/uploads
sudo chown -R deploy:deploy /opt/home-tour
```
`docker` group lets `deploy` run docker without sudo (note: docker group is root-equivalent; keep the key safe).

### 2.3 SSH key for the runner
On your machine:
```bash
ssh-keygen -t ed25519 -C "gitlab-ci-deploy" -f ./gitlab_deploy -N ""
```
On the server, add `gitlab_deploy.pub`:
```bash
sudo -u deploy mkdir -p /home/deploy/.ssh
sudo -u deploy tee -a /home/deploy/.ssh/authorized_keys < gitlab_deploy.pub
sudo chmod 700 /home/deploy/.ssh && sudo chmod 600 /home/deploy/.ssh/authorized_keys
```
Then: `gitlab_deploy` → GitLab `SSH_PRIVATE_KEY`, `ssh-keyscan -p 22 <tailscale-ip>` → `SSH_KNOWN_HOSTS`,
delete the local key files. Test from the runner host: `ssh -i gitlab_deploy deploy@<tailscale-ip> docker ps`.

Optional, `/etc/ssh/sshd_config`:
```
Match User deploy
    PasswordAuthentication no
```

### 2.4 App files
```bash
sudo -u deploy -i
cd /opt/home-tour/backend
# copy docker-compose.yml and .env.production.example here
mv .env.production.example .env && chmod 600 .env
nano .env                     # VERSION, DB_*, JWT_*, STORAGE_PUBLIC_URL
nano docker-compose.yml       # replace harbor.example.com/home-tour with <HARBOR_HOST>/<HARBOR_PROJECT>
```
The image tag is **not** in `docker-compose.yml`: it reads `${VERSION}` from `.env`.
Keep `VERSION=dev-latest` for the first setup; each deploy overwrites it with the image version number.

### 2.5 Harbor login (as deploy)
```bash
sudo -u deploy docker login <HARBOR_HOST>     # pull-only robot account
```
Credentials are stored in `/home/deploy/.docker/config.json`. The Ansible role does not log in by itself.

### 2.6 Database (existing Postgres on this host)
No Postgres container is used. With `network_mode: host` the app connects to `127.0.0.1:<DB_PORT>`.
```sql
CREATE USER home_tour WITH PASSWORD '...';
CREATE DATABASE home_tour_v2 OWNER home_tour;
```
The database is empty → the first pipeline's `migrate` job creates the whole schema from
`src/database/migrations`. Check manually after the first run:
```bash
docker run --rm --network host --env-file .env <image> npm run migration:show:prod
```

### 2.7 Tailscale + firewall (option A1)
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --advertise-tags=tag:backend
```
`network_mode: host` makes the app listen on all interfaces, so the firewall must limit port 3000 to Tailscale:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow in on tailscale0 to any port 22 proto tcp
sudo ufw allow in on tailscale0 to any port 3000 proto tcp
# keep public SSH only if the runner is NOT on the tailnet:
# sudo ufw allow 22/tcp
sudo ufw enable
```
Port 5432 stays closed from outside (the app uses localhost). ufw applies here because host networking
publishes no Docker ports (Docker's iptables bypass only affects `ports:` mappings).

---

## 3. Public server (reverse proxy)

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --advertise-tags=tag:edge
```
Caddy (`/etc/caddy/Caddyfile`, automatic HTTPS):
```
api.your-domain.com {
    reverse_proxy <backend-tailscale-ip>:3000
}
```
Or Nginx:
```nginx
server {
    listen 443 ssl;
    server_name api.your-domain.com;
    client_max_body_size 20m;          # >= STORAGE_MAX_FILE_SIZE
    location / {
        proxy_pass http://<backend-tailscale-ip>:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Set `STORAGE_PUBLIC_URL=https://api.your-domain.com/uploads` in the backend `.env`.

Tailscale ACL (admin console → Access controls), adjust to your tags:
```json
{
  "tagOwners": { "tag:edge": ["autogroup:admin"], "tag:backend": ["autogroup:admin"], "tag:ci": ["autogroup:admin"] },
  "acls": [
    { "action": "accept", "src": ["tag:edge"],                     "dst": ["tag:backend:3000"] },
    { "action": "accept", "src": ["tag:ci", "autogroup:admin"],    "dst": ["tag:backend:22"] }
  ]
}
```
Tag the runner host `tag:ci` if it is on the tailnet.

---

## 4. Operations

- **Image version:** numbers only.
  - Auto (push to `dev`): `CI_PIPELINE_IID`, the project pipeline counter → `1`, `2`, `3`, …
  - Manual: GitLab → Build → Pipelines → **Run pipeline** → branch `dev` → set `IMAGE_VERSION` (e.g. `1.2.0`).
    Anything that is not `^[0-9]+(\.[0-9]+)*$` (e.g. `v1.2`) fails the pipeline.
  - Re-running a job of an old pipeline keeps that pipeline's version.
  - A manual version that already exists in Harbor is overwritten. Use a new number, or enable tag immutability in Harbor.

- **Run an older version (on the server):** set `VERSION=<tag>` in `.env` (any version in Harbor, e.g. `12` or `1.2.0`),
  then `docker compose up -d`. No change to `docker-compose.yml`.
  The previous value is always in `.history/stable.env`; timestamped copies in `.history/*_env`.
- **Rollback from GitLab:** Pipelines → older pipeline → re-run `deploy` (it writes that pipeline's version into `.env`).
  Migrations are not reverted automatically; keep migrations backward compatible.
- The next push to `dev` overwrites `VERSION` again with the new version.
- **Logs:** `docker logs -f home-tour-backend`
- **Manual migration:** `docker run --rm --network host --env-file .env <image:tag> npm run migration:run:prod`

---

## 5. Switching to host-gateway (bridge network) later

1. Replace server `docker-compose.yml` with `docker-compose.host-gateway.yml` (keep the same image line),
   set the Tailscale IP in `ports:`.
2. `.env`: `DB_HOST=host.docker.internal`.
3. `postgresql.conf`: `listen_addresses = 'localhost,172.17.0.1'` — or `'*'` if the firewall blocks 5432 publicly.
   Compose networks use `172.18.0.0/16` and up, so the gateway the container sees may differ; check with
   `docker network inspect backend_default`.
4. `pg_hba.conf`:
   ```
   host  home_tour_v2  home_tour  172.16.0.0/12  scram-sha-256
   ```
   then `sudo systemctl reload postgresql`.
5. Firewall: `sudo ufw allow from 172.16.0.0/12 to any port 5432 proto tcp`.
6. `.gitlab-ci.yml` `migrate` job: replace `--network host` with `--add-host host.docker.internal:host-gateway`.
7. Remove the ufw rule for port 3000 on `tailscale0` if the port is now bound to the Tailscale IP only
   (note: Docker-published ports bypass ufw, so binding to the Tailscale IP is what protects it).
8. `docker compose up -d`.
