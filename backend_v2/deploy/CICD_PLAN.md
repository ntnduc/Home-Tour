# Backend CI/CD Plan (GitLab → Harbor → Server via Ansible)

> Status: **APPLIED** (A1 firewall, empty DB, runner = Docker executor, ansible repo tagged `v1.2.0`, image tag via `VERSION` in `.env`).
> Server setup guide: `README.md` in this folder.
> v2 applies your answers: GitLab mirror · `docker compose` v2 · `deploy` user · migration step · Docker runner ·
> `network_mode: host` · Tailscale for access from the public server.

## 1. Flow

```
push to `dev` on GitHub ──mirror──▶ GitLab (changes under backend_v2/**)
   │
   ▼
GitLab Runner (Docker executor)
   ├─ test     → defined, DISABLED (rules: when: never), enable later
   ├─ build    → docker build backend_v2 → push Harbor  (tags: <short-sha>, dev-latest)
   ├─ migrate  → ssh deploy@server: docker run --rm --network host --env-file .env <image:sha> migration:run
   └─ deploy   → clone ntnduc/ansible-docker-compose → ansible-playbook as `deploy`
                 role: backup compose → set image tag → docker compose pull → up -d
```

- No Postgres container. Backend uses the Postgres already on the host (`network_mode: host`, `DB_HOST=127.0.0.1`).
- `migrate` runs **before** `deploy`, from the **new** image, on the server (only the server can reach the DB).
  If a migration fails, deploy does not run and the old container keeps serving.
- `migrate` and `deploy` share `resource_group: dev-server` so two pipelines never deploy at the same time.

## 2. Files to create / change

| File | Purpose |
|---|---|
| `.gitlab-ci.yml` (repo root) | Pipeline (GitLab only reads it from the root). Runs only for `dev` + `backend_v2/**` changes. |
| `backend_v2/Dockerfile` | Multi-stage `node:20-alpine`. Builder: `python3 make g++` (for `bcrypt`), `npm ci`, `npm run build`, `npm prune --omit=dev`. Runtime: `dist/`, `node_modules/`, `package.json`, non-root `node` user, `CMD ["node","dist/main"]`. |
| `backend_v2/.dockerignore` | Excludes `node_modules`, `dist`, `.env*`, `uploads`, `test`, `coverage`. |
| `backend_v2/src/database/data-source.ts` | **New.** Production DataSource for the TypeORM CLI: reads `DB_*` env, entities/migrations globs relative to `__dirname`, so it works from `dist/` (`dist/database/migrations/*.js` is already produced by `nest build`). `typeorm.config.ts` stays unchanged for local dev. |
| `backend_v2/package.json` | Add script `"migration:run:prod": "typeorm migration:run -d dist/database/data-source.js"` (`typeorm` is already a runtime dependency, no ts-node needed). |
| `backend_v2/src/main.ts` | Optional, only if you pick Option A2 in §7: `app.listen(port, process.env.HOST ?? '0.0.0.0')`. |
| `backend_v2/deploy/README.md` | **Folder you read and copy to the server**: server setup, deploy user, Tailscale, Postgres, all variables. |
| `backend_v2/deploy/docker-compose.yml` | → server `/opt/home-tour/backend/docker-compose.yml`. Only the `backend` service. |
| `backend_v2/deploy/docker-compose.host-gateway.yml` | Alternative compose for the future switch to bridge network + `host-gateway` (§5.4). |
| `backend_v2/deploy/.env.production.example` | → server `/opt/home-tour/backend/.env`. |
| `backend_v2/deploy/ansible/inventory.ini.example`, `deploy_vars.yml.example` | Reference only; CI generates the real ones. |

**Change needed in your ansible repo (`ntnduc/ansible-docker-compose`)** — it calls `docker-compose` (v1), your server has `docker compose` (v2):

```yaml
# roles/docker-compose/defaults/main.yml
compose_cmd: "docker compose"
# roles/docker-compose/tasks/update-stack-service.yml
command: "{{ compose_cmd }} pull"     # was: docker-compose pull
command: "{{ compose_cmd }} up -d"    # was: docker-compose up -d
```
Then tag it (e.g. `v1.1.0`) and pin CI to that tag via `ANSIBLE_REPO_REF`.
Fallback without touching the repo: shim on server `/usr/local/bin/docker-compose` → `exec docker compose "$@"`. I recommend the repo fix.

## 3. `.gitlab-ci.yml` design

```yaml
workflow:
  rules:
    - if: $CI_COMMIT_BRANCH == "dev"
      changes: [backend_v2/**/*, .gitlab-ci.yml]

stages: [test, build, migrate, deploy]

variables:
  IMAGE: $HARBOR_HOST/$HARBOR_PROJECT/home-tour-backend
  IMAGE_TAG: $CI_COMMIT_SHORT_SHA

.ssh: &ssh
  - apk add --no-cache openssh-client
  - eval $(ssh-agent -s) && chmod 600 "$SSH_PRIVATE_KEY" && ssh-add "$SSH_PRIVATE_KEY"   # File-type variable
  - mkdir -p ~/.ssh && cp "$SSH_KNOWN_HOSTS" ~/.ssh/known_hosts                            # pinned host key

test:                       # placeholder, enable later
  stage: test
  image: node:20-alpine
  script: [cd backend_v2, npm ci, npm run lint, npm test]
  rules: [{ when: never }]

build:
  stage: build
  image: docker:27
  services: [docker:27-dind]
  variables: { DOCKER_TLS_CERTDIR: "/certs" }
  script:
    - echo "$HARBOR_PASSWORD" | docker login "$HARBOR_HOST" -u "$HARBOR_USERNAME" --password-stdin
    - docker build -t $IMAGE:$IMAGE_TAG -t $IMAGE:dev-latest backend_v2
    - docker push $IMAGE:$IMAGE_TAG && docker push $IMAGE:dev-latest

migrate:
  stage: migrate
  image: alpine:3.20
  resource_group: dev-server
  before_script: *ssh
  script:
    - ssh -p $DEPLOY_PORT $DEPLOY_USER@$DEPLOY_HOST
        "cd $DEPLOY_DIR && docker pull $IMAGE:$IMAGE_TAG &&
         docker run --rm --network host --env-file .env $IMAGE:$IMAGE_TAG npm run migration:run:prod"

deploy:
  stage: deploy
  image: alpine:3.20
  resource_group: dev-server
  before_script:
    - *ssh
    - apk add --no-cache ansible git
    - git clone --depth 1 --branch "$ANSIBLE_REPO_REF" https://github.com/ntnduc/ansible-docker-compose.git /ansible
    - generate /ansible/inventory.ini and /ansible/deploy_vars.yml from CI variables (§4)
  script:
    - cd /ansible && ansible-playbook playbook.yml -i inventory.ini -i deploy_vars.yml
  environment: { name: dev }
```

Notes:
- Docker runner must have `privileged = true` in `config.toml` for dind.
- Rollback: re-run the `deploy` job of an older pipeline (each image is tagged by SHA).
  Migrations are not auto-reverted; write migrations backward compatible (add columns first, drop later).

## 4. Deploy user + SSH key (no root)

On the server (one time):
```bash
sudo groupadd deploy
sudo useradd -m -g deploy -G docker -s /bin/bash deploy     # docker group = can run docker without sudo
sudo mkdir -p /opt/home-tour/backend/uploads
sudo chown -R deploy:deploy /opt/home-tour
```
SSH key (generate on your machine, dedicated to CI):
```bash
ssh-keygen -t ed25519 -C "gitlab-ci-deploy" -f ./gitlab_deploy -N ""
# public key → server
sudo -u deploy mkdir -p ~deploy/.ssh && cat gitlab_deploy.pub | sudo -u deploy tee -a ~deploy/.ssh/authorized_keys
sudo chmod 700 ~deploy/.ssh && sudo chmod 600 ~deploy/.ssh/authorized_keys
# private key → GitLab variable SSH_PRIVATE_KEY (type File, protected)
# host key   → GitLab variable SSH_KNOWN_HOSTS (type File):  ssh-keyscan -p <port> <DEPLOY_HOST>
```
Then delete the local key files. Optional hardening in `sshd_config`: `PasswordAuthentication no` for `deploy`.

How the ansible repo works with this user, **without changing `playbook.yml`**:
- Inventory `ansible_user=deploy` overrides the playbook keyword `remote_user: root` (Ansible variable > play keyword).
- Role var `remote_user: deploy` → file owner/group of the `.history/` backups.
- No `become` needed: `deploy` owns `/opt/home-tour` and is in the `docker` group.

Generated by CI:
```ini
# inventory.ini
[web_hosts]
backend ansible_host=$DEPLOY_HOST ansible_port=$DEPLOY_PORT ansible_user=deploy
```
```yaml
# deploy_vars.yml
all:
  vars:
    remote_user: deploy
    working_time: "{{ ansible_date_time.iso8601_basic_short }}"
    service_stacks:
      - docker_repository: $HARBOR_HOST/$HARBOR_PROJECT
        image_name: home-tour-backend
        image_version: $CI_COMMIT_SHORT_SHA
        working_directory: /opt/home-tour/backend
```
The `image:` line in the server compose file must be exactly `<HARBOR_HOST>/<HARBOR_PROJECT>/home-tour-backend:<tag>`
so the role's regex can replace the tag.

## 5. Variables

### 5.1 GitLab CI/CD variables (Settings → CI/CD → Variables; protected, masked where possible)

| Variable | Type | Example | Used by |
|---|---|---|---|
| `HARBOR_HOST` | var | `harbor.example.com` | build, migrate, deploy |
| `HARBOR_PROJECT` | var | `home-tour` | build, migrate, deploy |
| `HARBOR_USERNAME` | var | `robot$home-tour+ci` (push) | build |
| `HARBOR_PASSWORD` | var, masked | — | build |
| `DEPLOY_HOST` | var | Tailscale MagicDNS name or IP, e.g. `backend-dev` / `100.x.y.z` (see §7) | migrate, deploy |
| `DEPLOY_PORT` | var | `22` | migrate, deploy |
| `DEPLOY_USER` | var | `deploy` | migrate, deploy |
| `DEPLOY_DIR` | var | `/opt/home-tour/backend` | migrate, deploy |
| `SSH_PRIVATE_KEY` | **File** | private key from §4 | migrate, deploy |
| `SSH_KNOWN_HOSTS` | **File** | output of `ssh-keyscan` | migrate, deploy |
| `ANSIBLE_REPO_REF` | var | `v1.1.0` (tag after the compose fix) | deploy |

App secrets (DB password, JWT) are **not** in GitLab; they live only in the server `.env` (owned by `deploy`, `chmod 600`).
Server pulls from Harbor with a separate **pull-only** robot account: `sudo -u deploy docker login <HARBOR_HOST>` once.

### 5.2 Server `.env` (`deploy/.env.production.example`)

```
NODE_ENV=production
PORT=3000
# HOST=100.x.y.z        # only with Option A2 in §7

# Existing Postgres on this host (network_mode: host)
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=home_tour_v2

JWT_TEMP_SECRET=
JWT_SECRET=
JWT_REFRESH_SECRET=

STORAGE_UPLOAD_PATH=/app/uploads
STORAGE_PUBLIC_URL=https://api.<your-domain>/uploads
STORAGE_MAX_FILE_SIZE=10485760
STORAGE_MAX_FILES_PER_REQUEST=10
STORAGE_ALLOWED_MIME_TYPES=
STORAGE_ALLOWED_EXTENSIONS=
STORAGE_ENABLE_IMAGE_VALIDATION=true
```
This is the full list of `process.env.*` read by `src/`.

### 5.3 Server `docker-compose.yml` (default: host network)

```yaml
services:
  backend:
    image: harbor.example.com/home-tour/home-tour-backend:dev-latest   # tag rewritten by ansible
    container_name: home-tour-backend
    restart: unless-stopped
    network_mode: host          # app listens on host:3000, reaches Postgres at 127.0.0.1
    env_file: .env
    volumes:
      - ./uploads:/app/uploads
```
No `postgres` service, no `ports:` (ignored with host network), no DB volume.
Postgres needs no change: it already accepts `127.0.0.1`.

### 5.4 Future switch: bridge network + `host-gateway` (`deploy/docker-compose.host-gateway.yml`)

```yaml
services:
  backend:
    image: harbor.example.com/home-tour/home-tour-backend:dev-latest
    container_name: home-tour-backend
    restart: unless-stopped
    env_file: .env
    ports:
      - "100.x.y.z:3000:3000"                       # bind to Tailscale IP only (or 127.0.0.1)
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - ./uploads:/app/uploads
```
Steps to switch:
1. `.env`: `DB_HOST=host.docker.internal`.
2. `postgresql.conf`: `listen_addresses = 'localhost,172.17.0.1'` (docker bridge gateway; check `ip addr show docker0`).
   Note: compose creates its own network (`172.18+.x`), its gateway is the address the container hits — allow the range below.
3. `pg_hba.conf`: `host  home_tour_v2  <db_user>  172.16.0.0/12  scram-sha-256`, then `systemctl reload postgresql`.
4. Firewall: allow 5432 from `172.16.0.0/12` only, never public.
5. Replace the server compose file, `docker compose up -d`. Migrate job: change `--network host` to `--add-host host.docker.internal:host-gateway`.

Benefit: container is network-isolated and you control exactly which port/interface is published.

## 6. One-time server setup checklist (goes into `deploy/README.md`)

1. Docker Engine + compose plugin installed (`docker compose version`).
2. Create `deploy` user/group, folder, SSH key (§4).
3. Copy `docker-compose.yml` + `.env` to `/opt/home-tour/backend`, fill `.env`, `chmod 600 .env`.
4. `sudo -u deploy docker login <HARBOR_HOST>` (pull-only robot).
5. Tailscale + firewall (§7).
6. First run: trigger pipeline on `dev` (migrate will run all pending migrations on the existing DB).
   ⚠ Check `migrations` table on the existing DB first, so already-applied migrations are not re-run.

## 7. Access via Tailscale — options

Topology: **Public server** (public IP, domain, TLS) ⇄ Tailscale ⇄ **Backend server** (backend + Postgres, no public port).

### Option A — Host-level Tailscale + reverse proxy on public server (**recommended**)
- Install Tailscale on both servers (`tailscale up --ssh=false`), tag them `tag:edge` and `tag:backend`.
- Public server runs **Caddy** (auto Let's Encrypt) or Nginx:
  ```
  api.<your-domain> {
      reverse_proxy backend-dev:3000      # MagicDNS name of backend server
  }
  ```
- Backend server, because `network_mode: host` makes the app listen on **all** interfaces:
  - **A1 (no code change):** firewall `ufw default deny incoming` · `ufw allow in on tailscale0 to any port 3000` ·
    `ufw allow in on tailscale0 to any port 22` · keep public 3000/5432 closed.
    ⚠ Docker does not bypass ufw here because host networking publishes no Docker ports — ufw rules apply.
  - **A2 (defense in depth):** also bind the app to the Tailscale IP via `HOST=100.x.y.z` (small `main.ts` change in §2).
- Tailscale ACL: only `tag:edge` → `tag:backend:3000`; only CI/admin → `tag:backend:22`; nothing else.
- Pros: simplest, fits `network_mode: host`, TLS ends on the public server, backend never exposed. Cons: proxy→backend hop is plain HTTP, but inside the WireGuard tunnel (encrypted).

### Option B — Tailscale sidecar container (`tailscale/tailscale` + `network_mode: service:tailscale`)
- Backend gets its own tailnet node. **Not compatible with `network_mode: host`**; consider only after the §5.4 switch.

### Option C — Tailscale Funnel
- Exposes the backend to the internet directly via Tailscale, no public server needed. Less control (no custom WAF/rate limit, Tailscale domain). Not recommended since you already have a public server.

**Also important — CI reach:** `DEPLOY_HOST` must be reachable by SSH from the runner.
- If the runner host is on the tailnet (self-hosted runner, recommended): use the MagicDNS name, close public port 22 on the backend server.
- If the runner is not on the tailnet: either keep port 22 public (key-only, fail2ban) or join the job to the tailnet with an ephemeral auth key (`tailscale up --authkey=$TS_AUTHKEY` in userspace mode) — more complex.

## 8. Remaining questions

- **Q1.** Where is the GitLab runner hosted — on a machine already in the tailnet, or elsewhere? (decides `DEPLOY_HOST` and whether port 22 stays public)
- **Q2.** OK to change your ansible repo (`compose_cmd`) and tag it, or use the server shim?
- **Q3.** Tailscale option: A1 (firewall only) or A2 (firewall + `HOST` bind, one-line `main.ts` change)?
- **Q4.** Is the existing DB already migrated by hand (rows in the `migrations` table)? If not, first `migration:run` will try to create everything.
