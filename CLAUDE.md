# CLAUDE.md

> **Purpose**: This file is the operational manual for Claude Code (and any AI assistant) working on this project. Read this first before any task.

---

## Project Identity

**Name**: Church Management System (ChMS)
**Type**: Web application (multi-page, SSR/RSC)
**Target market**: Indonesian churches (with multi-language support)
**Business model**: Single-tenant codebase. The developer sells & deploys this as a one-time custom project per church. No subscription/billing logic in the codebase.

---

## Tech Stack (LOCKED)

Do **not** change these without explicit user approval.

| Layer                | Technology                                | Version  |
|----------------------|-------------------------------------------|----------|
| Framework            | Next.js (App Router, Turbopack)           | 15.x     |
| Language             | TypeScript (strict mode)                  | 5.x      |
| Runtime              | Node.js                                   | 20+ LTS  |
| Package manager      | pnpm                                      | 10.x     |
| Database             | PostgreSQL (Neon in prod)                 | 16       |
| ORM                  | Prisma                                    | 6.x      |
| Authentication       | Auth.js (NextAuth) v5 beta                | 5.x beta |
| Validation           | Zod                                       | 4.x      |
| Forms                | React Hook Form + @hookform/resolvers     | latest   |
| Data fetching        | TanStack Query (client) + Server Actions  | 5.x      |
| Styling              | Tailwind CSS + shadcn/ui (New York style) | 4.x      |
| Typography (markdown)| @tailwindcss/typography                   | 0.5.x    |
| Icons                | lucide-react                              | latest   |
| Toast / notif        | sonner                                    | latest   |
| Internationalization | next-intl                                 | 4.x      |
| Date utilities       | date-fns + date-fns-tz                    | 4.x      |
| Markdown render      | react-markdown                            | 10.x     |
| Markdown WYSIWYG     | TipTap + tiptap-markdown                  | 3.x      |
| Image processing     | sharp (one-shot icon generator)           | 0.34.x   |
| QR scanning          | html5-qrcode                              | 2.3.x    |
| QR generation        | qrcode                                    | 1.5.x    |
| Push notifications   | web-push (VAPID, browser Push API)        | 3.6.x    |
| Hosting              | Vercel (auto-deploys main, runs prisma migrate deploy on build) | - |
| Payment (deferred)   | Midtrans (Snap + Core API)                | -        |

**Member portal is a PWA.** Service worker at `public/sw.js`, manifest at `app/manifest.webmanifest/route.ts`, install prompt + push subscribe banner in `/me` layout. Service worker scope is `/`, but offline shell + push handlers only target `/me/*` paths.

---

## High-Level Architecture

### Single-tenant philosophy
- Every deployment = one church. Hard-coded assumption.
- Church-specific config (name, logo, colors, feature flags) comes from **environment variables** + a `src/config/church.ts` module.
- **No `tenant_id` / `church_id` columns** in any table. There is implicitly only one church per database.

### Routing structure
```
/[locale]/                           # Locale prefix (id | en), default id
  (public)/                          # No auth required
    page.tsx                         # Landing
    attend/[eventId]/                # Public attendance form (visitor-friendly)
    give/                            # Public giving (anonymous OK)
    auth/                            # Login flows
      sign-in/                       # Staff email+password OR member phone+PIN
  (admin)/                           # Role: ADMIN | STAFF | LEADER (varies by feature)
    admin/
      dashboard/
      members/
      households/
      cell-groups/
      attendance/
      giving/
      events/
      announcements/                 # In-app inbox + push fan-out
      devotionals/                   # Daily renungan
      volunteers/
      children/
      pastoral/
      prayer-requests/
      discipleship/
      reports/
      settings/
  (member)/                          # Role: MEMBER (logged-in jemaat)
    me/
      dashboard/                     # Hero card "Renungan Hari Ini" + quick actions
      announcements/                 # Inbox list + detail
      devotionals/                   # Renungan archive + detail
      qr/                            # Personal attendance QR
      check-in/                      # Self check-in (camera scans service QR)
      giving/                        # History + give now
      events/                        # My registrations
      cell-group/                    # My komsel info
      volunteer/                     # My serving schedule
      discipleship/                  # My milestones
      prayer-requests/
      children/                      # As a guardian, manage children
      profile/                       # Edit profile + change PIN + push toggle
      offline/                       # Service-worker offline fallback
```

### Auth model

Two distinct user-facing login flows, both surface in `/auth/sign-in`:
1. **Staff / Admin login**: Email + password (Auth.js Credentials provider, bcrypt hash on `User.passwordHash`).
2. **Member (jemaat) login**: Phone + 4–6 digit PIN (Auth.js Credentials provider, bcrypt hash on `User.pinHash`). Lenient throttling via `PinAttempt` table — after 10 failed attempts in 15 minutes, brute-force is throttled with a 30-second backoff (no permanent lockout, designed for elderly users).

The `User` model carries a `role` enum: `ADMIN | STAFF | LEADER | MEMBER`.

### API design
- **Default to Server Actions** for mutations (forms, CRUD).
- Use **Route Handlers (`/api/*`)** only for:
  - Webhooks (Midtrans when wired up, push subscription endpoints if any external)
  - Public endpoints called from external systems
  - Endpoints that require streaming
- Always validate inputs with **Zod schemas** colocated with the action.
- Always check authorization at the action/route level — never trust the client.

---

## Directory Structure

```
church-management-system/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                      # Dev seed data
│   └── migrations/
├── messages/                        # i18n translation files
│   ├── id.json
│   └── en.json
├── public/
│   └── (logos, icons, static assets — branding configurable)
├── src/
│   ├── app/
│   │   ├── [locale]/                # Locale-aware routes
│   │   │   ├── (public)/
│   │   │   ├── (admin)/
│   │   │   ├── (member)/
│   │   │   └── layout.tsx
│   │   ├── api/                     # Route handlers (webhooks etc.)
│   │   ├── globals.css
│   │   └── layout.tsx               # Root layout
│   ├── components/
│   │   ├── ui/                      # shadcn primitives — DO NOT modify by hand
│   │   ├── admin/                   # Admin-area components
│   │   ├── member/                  # Member-area components
│   │   └── shared/                  # Cross-area components (logo, navbar shells)
│   ├── lib/
│   │   ├── prisma.ts                # Prisma client singleton
│   │   ├── auth.ts                  # Auth.js config + helpers
│   │   ├── utils.ts                 # cn() + small utils (from shadcn)
│   │   ├── i18n/
│   │   │   ├── routing.ts           # next-intl routing
│   │   │   ├── request.ts           # next-intl request config
│   │   │   └── navigation.ts        # Localized Link/redirect/usePathname
│   │   ├── phone.ts                 # E.164 normalization for Indonesian phone numbers
│   │   ├── pin.ts                   # PIN hash, verify, throttle
│   │   ├── push.ts                  # Server-side web-push fan-out
│   │   ├── markdown.ts              # stripMarkdown + excerpt utilities
│   │   ├── datetime.ts              # Jakarta timezone helpers
│   │   ├── midtrans.ts              # Midtrans client (deferred)
│   │   └── permissions.ts           # RBAC helpers
│   ├── server/
│   │   ├── actions/                 # Server actions, grouped by feature
│   │   │   ├── members/
│   │   │   ├── attendance/
│   │   │   ├── giving/
│   │   │   └── ...
│   │   └── queries/                 # Read-side query helpers (RSC-friendly)
│   ├── hooks/
│   ├── types/                       # Shared TS types (NOT from Prisma — Prisma types come from @/lib/prisma)
│   ├── config/
│   │   ├── church.ts                # Per-deployment church identity
│   │   ├── features.ts              # Feature flags
│   │   └── nav.ts                   # Navigation definitions
│   └── middleware.ts                # next-intl + auth middleware
├── .env.local                       # Local env (gitignored)
├── .env.example                     # Committed reference
├── docker-compose.yml               # Local PostgreSQL
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── components.json                  # shadcn config
├── scripts/
│   ├── generate-icons.cjs           # PWA + push badge icon generator (sharp)
│   └── source-logo.png              # Source logo, replaced per deployment
├── CLAUDE.md                        # This file
├── DEVELOPMENT.md                   # Workflow notes (migrations, scenarios)
├── docs/                            # End-user manuals + deployment guide
└── README.md
```

---

## Code Conventions

### TypeScript
- `strict: true`. No `any` unless absolutely justified with a comment.
- Prefer `type` over `interface` except for class-like contracts.
- Use `import type { ... }` for type-only imports.
- Model IDs: prefer `string` (CUIDs from Prisma) — never `number`.

### React
- **Server Components by default.** Add `"use client"` only when needed (state, effects, browser APIs, event handlers in interactive components).
- Server Actions live in `src/server/actions/<feature>/<action>.ts` and are imported into components.
- Forms: React Hook Form + Zod resolver + Server Action handler.
- Loading states: use `loading.tsx` and `<Suspense>` boundaries; for client mutations use `useTransition`.
- Error states: `error.tsx` per route segment; `notFound()` for 404.

### File & symbol naming
- **Files**: `kebab-case` (e.g. `member-list.tsx`, `create-member.ts`).
- **React components**: `PascalCase` (e.g. `MemberList`).
- **Functions / variables**: `camelCase`.
- **Constants**: `SCREAMING_SNAKE_CASE`.
- **Types / interfaces / enums**: `PascalCase`.
- **Database tables**: `snake_case` plural (`members`, `cell_groups`).
- **Database columns**: `snake_case` (`first_name`, `created_at`).
- **Prisma models**: `PascalCase` singular (`Member`, `CellGroup`).
- **Routes**: `kebab-case` (e.g. `/admin/cell-groups`).

### Imports order
1. Node / external packages
2. `@/` aliased internal imports
3. Relative imports
4. Type-only imports (grouped at the bottom of each section)

Example:
```ts
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

import { memberSchema } from "./schemas";

import type { Member } from "@prisma/client";
```

### Server Actions pattern
Every server action follows this pattern:

```ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

const inputSchema = z.object({ /* ... */ });

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createMember(
  raw: z.infer<typeof inputSchema>
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session) return { ok: false, error: "UNAUTHORIZED" };
  requireRole(session.user.role, ["ADMIN", "STAFF"]);

  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const member = await prisma.member.create({ data: parsed.data });
    revalidatePath("/admin/members");
    return { ok: true, data: { id: member.id } };
  } catch (e) {
    console.error("[createMember]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
```

### Database conventions
- Every table has `id` (CUID), `createdAt`, `updatedAt` (managed by Prisma).
- Soft-delete with `deletedAt: DateTime?` for entities the user might "delete" but should be recoverable (members, giving records, announcements, devotionals, etc.).
- Hard-delete OK for ephemeral things (sessions, expired pin attempts, push subscriptions when the endpoint 410s).
- Use enums for closed sets of values; never magic strings.
- All foreign keys with `onDelete: Restrict` by default — change explicitly when cascade is desired.
- Date/time stored as UTC (`DateTime` columns). Display in Jakarta time via helpers in `src/lib/datetime.ts` (`formatJakarta`, `parseJakartaInput`, `toJakartaInput`). Never call `format(date, "...HH:mm...")` from `date-fns` directly — it uses server local time and produces wrong results on Vercel (UTC).

### Validation
- Every external input (form, API, query param) goes through Zod first.
- Schemas live alongside the action/route they serve, NOT in a global validators file.
- Re-export shared schemas (e.g. `phoneIdSchema`) from `src/lib/validation/`.

### Error handling
- Server Actions return discriminated unions (see pattern above) — never throw to the client.
- Route Handlers return JSON with `{ error: string }` and proper status codes.
- Log server-side errors with a tag prefix: `console.error("[featureName]", err)`.

### Comments
- Code should be self-explanatory. Comments are for **why**, not **what**.
- Add JSDoc on exported functions that are non-trivial.
- Mark TODOs with `// TODO(short-context): ...`.

---

## Common Commands

```bash
# Development
pnpm dev                        # Start Next.js dev server (Turbopack)

# Database
pnpm db:generate                # Regenerate Prisma client
pnpm db:migrate                 # Create + apply migration in dev
pnpm db:deploy                  # Apply pending migrations (prod / pre-merge verification)
pnpm db:studio                  # GUI for inspecting DB
pnpm db:seed                    # Run seed (idempotent for initial admin)
pnpm db:reset                   # ⚠️ DESTRUCTIVE: drop + recreate all tables (dev only)

# Build & lint
pnpm build                      # Production build (auto: prisma migrate deploy → generate → next build)
pnpm lint                       # ESLint
pnpm typecheck                  # tsc --noEmit

# Per-deployment branding
pnpm icons                      # Regenerate PWA + push badge icons from scripts/source-logo.png

# Adding shadcn components
pnpm dlx shadcn@latest add <component>
```

The build script runs `prisma migrate deploy && prisma generate && next build` — Vercel auto-applies any pending migrations on every deploy. See `DEVELOPMENT.md` for full migration workflow.

---

## Internationalization (next-intl)

- Two locales: `id` (default) and `en`.
- All user-facing strings live in `messages/{id|en}.json`.
- **Never hardcode user-facing text** in components — even temporary placeholders. If a translation isn't ready, add a key with the Indonesian text and TODO marker.
- Translation key naming: `domain.subdomain.key` (e.g. `members.list.empty_state`, `auth.otp.expired`).
- Use `useTranslations()` in client components and `getTranslations()` in server components.
- Locale switcher in user settings; default determined by browser (Accept-Language) on first visit, then sticky.

---

## Configuration System (Per-Church Customization)

The codebase ships configurable so each deployment can be re-skinned without code changes.

### Environment-based config
Variables prefixed `NEXT_PUBLIC_CHURCH_*` configure branding:
- `NEXT_PUBLIC_CHURCH_NAME` — Full name shown in headers
- `NEXT_PUBLIC_CHURCH_SHORT_NAME` — Compact name / abbreviation
- `NEXT_PUBLIC_CHURCH_DOMAIN` — Public domain
- `NEXT_PUBLIC_DEFAULT_LOCALE` — `id` or `en`
- `NEXT_PUBLIC_PRIMARY_COLOR` — Hex color for theme accent

### Asset-based config
- `public/logo.svg`, `public/logo-dark.svg`, `public/favicon.ico` — replaced per deployment.
- `public/og-image.png` — social share image.

### Feature flags (`src/config/features.ts`)
A typed object that toggles modules on/off. Default = all on. Some churches may disable e.g. children's check-in if they don't have that ministry.

```ts
export const features = {
  childrensCheckIn: true,
  pastoralCare: true,
  discipleship: true,
  volunteers: true,
  giving: true,
  selfCheckIn: true,
  devotionals: true,
} as const;
```

UI components must respect feature flags — both for navigation entries and for direct route access (return `notFound()` if the feature is off). Push notifications are gated separately by VAPID env vars (when unset, push is silently disabled — announcements still work as in-app inbox).

---

## Authentication Flow Details

Closed-registration model: a `User` record is always created by an admin (manually in `/admin/settings/users` or as part of creating a `Member`). There is no public sign-up flow.

### Member (jemaat) login — Phone + PIN
1. User enters phone number. Normalized via `normalizePhone` in `src/lib/phone.ts` (assumes `+62` Indonesian if no country code).
2. User enters their 4–6 digit PIN.
3. Server hashes the PIN with bcrypt and compares against `User.pinHash`.
4. **Throttle (no lockout)**: `PinAttempt` table records every failed attempt. After 10 failures within 15 minutes for the same phone, the next failed verify returns a 30-second cooldown. Successful verify clears recent attempts. Designed to be lenient for elderly users — never permanently locks them out, just slows brute force.
5. Members set their PIN initially via the admin UI ("Reset PIN" in `/admin/members/[id]` or the user list); they can change their own PIN at `/me/profile`.
6. Helper functions: `signInWithPin`, `setMemberPin`, `changeOwnPin`, `hashPin`, `isValidPinFormat` — all in `src/lib/pin.ts`.

### Staff / Admin login — Email + password
- Auth.js Credentials provider with bcrypt password hashing on `User.passwordHash`.
- Initial admin created via seed script using `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` env vars.

### Session
- Auth.js JWT strategy (no session table by default; can switch to DB sessions later).
- Session payload includes `userId`, `role`, `memberId` (if linked to a Member record).
- `requireMemberSession()` and `requireAdminSession()` helpers in `src/lib/session.ts` for layout-level guards.

---

## Authorization (RBAC)

Roles ordered most → least privileged:

| Role     | Description                                                          |
|----------|----------------------------------------------------------------------|
| ADMIN    | Lead pastor / senior staff. Full operational access incl. settings.  |
| STAFF    | Regular staff. Most operations; settings restricted.                 |
| LEADER   | Cell group leader. Limited to their own group's data.                |
| MEMBER   | Jemaat. Self-service only via `/me/*`.                               |

Helpers (in `src/lib/permissions.ts`):
- `requireRole(role, allowed: Role[])` — throws if insufficient.
- `hasAtLeastRole(role, threshold)` — boolean check for guards in pages.
- `canAccessCellGroup(user, groupId)` — leader-scoped check.

**Always** check role at the server-action / route-handler boundary. UI hiding is not security.

---

## Git Conventions

- Branches: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`.
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`).
- Keep commits scoped — one logical change per commit.
- Never commit `.env.local`, `node_modules/`, build artifacts.
- Squash-merge PRs to `main` with a clean conventional commit message.

---

## DO ✅

- Use Server Components and Server Actions wherever possible.
- Validate every input with Zod.
- Check role at every action / route.
- Use `revalidatePath()` after mutations affecting cached pages.
- Add translation keys for every user-facing string in **both** `messages/id.json` and `messages/en.json`.
- Respect feature flags in `src/config/features.ts` — both nav entries and direct route access (`notFound()` if off).
- Run `pnpm typecheck` and `pnpm lint` before considering a feature "done".
- Soft-delete user-facing entities; hard-delete only ephemeral ones.
- Add a `loading.tsx` next to every new `page.tsx` — match the eventual layout shape so there's no jarring shift.
- Format dates with `formatJakarta()` (or other helpers in `src/lib/datetime.ts`), never raw `format()` from `date-fns` for time-of-day.
- Bump `CACHE_VERSION` in `public/sw.js` when you change the service worker — otherwise existing PWA installs won't pick up the new code.

---

## DON'T ❌

- Don't introduce a new dependency without justification — prefer existing ones.
- Don't add `tenant_id` / `church_id` to tables — this is **single-tenant**.
- Don't hardcode the church name, primary color, or any branding.
- Don't bypass auth checks (e.g. "I'll add it later").
- Don't write components that throw uncaught errors to the client.
- Don't use `useEffect` for data fetching when a Server Component / TanStack Query would do.
- Don't use `<form action="...">` with raw URLs — use Server Actions.
- Don't store secrets in `NEXT_PUBLIC_*` variables.
- Don't push without ensuring the build passes locally.
- Don't reflexively reach for state libraries (Zustand, Redux). Server state goes through TanStack Query / RSC; URL state via search params; rare client state via `useState` / `useReducer`.

---

## When Unsure

1. Check `prisma/schema.prisma` for the data model.
2. Check `src/config/` for project-level decisions (features, nav, church identity).
3. Check existing analogous features for patterns — announcements + devotionals are the canonical reference for content-style modules; members is the canonical reference for entity CRUD.
4. Check `DEVELOPMENT.md` for the dev workflow + migration scenarios.
5. If still ambiguous, **ask the user** — do not guess on architectural decisions.
