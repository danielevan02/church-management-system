# Deployment Runbook

Step-by-step guide for deploying ChMS for a new church. Two recommended paths:

- **Path A — Vercel + Neon** (easiest, free tier covers small churches)
- **Path B — Self-hosted Docker** (full control, runs on any VPS)

Pick one — don't mix.

---

## Pre-flight checklist

Before starting, gather from the church:

- [ ] **Church name** (full + short / abbreviation)
- [ ] **Domain** (e.g. `gereja-anu.id`) — DNS access required
- [ ] **Logo** (SVG preferred, plus a square PNG ≥ 512×512 for PWA icons)
- [ ] **Brand color** (hex, used as theme color)
- [ ] **Bank info** for offline giving (name, account number, account holder)
- [ ] **WhatsApp number** for giving confirmations (optional)
- [ ] **Initial admin** email (lead pastor or admin staff)

---

## Path A — Vercel + Neon

### 1. Provision the database (Neon)

1. Sign up at [neon.tech](https://neon.tech) and create a project named after the church.
2. From the dashboard, copy the **pooled connection string** → `DATABASE_URL`.
3. Copy the **direct connection string** (untick "Pooled connection") → `DIRECT_URL`.
4. Note: Neon's free tier includes 0.5 GB storage + autoscale compute. Sufficient for churches under ~5k members.

### 2. Deploy to Vercel

1. Push this repo to a GitHub account the church or you control.
2. Sign up at [vercel.com](https://vercel.com), import the GitHub repo.
3. In the project's **Settings → Environment Variables**, paste every value from `.env.example` (replace placeholders with real values). Critical:
   - `DATABASE_URL`, `DIRECT_URL` from Neon
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `AUTH_URL` — leave blank initially; set to `https://<your-domain>` after step 4
   - `AUTH_TRUST_HOST=true`
   - `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`
   - All `NEXT_PUBLIC_CHURCH_*` branding vars
4. Trigger the first deploy. Build will fail on first run because the DB schema isn't there yet — that's expected. Move to step 3.

### 3. Migrate + seed the database

Run from your local machine, pointing at the Neon DB:

```bash
# Export the same DATABASE_URL / DIRECT_URL temporarily
export DATABASE_URL="..."
export DIRECT_URL="..."

# Apply migrations to production
pnpm prisma migrate deploy

# Seed the initial admin (uses INITIAL_ADMIN_EMAIL / _PASSWORD)
INITIAL_ADMIN_EMAIL="admin@..." INITIAL_ADMIN_PASSWORD="..." pnpm prisma db seed
```

After this, redeploy on Vercel — the build should succeed.

### 4. Custom domain

1. In Vercel **Settings → Domains**, add `<your-church-domain>`.
2. Follow Vercel's DNS instructions (usually a CNAME to `cname.vercel-dns.com` or A records).
3. Once SSL is provisioned, update `AUTH_URL=https://<your-church-domain>` in env vars and redeploy.
4. Verify sign-in works at the live URL.

### 5. Replace branding assets

Per [`docs/customization.md`](./customization.md), replace:
- `public/logo.svg` (header, sidebar)
- `public/qris.png` (giving page, optional)
- PWA icons are auto-generated from `NEXT_PUBLIC_CHURCH_SHORT_NAME` and `NEXT_PUBLIC_PRIMARY_COLOR` — replace `src/app/icon-{192,512,maskable}.png/route.tsx` if the church wants custom artwork.

---

## Path B — Self-hosted Docker

Use this if the church prefers on-prem hosting or has data-residency rules.

### 1. Provision the host

A modest VPS (2 vCPU, 4 GB RAM, 40 GB SSD) handles a church of ~5k members. Recommendations: Hetzner, DigitalOcean, Biznet (ID).

```bash
# On the server
sudo apt update && sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
git clone <your-repo-url> /opt/chms
cd /opt/chms
```

### 2. Postgres

The bundled `docker-compose.yml` runs Postgres in dev. For production, **use a separate dedicated Postgres instance** (managed or another container with strict volumes + backup):

```yaml
# /opt/chms/docker-compose.prod.yml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: chms
      POSTGRES_PASSWORD: <strong-password>
      POSTGRES_DB: chms_prod
    volumes:
      - /var/lib/chms-pg:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
```

Then `DATABASE_URL=postgresql://chms:<password>@localhost:5432/chms_prod`.

### 3. App container

Add a `Dockerfile` (not bundled — write per-deployment):

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm prisma generate && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["pnpm", "start"]
```

Run with all env vars from `.env.example` set in your environment.

### 4. Migrate + seed

```bash
docker compose -f docker-compose.prod.yml exec app pnpm prisma migrate deploy
docker compose -f docker-compose.prod.yml exec app pnpm prisma db seed
```

### 5. Reverse proxy + HTTPS

Configure nginx in front of the container, then:

```bash
sudo certbot --nginx -d <your-church-domain>
```

### 6. Backups

Schedule daily Postgres dumps:

```bash
# /etc/cron.daily/chms-backup
#!/bin/bash
BACKUP_DIR=/var/backups/chms
mkdir -p "$BACKUP_DIR"
docker compose -f /opt/chms/docker-compose.prod.yml exec -T postgres \
  pg_dump -U chms chms_prod | gzip > "$BACKUP_DIR/chms-$(date +%F).sql.gz"
find "$BACKUP_DIR" -mtime +30 -delete
```

Mirror these dumps offsite (S3, Backblaze, Wasabi).

---

## Post-deploy verification

Run through this list once the app is live:

- [ ] Sign in as initial admin succeeds
- [ ] Change admin password (Settings → Users)
- [ ] Create at least one Service entry (admin/attendance/services/new)
- [ ] Create at least one Member to test the directory
- [ ] Visit `/me/dashboard` — manifest loads, install prompt appears (Chrome/Edge desktop)
- [ ] DevTools → Application → Service Worker shows `sw.js` activated
- [ ] Toggle airplane mode and reload — `/me/offline` fallback renders
- [ ] Sign-in via WhatsApp OTP shows the OTP in server logs (stub provider) — switch to real Fonnte before launch (see `WHATSAPP_PROVIDER`)
- [ ] All `NEXT_PUBLIC_CHURCH_*` values appear in the UI (header, footer, manifest)

---

## Rotating credentials

| Credential | Rotate when | How |
|---|---|---|
| `AUTH_SECRET` | Quarterly or on suspected compromise | Generate new value, redeploy. All sessions invalidated. |
| Initial admin password | Immediately after first sign-in | Settings → Users → edit |
| Postgres password | Yearly or on compromise | Update DB user, update `DATABASE_URL` / `DIRECT_URL`, redeploy |

---

## Upgrading the deployed app

```bash
git pull origin main
pnpm install
pnpm prisma migrate deploy   # apply any new migrations
# rebuild & redeploy (Vercel: auto on push to main; Docker: rebuild image)
```

Always test migrations on a staging copy of the prod DB before applying to production. `prisma migrate deploy` is non-destructive but a backup before any deploy is mandatory.
