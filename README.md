# Church Management System (ChMS)

Single-tenant church management web app for Indonesian churches. One deployment serves one church — no multi-tenant database isolation, no SaaS billing layer. The codebase ships configurable so each deployment can be re-skinned via environment variables and asset replacement.

## Modules

- **Members & households** — directory, profile, life-cycle status
- **Attendance** — service definitions, QR/manual check-in, weekly trends
- **Giving** — manual records (cash / transfer / QRIS), funds, member statements
- **Cell groups** — komsel directory, leader assignments, weekly reports
- **Events** — RSVP-able events with capacity & waitlist
- **Announcements** — in-app inbox + push notification fan-out
- **Devotionals (renungan)** — daily quiet-time content with verse + WYSIWYG body
- **Volunteers** — teams, positions, scheduled assignments
- **Children's check-in** — guardian-linked check-in/out at services
- **Pastoral care** — visit log, follow-up scheduling
- **Discipleship** — milestone tracking per member
- **Prayer requests** — public/private submissions, status tracking
- **Reports & dashboards** — KPI strip, snapshots per module
- **Member portal** — installable PWA with QR, profile, giving, events, push notifications

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions, Turbopack) |
| Language | TypeScript strict |
| Database | PostgreSQL 16 + Prisma 6 (Neon in prod) |
| Auth | Auth.js v5 — staff via email+password, member via phone+PIN |
| UI | Tailwind 4 + shadcn/ui (New York) |
| Markdown | TipTap WYSIWYG editor → markdown storage → react-markdown render |
| Push | Web Push API + VAPID (browser-native, free) |
| i18n | next-intl (id default, en optional) |
| PWA | Service worker scoped to member portal with offline shell + push handlers |
| Hosting | Vercel — auto-runs `prisma migrate deploy` on every build |

For full conventions, see [`CLAUDE.md`](./CLAUDE.md). For developer workflow notes, see [`DEVELOPMENT.md`](./DEVELOPMENT.md).

## Quick start (development)

**Prerequisites**: Node 20+, pnpm 10+, a Postgres database (Neon free tier or local).

```bash
# 1. Clone & install
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env:
#   - DATABASE_URL (Neon connection string or local Postgres)
#   - AUTH_SECRET (generate with: openssl rand -base64 32)
#   - NEXT_PUBLIC_CHURCH_NAME / SHORT_NAME / DOMAIN
#   - INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD

# 3. Migrate + seed (creates initial admin)
pnpm db:migrate
pnpm db:seed

# 4. Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/auth/sign-in` with `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` from `.env`.

## Common commands

```bash
pnpm dev                 # Dev server (Turbopack)
pnpm build               # Production build (auto: prisma migrate deploy → generate → next build)
pnpm start               # Run production build
pnpm lint                # ESLint
pnpm typecheck           # tsc --noEmit
pnpm db:studio           # GUI DB inspector
pnpm db:migrate          # Create + apply migration in dev
pnpm db:deploy           # Apply pending migrations (prod / pre-merge check)
pnpm db:seed             # Run seed (idempotent for admin)
pnpm icons               # Regenerate PWA icons from scripts/source-logo.png
```

## Documentation

All docs live in [`docs/`](./docs/):

| Doc | Audience |
|---|---|
| [User guide — admin/staff](./docs/user-guide-admin.md) | Pengurus gereja, panduan lengkap per modul + cookbook |
| [User guide — jemaat](./docs/user-guide-jemaat.md) | Anggota jemaat, panduan portal `/me` + FAQ |
| [Deployment](./docs/deployment.md) | Step-by-step deploy untuk gereja baru (Vercel+Neon / Docker) |
| [Customization](./docs/customization.md) | Branding, feature flags, icon PWA per deployment |
| [Index dokumentasi](./docs/README.md) | Navigasi semua dokumen |

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
