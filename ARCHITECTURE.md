# Architecture

> **Audience**: maintainers (you, future contributors). For operational rules and DO/DON'T see [CLAUDE.md](./CLAUDE.md).
>
> **Read this first** when you return to the codebase after a break. It is the map. The code is the territory.

---

## 1. Mental model in one minute

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser (RSC streamed HTML + minimal client JS)                    │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  src/app/[locale]/                                                   │
│   ├── (public)/    no auth                                           │
│   ├── (admin)/     ADMIN | STAFF | LEADER                            │
│   └── (member)/    MEMBER                                            │
│                                                                      │
│   page.tsx (Server Component)                                        │
│      └── reads via  src/server/queries/<feature>.ts                  │
│      └── renders form/button that calls                              │
│             src/server/actions/<feature>/<verb>.ts                   │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  src/server/                                                         │
│   ├── queries/   READ — plain async fns, `import "server-only"`      │
│   └── actions/   WRITE — `"use server"`, returns Result<T> union     │
│                                                                      │
│   src/lib/       PURE utilities (auth, prisma, datetime, pin, …)     │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Prisma → Postgres (Neon in prod)                                    │
└─────────────────────────────────────────────────────────────────────┘
```

The two things to internalize:

1. **Reads and writes go through different doors.**
   `queries/` for reads (called directly from Server Components), `actions/` for writes (forms, button handlers). They look similar but the rules are different — see §3.
2. **The browser never talks to Prisma.**
   Every Prisma call is wrapped by either a query (read) or an action (write). The client only sees React components and Server Action invocations.

---

## 2. Walking through one feature end-to-end

Using **Announcements** because it touches everything (form → DB → cache → push fan-out → member view).

### The path of one announcement

```
Admin clicks "Buat pengumuman"
  │
  ▼
src/app/[locale]/(admin)/admin/announcements/new/page.tsx
  └─ React Server Component, renders <AnnouncementForm>
       │
       ▼
   <form> submits to createAnnouncementAction
  │
  ▼
src/server/actions/announcements/create.ts        ← "use server"
  ├─ auth() guard — must be ADMIN | STAFF
  ├─ Zod validation against announcementInputSchema
  ├─ prisma.announcement.create(...)
  ├─ revalidatePath("/admin/announcements")        ← invalidate listings
  ├─ revalidatePath("/me/announcements")
  ├─ revalidatePath("/me/dashboard")
  └─ if publishedAt is now or past:
       sendPushToAllMembers(...)                   ← fire & forget
  │
  ▼  Result<{ id: string }> returned to the form
The form redirects to the detail page on success.

Member's phone receives a push (if they subscribed):
  service worker (public/sw.js) shows notification
  → user taps → /me/announcements/<id>
  │
  ▼
src/app/[locale]/(member)/me/announcements/[id]/page.tsx
  └─ reads via src/server/queries/announcements.ts
  └─ renders markdown body via <MarkdownContent>
```

### What this tells you

- **Server Components read directly from queries.** No `useEffect`, no client-side fetch.
- **Forms submit to Server Actions.** Action does auth → validate → write → revalidate → return Result.
- **Cache invalidation is explicit.** After every write you `revalidatePath` every page that displays the data — admin listing, member listing, dashboard, detail.
- **Side effects (push, audit) are fire-and-forget after the write succeeds.** They never block the user response.

If you understand this one feature, you understand 90% of the codebase. The other 19 features follow the same shape.

---

## 3. Contracts that hold everywhere

### 3a. The Result<T> shape

Every Server Action returns one of:

```ts
type Result<T = void> =
  | { ok: true; data: T }                                  // T = void → just { ok: true }
  | { ok: false; error: string;                            // error is a stable code, not a UI string
      fieldErrors?: Record<string, string[]> };            // optional, for form validation feedback
```

Rules:
- **Never throw to the client.** Wrap Prisma calls in try/catch and return `{ ok: false, error: "INTERNAL_ERROR" }`.
- **Error codes are stable identifiers**, not user-facing strings: `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_FAILED`, `NOT_FOUND`, `INTERNAL_ERROR`. The form maps codes → translated user message.
- **Each action exports its own named Result type** (`CreateMemberResult`, `UpdateUserResult`, …). Don't share a global ActionResult — splits typed channels per call site.

### 3b. The auth gate (top of every action)

```ts
const session = await auth();
if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
try {
  requireRole(session.user.role, ["ADMIN", "STAFF"]);
} catch {
  return { ok: false, error: "FORBIDDEN" };
}
```

Rules:
- **Auth check is the FIRST thing in every action.** Before validation, before reading anything.
- `requireRole` throws (asserts) — that's why it's wrapped in try/catch.
- For finer checks (e.g. "leader can only edit own group") use `canAccessCellGroup` or query the entity yourself.
- **UI hiding is not security.** Always re-check on the server even if the button is hidden client-side.

### 3c. revalidatePath after every write

After a successful mutation, call `revalidatePath()` for **every page** that shows the affected data. Examples:
- Created an announcement → revalidate admin listing, member listing, dashboard, detail.
- Updated a member → revalidate `/admin/members`, `/admin/members/[id]`, and any household pages they belong to.

Forgetting this means the user sees stale data until the next deploy.

### 3d. Soft-delete vs hard-delete

- **Soft-delete** (`deletedAt: DateTime?`) for entities the user might want to restore: members, households, announcements, devotionals, giving records.
  Queries always filter `where: { deletedAt: null }`.
- **Hard-delete** is OK for ephemeral things: PinAttempt rows, expired push subscriptions (returned 404/410 from the push gateway), spam prayer-requests (admin-only override).

### 3e. Times always stored as UTC, displayed via Jakarta helpers

Database columns are `DateTime` (Prisma serializes as UTC). For display:
- Use `formatJakarta(date, pattern)` — never raw `format()` from date-fns. Vercel runs in UTC, so raw `format()` produces wrong wall-clock times.
- For `<input type="datetime-local">`, use `toJakartaInput()` to fill, `parseJakartaInput()` to parse the submitted value.
- `formatJakarta`, `toJakartaInput`, `parseJakartaInput` all live in [src/lib/datetime.ts](./src/lib/datetime.ts).

### 3f. Single-tenant, no church_id

There is exactly **one church per database**. Do NOT add `tenant_id` / `church_id` columns. Per-deployment customization comes from env vars + `src/config/church.ts`.

---

## 4. Folder map (what lives where, why)

### `src/app/[locale]/`
Routes. Locale prefix (`id` | `en`) wraps everything.
- `(public)/` no auth — landing, public attendance, public giving, sign-in.
- `(admin)/` ADMIN | STAFF | LEADER — full CRUD on members, attendance, giving, etc.
- `(member)/` MEMBER — `/me/*` self-service portal (also a PWA).

Conventions:
- `page.tsx` is a Server Component by default.
- `loading.tsx` next to every `page.tsx` (skeleton matching final layout).
- `error.tsx` per route segment for runtime errors.
- Client components opt in with `"use client"` and live in `src/components/<area>/`.

### `src/server/`
Server-only code. Two children:

- **`queries/`** — read-side. Each file = one feature. `import "server-only"` at top. Plain async functions called directly from Server Components.
- **`actions/`** — write-side. Each feature = a folder, each action = its own file (e.g. `members/create.ts`, `members/update.ts`). `"use server"` at top. Returns `Result<T>`.

The split matters because `"use server"` creates an RPC endpoint that the client can call. Reads should NOT be RPC — they should be plain function calls during RSC render.

### `src/lib/`
Pure utilities. No business logic. Examples:
- [`prisma.ts`](./src/lib/prisma.ts) — singleton Prisma client.
- [`auth.ts`](./src/lib/auth.ts) — Auth.js v5 config.
- [`permissions.ts`](./src/lib/permissions.ts) — RBAC helpers.
- [`pin.ts`](./src/lib/pin.ts) — member PIN auth (hash, verify, throttle).
- [`push.ts`](./src/lib/push.ts) — Web Push fan-out (web-push lib).
- [`datetime.ts`](./src/lib/datetime.ts) — Jakarta-aware date formatting.
- [`phone.ts`](./src/lib/phone.ts) — Indonesian phone number normalization.
- [`markdown.ts`](./src/lib/markdown.ts) — strip + excerpt for cards/push.
- [`validation/`](./src/lib/validation/) — shared Zod schemas.

### `src/components/`
- `ui/` — shadcn primitives. **DO NOT modify by hand.** Re-add via `pnpm dlx shadcn@latest add <component>` if needed.
- `admin/`, `member/`, `shared/` — feature components, mostly client-side.

### `src/config/`
Per-deployment knobs.
- [`church.ts`](./src/config/church.ts) — name, short name, primary color (from env).
- [`features.ts`](./src/config/features.ts) — feature flags. Both nav AND route access must respect these.
- [`nav.ts`](./src/config/nav.ts) — sidebar navigation definitions.

---

## 5. Gotchas (things that bit us, in order of how often they bite)

1. **`"use server"` ≠ "server-only".**
   - `"use server"` at top of file = RPC endpoint, callable from client. Use for **mutations**.
   - `import "server-only"` = build error if imported by client. Use for **reads / pure server utilities**.
   - Don't put `"use server"` on read-side queries — every render becomes a roundtrip.

2. **Tailwind 4 important syntax is postfix, not prefix.**
   - `whitespace-normal!` (Tailwind 4) — NOT `!whitespace-normal` (Tailwind 3).
   - Needed when shadcn variants apply more-specific selectors that you must override.

3. **Date display on Vercel is UTC unless you use `formatJakarta`.**
   - Calling `format(date, "HH:mm")` works locally (your Mac is WIB) and breaks in prod.
   - Always import from `@/lib/datetime` for any time-of-day formatting.

4. **Service worker cache version.**
   - When you change `public/sw.js`, bump `CACHE_VERSION` at the top — otherwise existing PWA installs hold the old service worker forever.

5. **Feature flags must gate BOTH nav AND route.**
   - Hiding the nav entry isn't enough; users can deep-link. Add `if (!features.X) notFound();` at the top of the page.

6. **Push notifications silently no-op without VAPID env vars.**
   - This is intentional for staging/preview deploys. If pushes don't arrive, check `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` are set.
   - `isPushConfigured()` in [src/lib/push.ts](./src/lib/push.ts) is the canonical check.

7. **Prisma `migrate deploy` runs on Vercel build.**
   - The build script chain is `prisma migrate deploy && prisma generate && next build`. Any pending migrations apply automatically on every push to main. See [DEVELOPMENT.md](./DEVELOPMENT.md) for the safe migration workflow.

8. **`revalidatePath` is per-page, not per-tag.**
   - We don't use `revalidateTag` anywhere. If you forget a path, the page caches the old data.
   - Search the existing actions for the data you mutated and copy the `revalidatePath` calls.

---

## 6. When you're stuck

In rough order of usefulness:

1. **Find the analogous feature** — `members` is the canonical entity CRUD; `announcements` is the canonical content + push module; `prayer-requests` is the canonical "members write, admins moderate" pattern.
2. **Read the action file end-to-end** — every action is self-contained (~50–80 lines). The pattern repeats.
3. **Check [CLAUDE.md](./CLAUDE.md)** for the project-wide DO/DON'T rules.
4. **Check [DEVELOPMENT.md](./DEVELOPMENT.md)** for migrations, seed scripts, deployment.
5. **Open `prisma/schema.prisma`** — the data model is the source of truth.
6. **Grep, don't guess.** Naming is consistent: action files are kebab-case verbs, Prisma models are PascalCase singular, DB columns are snake_case.
