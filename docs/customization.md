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

### Logo + PWA icons (one source, generated)

Drop the church logo at `scripts/source-logo.png`:
- Square PNG ≥ 512×512
- **Transparent background** (so the badge silhouette generator can extract the alpha channel cleanly)

Then run:

```bash
pnpm icons
```

This emits the full icon set into `public/`:

| File | Size | Purpose |
|---|---|---|
| `icon-192.png` | 192×192, **white bg** | Manifest icon (`purpose: any`), home screen + splash |
| `icon-512.png` | 512×512, **white bg** | Manifest icon (`purpose: any`), high-DPR splash |
| `icon-maskable.png` | 512×512, white bg, 80% safe zone | Manifest icon (`purpose: maskable`), Android adaptive shapes |
| `icon-ui-192.png` | 192×192, **transparent** | UI chrome — sidebar headers, auth shell, landing |
| `badge-72.png` | 72×72, **monochrome white silhouette** | Push notification status-bar badge (Android requires monochrome) |
| `badge-96.png` | 96×96, monochrome | Higher-DPR push badge |
| `favicon-32.png` | 32×32 | Browser tab icon |

The generator (`scripts/generate-icons.cjs`) uses `sharp`. Re-run `pnpm icons` whenever the logo changes.

### Other assets

| Path | Purpose | Required size |
|---|---|---|
| `public/qris.png` | QRIS image on giving page (optional) | Any size, displayed up to 320px |
| `app/favicon.ico` | Tab icon (Next.js convention) | 32×32 ICO — Next.js auto-handles |

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
  selfCheckIn: true,         // Member portal /me/check-in (self-scan)
  devotionals: true,         // Daily renungan (admin CRUD + member archive + dashboard hero)
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
| Pengurus tidak punya bandwidth tulis renungan harian | `devotionals: false` |
| Disable push notifications | Leave `announcements` flag alone; just don't set VAPID env vars (push silently disables, inbox still works) |

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
ADMIN | STAFF | LEADER | MEMBER
```

The seed script creates one `ADMIN` from `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD`. Every other staff account is created in-app via Settings → Users. Members are added via the Members module — admins set the member's initial PIN, and members log in with phone + PIN. Members can change their own PIN in `/me/profile` after first login.

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
