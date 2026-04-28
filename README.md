# Church Management System (ChMS)

Single-tenant church management web app for Indonesian churches. One deployment serves one church — no multi-tenant database isolation, no SaaS billing layer. The codebase ships configurable so each deployment can be re-skinned via environment variables and asset replacement.

## Modules

- **Members & households** — directory, profile, life-cycle status
- **Attendance** — service definitions, QR/manual check-in, weekly trends
- **Giving** — manual records (cash / transfer / QRIS), funds, member statements
- **Cell groups** — komsel directory, leader assignments, weekly reports
- **Events** — RSVP-able events with capacity & waitlist
- **Communications** — WhatsApp/email templates, broadcast campaigns, audience filters
- **Volunteers** — teams, positions, scheduled assignments
- **Children's check-in** — guardian-linked check-in/out at services
- **Pastoral care** — visit log, follow-up scheduling
- **Discipleship** — milestone tracking per member
- **Prayer requests** — public/private submissions, status tracking
- **Reports & dashboards** — KPI strip, snapshots per module
- **Member portal** — installable PWA with QR, profile, giving, events, prayer

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript strict |
| Database | PostgreSQL 16 + Prisma 6 |
| Auth | Auth.js v5 (credentials + WhatsApp OTP) |
| UI | Tailwind 4 + shadcn/ui (New York) |
| i18n | next-intl (id default, en optional) |
| PWA | Vanilla service worker, scoped to member portal |

For full conventions, see [`CLAUDE.md`](./CLAUDE.md). For per-feature spec see `PROJECT_BUILD_GUIDE.md` (if present).

## Quick start (development)

**Prerequisites**: Node 20+, pnpm 9+, Docker (for local Postgres).

```bash
# 1. Clone & install
pnpm install

# 2. Start local Postgres
docker compose up -d

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local — at minimum, set DATABASE_URL to:
#   postgresql://chms:chms_dev_password@localhost:5432/chms_dev
# Generate AUTH_SECRET with: openssl rand -base64 32

# 4. Migrate + seed (creates initial admin)
pnpm prisma migrate dev
pnpm prisma db seed

# 5. Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/auth/sign-in` with `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` from `.env.local`.

## Common commands

```bash
pnpm dev                 # Dev server (Turbopack)
pnpm build               # Production build
pnpm start               # Run production build
pnpm lint                # ESLint
pnpm typecheck           # tsc --noEmit
pnpm prisma studio       # GUI DB inspector
pnpm prisma migrate dev  # Create + apply migration
pnpm prisma db seed      # Run seed (idempotent for admin)
docker compose up -d     # Start local Postgres
docker compose down      # Stop Postgres
```

## Deploying for a church

See [`docs/deployment.md`](./docs/deployment.md) for the step-by-step runbook (Vercel + Neon, or self-hosted Docker), and [`docs/customization.md`](./docs/customization.md) for branding and feature flag changes per deployment.

## Project structure

```
prisma/         schema, migrations, seed
messages/       i18n strings (id.json, en.json)
public/         static assets, service worker
src/
  app/[locale]/(public)    landing, auth, public attend & give
  app/[locale]/(admin)     admin/staff/leader UI under /admin
  app/[locale]/(member)    jemaat portal under /me (PWA)
  app/[locale]/api         route handlers (webhooks, public)
  components/admin         admin-area UI
  components/member        member-area UI
  components/ui            shadcn primitives — DO NOT edit by hand
  config/                  church.ts, features.ts, nav.ts
  lib/                     prisma, auth, i18n, permissions
  server/actions/          server actions per feature
  server/queries/          read-side helpers (RSC-friendly)
```

## Conventions

- **Server-first**: Server Components + Server Actions by default. `"use client"` only when necessary.
- **Validation**: Every external input goes through Zod, colocated with the action.
- **Auth at the boundary**: Every server action / route handler checks role before doing work.
- **i18n discipline**: No hardcoded user-facing strings — keys in `messages/{id,en}.json`.
- **Single-tenant**: No `tenant_id` columns. One deployment = one church.
- **Feature flags**: `src/config/features.ts` toggles modules per deployment.

See [`CLAUDE.md`](./CLAUDE.md) for the full convention reference.
