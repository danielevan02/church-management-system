# Customization Guide

How to re-skin the app for a new church deployment without touching application code.

---

## 1. Branding via environment variables

All public-facing branding is driven by `NEXT_PUBLIC_CHURCH_*` env vars. Set these in `.env.local` (dev) or your hosting provider's env settings (prod).

| Variable | Used for | Example |
|---|---|---|
| `NEXT_PUBLIC_CHURCH_NAME` | Full name in headers, page titles, manifest | `Gereja Kristus Indonesia` |
| `NEXT_PUBLIC_CHURCH_SHORT_NAME` | Compact name, sidebar header, PWA icon text, fallback OG title | `GKI` |
| `NEXT_PUBLIC_CHURCH_DOMAIN` | Public domain reference | `gki-jakarta.id` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `id` or `en` — decides which locale is the prefix-less default | `id` |
| `NEXT_PUBLIC_PRIMARY_COLOR` | Hex theme color, used in PWA manifest, generated icons, browser theme bar | `#0F766E` |

Restart the dev server (or redeploy) after changing these.

---

## 2. Asset replacement

Replace these files in `public/` per deployment:

| Path | Purpose | Required size |
|---|---|---|
| `public/logo.svg` | Header / sidebar logo | SVG, square preferred |
| `public/favicon.ico` | Browser tab icon | 32×32 ICO |
| `public/qris.png` | QRIS image on giving page (optional) | Any size, displayed up to 320px |

### PWA icons

By default, `/icon-192.png`, `/icon-512.png`, and `/icon-maskable.png` are generated dynamically via `next/og` from the church short name + primary color (see [`src/app/icon-192.png/route.tsx`](../src/app/icon-192.png/route.tsx)).

To use custom icons for a church:

**Option 1** — Replace the route handler with a static file:
- Delete the `src/app/icon-192.png/route.tsx` file (and 512 / maskable variants).
- Place `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable.png` (the static files take precedence after the route is removed).

**Option 2** — Edit the route handler to embed a logo:
- Modify the JSX in the route handler to render the church logo as background, e.g. by using a remote `<img>` tag inside `<ImageResponse>`.

Maskable icons need ~10% safe-zone padding on each side so OS-level cropping doesn't cut content. Use [maskable.app](https://maskable.app) to preview.

### Bank / giving info

Set these (optional, used by the giving form):

```
NEXT_PUBLIC_CHURCH_BANK_NAME=BCA
NEXT_PUBLIC_CHURCH_BANK_ACCOUNT_NUMBER=1234567890
NEXT_PUBLIC_CHURCH_BANK_ACCOUNT_HOLDER=Yayasan Gereja Anu
NEXT_PUBLIC_CHURCH_QRIS_IMAGE_PATH=/qris.png       # leave default if file is at /public/qris.png
NEXT_PUBLIC_CHURCH_GIVING_CONFIRM_WA=+628123456789  # leave empty to hide post-transfer prompt
```

---

## 3. Feature flags

`src/config/features.ts` toggles entire modules on/off per deployment.

```ts
export const features = {
  childrensCheckIn: true,    // Children's check-in module + member portal section
  pastoralCare: true,        // Pastoral visits + admin dashboard "needs attention"
  discipleship: true,        // Milestone tracking
  volunteers: true,          // Teams, positions, scheduled assignments
  giving: true,              // Giving records, funds, KPIs (admin); /me/giving (member)
  whatsappBroadcast: true,   // Communications module mass send
  selfCheckIn: true,         // Member portal /me/check-in (self-scan)
} as const;
```

Set a flag to `false` to:
- Hide the corresponding nav entries in admin & member sidebars
- Make direct route access return `notFound()` (handled in module layouts)
- Hide the corresponding KPI cards / dashboard sections

Common deployment scenarios:

| Church profile | Recommended overrides |
|---|---|
| Small church, no children's program | `childrensCheckIn: false` |
| No formal discipleship pathway | `discipleship: false` |
| No komsel / cell groups (rare) | Keep on — it's the social backbone |
| WhatsApp not allowed (e.g. compliance) | `whatsappBroadcast: false` + switch `WHATSAPP_PROVIDER` to `stub` |

After changing the file, redeploy. Feature flag changes do **not** drop or migrate data — disabled modules keep their tables intact, just hidden.

---

## 4. Locale & translations

The app ships with `id` (Indonesian, default) and `en` (English). All user-facing strings live in `messages/{id,en}.json`. To add another locale:

1. Add the locale code to `src/lib/i18n/routing.ts`:
   ```ts
   locales: ["id", "en", "zh"],
   ```
2. Create `messages/zh.json`. Copy `id.json` as a starting template and translate.
3. Update `messages/zh.json` whenever new keys are added in `id.json` (CI / linting will catch missing keys via TypeScript when you build).

Do **not** hardcode UI strings in components. Always use `useTranslations()` (client) or `getTranslations()` (server).

---

## 5. Roles & initial users

Roles are fixed in `prisma/schema.prisma`:

```
SUPER_ADMIN | ADMIN | STAFF | LEADER | MEMBER
```

The seed script creates one `SUPER_ADMIN` from `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD`. Every other staff account is created in-app via Settings → Users. Members are added via the Members module — phone-only accounts log in via WhatsApp OTP.

---

## 6. Data import (initial seeding for a church)

There's no built-in CSV importer yet. For the first deployment, the most reliable path:

1. Export church data from existing systems to CSV (members, households, cell groups).
2. Write a one-off script in `prisma/seed-{church-name}.ts` that uses Prisma client to upsert records.
3. Run it once locally pointing at the production DB:
   ```bash
   tsx prisma/seed-{church-name}.ts
   ```
4. Delete the script (it contains personal data) — do not commit.

If repeated imports are needed, consider building a proper admin upload UI as a follow-up feature.

---

## 7. Modules you can safely delete

If a deployment will permanently never use a module, you can delete the routes + components after disabling the feature flag. Always run `pnpm typecheck` after deletion to catch dangling imports.

That said: the marginal cost of keeping disabled modules is near-zero, and re-adding later is painful. Default to leaving modules in place and using feature flags.
