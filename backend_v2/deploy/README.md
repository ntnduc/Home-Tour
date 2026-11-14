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
| `SSH_PRIVATE_KEY` | **File** | | content of `gitlab_deploy` private key (must end with a newline) |
| `SSH_KNOWN_HOSTS` | **File** | | output of `ssh-keyscan -p 22 100.x.y.z` (pins the server host key) |

`migrate` and `deploy` stop with a clear error if either SSH variable is missing.
| `ANSIBLE_REPO_REF` | Variable | | `v1.2.0` (tag of `ntnduc/ansible-docker-compose`: `docker compose` v2 + version in `.env`) |

App secrets (DB, JWT) are **not** stored in GitLab. They live only in the server `.env`.

⚠ Harbor robot names contain `$` (`robot$home-tour+ci`). For `HARBOR_USERNAME` and `HARBOR_PASSWORD`
**uncheck "Expand variable reference"**, otherwise GitLab treats `$home` as a variable and login fails.

`IMAGE_VERSION` is not set here; it is an optional field in the **Run pipeline** form (see section 4).

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
# The container runs as user `node` (uid 1000), it must be able to write uploads
sudo chown 1000:1000 /opt/home-tour/backend/uploads
```
`docker` group lets `deploy` run docker without sudo (note: docker group is root-equivalent; keep the key safe).

### 2.3 SSH key for CI (GitLab variable `SSH_PRIVATE_KEY`)
On your machine, create a key dedicated to CI (no passphrase):
```bash
ssh-keygen -t ed25519 -C "gitlab-ci-deploy" -f ./gitlab_deploy -N ""
```
On the server, add the **public** key to `deploy`:
```bash
sudo -u deploy mkdir -p /home/deploy/.ssh
echo "<content of gitlab_deploy.pub>" | sudo -u deploy tee -a /home/deploy/.ssh/authorized_keys
sudo chmod 700 /home/deploy/.ssh && sudo chmod 600 /home/deploy/.ssh/authorized_keys
```
Then, in this order:
1. Test: `ssh -i gitlab_deploy -o IdentitiesOnly=yes deploy@<tailscale-ip> docker ps`.
2. GitLab → Settings → CI/CD → Variables → add `SSH_PRIVATE_KEY`, **Type: File**, Protected,
   value = full content of `gitlab_deploy` (from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END ...-----`
   **plus a final newline**; without it ssh fails with `error in libcrypto`).
   File variables cannot be masked; keep them Protected and limit project Maintainers.
3. `ssh-keyscan -p 22 <tailscale-ip>` → GitLab `SSH_KNOWN_HOSTS` (**Type: File**). Compare the fingerprint with
   `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the server.
4. Delete the local key files (`gitlab_deploy`, `gitlab_deploy.pub`).

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
As Postgres superuser (`sudo -u postgres psql`):
```sql
CREATE USER home_tour WITH PASSWORD '...';
CREATE DATABASE home_tour_v2 OWNER home_tour;
\c home_tour_v2
-- Required: migrations use uuid_generate_v4() but do not create the extension,
-- and a normal user cannot create it. Without this the first migrate job fails.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
`pg_hba.conf` must allow password login from localhost for this user (default on most installs):
```
host  home_tour_v2  home_tour  127.0.0.1/32  scram-sha-256
```
Test as deploy: `psql -h 127.0.0.1 -U home_tour home_tour_v2 -c 'select 1'`.

The database is empty → the first pipeline's `migrate` job creates the whole schema from
`src/database/migrations`. Check after the first run (in `/opt/home-tour/backend`):
```bash
IMG=$(grep -m1 'image:' docker-compose.yml | awk '{print $2}' | cut -d: -f1)
docker run --rm --network host --env-file .env "$IMG:$(grep ^VERSION= .env | cut -d= -f2)" npm run migration:show:prod
```

### 2.7 Tailscale + firewall (option A1)
Create the tags in the Tailscale ACL first (section 3), otherwise `--advertise-tags` is rejected.
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --advertise-tags=tag:backend
```
`network_mode: host` makes the app listen on all interfaces, so the firewall must limit port 3000 to Tailscale.

⚠ **Lock-out risk:** if you are connected over the public IP, `ufw enable` with these rules cuts your SSH.
First confirm you can SSH via the Tailscale IP, or temporarily keep `sudo ufw allow 22/tcp`.
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

⚠ A policy with `acls` replaces the default "allow all". Merge these rules into your existing policy and keep
the access you still need (e.g. your own devices → `tag:edge:22`), or you lose it.

---

## 4. Operations

- **Image version:** numbers only.
  - Auto (push to `dev`): `CI_PIPELINE_IID`, the project pipeline counter → `1`, `2`, `3`, …
  - Manual: GitLab → Build → Pipelines → **Run pipeline** → branch `dev` → set `IMAGE_VERSION` (e.g. `1.2.0`).
    Anything that is not `^[0-9]+(\.[0-9]+)*$` (e.g. `v1.2`) fails the pipeline.
  - Re-running a job of an old pipeline keeps that pipeline's version.
  - A manual version that already exists in Harbor is overwritten. Use a new number, or enable tag immutability in Harbor.
  - **Run pipeline** builds the latest commit of the chosen branch/tag. To rebuild old code, create a git tag on
    that commit and run the pipeline on the tag (needs a workflow rule for tags) — or simply redeploy the old image
    by setting `VERSION` in `.env` (below); no rebuild needed.

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
3. `postgresql.conf`: `listen_addresses = '*'` (access is then limited by `pg_hba.conf` + firewall below).
   Listing only `172.17.0.1` is not enough: compose creates its own network (`172.18.0.0/16` and up,
   see `docker network inspect backend_default`), and Postgres must be restarted, not reloaded, after this change.
4. `pg_hba.conf`:
   ```
   host  home_tour_v2  home_tour  172.16.0.0/12  scram-sha-256
   ```
   then `sudo systemctl reload postgresql`.
5. Firewall: `sudo ufw allow from 172.16.0.0/12 to any port 5432 proto tcp`.
6. `.gitlab-ci.yml` `migrate` job: replace `--network host` with `--add-host host.docker.internal:host-gateway`.
7. Port 3000 is now published by Docker, which **bypasses ufw**. Binding `ports:` to the Tailscale IP is what
   protects it; the `tailscale0` ufw rule for 3000 is no longer used and can be removed.
   Boot-order gotcha: the bind fails if Docker starts before Tailscale has its IP. Fix with a systemd drop-in
   (`sudo systemctl edit docker` → `[Unit]` `After=tailscaled.service` `Wants=tailscaled.service`).
8. `docker compose up -d`.
