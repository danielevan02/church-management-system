# CLAUDE.md

> **Purpose**: This file is the operational manual for Claude Code (and any AI assistant) working on this project. Read this first before any task. For full feature specifications, see `PROJECT_BUILD_GUIDE.md`.

---

## Project Identity

**Name**: Church Management System (ChMS)
**Type**: Web application (multi-page, SSR/RSC)
**Target market**: Indonesian churches (with multi-language support)
**Business model**: Single-tenant codebase. The developer sells & deploys this as a one-time custom project per church. No subscription/billing logic in the codebase.

---

## Tech Stack (LOCKED)

Do **not** change these without explicit user approval.

| Layer              | Technology                                  | Version  |
|--------------------|---------------------------------------------|----------|
| Framework          | Next.js (App Router)                        | 15.x     |
| Language           | TypeScript (strict mode)                    | 5.x      |
| Runtime            | Node.js                                     | 20+ LTS  |
| Package manager    | pnpm                                        | 9.x      |
| Database           | PostgreSQL                                  | 16       |
| ORM                | Prisma                                      | 6.x      |
| Authentication     | Auth.js (NextAuth) v5 beta                  | 5.x beta |
| Validation         | Zod                                         | 4.x      |
| Forms              | React Hook Form + @hookform/resolvers       | latest   |
| Data fetching      | TanStack Query (client) + Server Actions    | 5.x      |
| Styling            | Tailwind CSS + shadcn/ui (New York style)   | 4.x      |
| Icons              | lucide-react                                | latest   |
| Toast / notif      | sonner                                      | latest   |
| Internationalization | next-intl                                 | 4.x      |
| Date utilities     | date-fns                                    | 4.x      |
| Payment (later)    | Midtrans (Snap + Core API)                  | -        |
| WhatsApp (later)   | Fonnte API (or WhatsApp Business Cloud API) | -        |

**PWA is deferred.** Build a regular web app first. Architect routing, data fetching, and offline-friendly patterns so PWA conversion later is non-disruptive.

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
      sign-in/
      verify-otp/
  (admin)/                           # Role: ADMIN | STAFF | LEADER (varies by feature)
    admin/
      dashboard/
      members/
      attendance/
      giving/
      cell-groups/
      events/
      communications/
      volunteers/
      children/
      pastoral/
      discipleship/
      settings/
  (member)/                          # Role: MEMBER (logged-in jemaat)
    me/
      dashboard/
      qr/                            # Personal attendance QR
      giving/                        # History + give now
      events/                        # My registrations
      cell-group/                    # My komsel info
      profile/
      prayer-requests/
```

### Auth model

Two distinct user-facing login flows:
1. **Staff/Admin login**: Email + password (with magic link as alternative)
2. **Member (jemaat) login**: WhatsApp OTP only (phone number → 6-digit code)

The `User` model carries a `role` enum: `SUPER_ADMIN | ADMIN | STAFF | LEADER | MEMBER`.

### API design
- **Default to Server Actions** for mutations (forms, CRUD).
- Use **Route Handlers (`/api/*`)** only for:
  - Webhooks (Midtrans, WhatsApp incoming)
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
│   │   ├── whatsapp.ts              # WhatsApp client (added at communications module)
│   │   ├── midtrans.ts              # Midtrans client (added at giving module)
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
├── CLAUDE.md                        # This file
├── PROJECT_BUILD_GUIDE.md           # Full spec
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
- Soft-delete with `deletedAt: DateTime?` for entities the user might "delete" but should be recoverable (members, giving records, etc.).
- Hard-delete OK for ephemeral things (sessions, OTP codes, expired invitations).
- Use enums for closed sets of values; never magic strings.
- All foreign keys with `onDelete: Restrict` by default — change explicitly when cascade is desired.

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
pnpm dev                        # Start Next.js dev server
docker compose up -d            # Start local PostgreSQL
docker compose down             # Stop PostgreSQL
docker compose logs -f postgres # Tail PG logs

# Database
pnpm prisma generate            # Regenerate Prisma client
pnpm prisma migrate dev         # Create + apply migration in dev
pnpm prisma migrate deploy      # Apply pending migrations (prod)
pnpm prisma studio              # GUI for inspecting DB
pnpm prisma db seed             # Run seed script

# Build & lint
pnpm build                      # Production build
pnpm lint                       # ESLint
pnpm typecheck                  # tsc --noEmit (add to package.json scripts)

# Adding shadcn components
pnpm dlx shadcn@latest add <component>
```

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
  whatsappBroadcast: true,
} as const;
```

UI components must respect feature flags — both for navigation entries and for direct route access (return `notFound()` if the feature is off).

---

## Authentication Flow Details

### Member (jemaat) login — WhatsApp OTP
1. User enters phone number (E.164 normalized — assume `+62` if no country code).
2. Server checks: does a `Member` exist with this phone? If yes, generate OTP. If no, behavior depends on church policy (closed registration vs. open). Default: closed; show "Phone not registered. Contact your church admin."
3. Generate 6-digit OTP, store hashed in `OtpCode` table with 5-min expiry.
4. Send via WhatsApp.
5. User enters OTP. On success, create session.
6. Rate limit: max 3 OTP requests per phone per 15 min. Max 5 verification attempts per OTP.

### Staff / Admin login — Email + password
- Auth.js Credentials provider with bcrypt password hashing.
- Magic link as fallback (Auth.js Email provider).
- Initial admin created via seed script using `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` env vars.

### Session
- Auth.js JWT strategy (no session table needed initially; can switch to DB sessions later).
- Session payload includes `userId`, `role`, `memberId` (if linked to a Member record).

---

## Authorization (RBAC)

Roles ordered most → least privileged:

| Role         | Description                                          |
|--------------|------------------------------------------------------|
| SUPER_ADMIN  | Developer / handover account. Owns settings, users.  |
| ADMIN        | Lead pastor / senior staff. Full operational access. |
| STAFF        | Regular staff. Most operations except settings.      |
| LEADER       | Cell group leader. Limited to their group's data.    |
| MEMBER       | Jemaat. Self-service only.                           |

Helper: `requireRole(role, allowed: Role[])` throws/returns false if insufficient.
Helper: `canAccessCellGroup(user, groupId)` for leader-scoped checks.

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

- Read `PROJECT_BUILD_GUIDE.md` for any feature you haven't implemented yet.
- Use Server Components and Server Actions wherever possible.
- Validate every input with Zod.
- Check role at every action / route.
- Use `revalidatePath()` after mutations affecting cached pages.
- Add translation keys for every user-facing string.
- Respect feature flags in `src/config/features.ts`.
- Run `pnpm typecheck` before considering a feature "done".
- Soft-delete user-facing entities; hard-delete only ephemeral ones.

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

1. Check `PROJECT_BUILD_GUIDE.md` for the relevant feature spec.
2. Check `prisma/schema.prisma` for the data model.
3. Check `src/config/` for project-level decisions.
4. If still ambiguous, **ask the user** — do not guess on architectural decisions.
