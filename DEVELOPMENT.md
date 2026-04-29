# Development Workflow

Catatan untuk diri sendiri biar gak lupa step-step yg gampang ke-skip pas kerja sendirian.

---

## Database Migration

Setiap kali ubah `prisma/schema.prisma`:

### 1. Generate migration di lokal

```bash
pnpm db:migrate
# atau eksplisit:
pnpm prisma migrate dev --name <nama_deskriptif>
```

Ini akan:
- Bikin file SQL baru di `prisma/migrations/<timestamp>_<nama>/`
- Apply ke DB lokal (yg ditunjuk `DATABASE_URL` di `.env`)
- Regen Prisma client + TypeScript types

### 2. Test di lokal

Pastikan fitur jalan: jalanin `pnpm dev`, buka halaman yg kena, klik-klik.

### 3. Commit termasuk file migration

```bash
git add prisma/migrations/ prisma/schema.prisma
git commit -m "..."
```

**JANGAN** lupa commit folder migration — kalau cuma schema yg di-push tanpa migration file, prod gak akan tau cara update schema.

### 4. Push & merge — migration auto-apply di Vercel

Build script di `package.json` udah di-set ke:

```json
"build": "prisma migrate deploy && prisma generate && next build --turbopack"
```

Jadi setiap kali Vercel deploy:
1. `prisma migrate deploy` — apply pending migration ke prod DB
2. `prisma generate` — regen TypeScript types
3. `next build` — build app

**Kalau migration error** (jarang, biasa nya udah ketauan di lokal):
- Build gagal di step migration
- Code lama tetap live di prod, **tidak ada downtime**
- Vercel deploy log kasih liat error SQL nya
- Fix di lokal → push → Vercel auto-retry

**Kalau mau apply manual ke prod** (misal sebelum merge mau verifikasi dulu):

```bash
pnpm db:deploy
```

Tapi normalnya gak perlu — biarin Vercel yg handle.

---

## Common Commands

```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Production build (auto-runs prisma generate)
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint

pnpm db:migrate       # Generate + apply migration di dev
pnpm db:deploy        # Apply pending migrations ke prod
pnpm db:studio        # GUI buat inspect DB (jalanin lokal)
pnpm db:seed          # Run seed script (admin user + sample data)
pnpm db:reset         # ⚠️ DESTRUCTIVE: drop + recreate all tables (dev only)
```

---

## Pre-Merge Checklist

Sebelum merge PR ke main:

- [ ] `pnpm typecheck` lulus
- [ ] `pnpm lint` lulus
- [ ] `pnpm build` lulus lokal
- [ ] Kalau ada migration: file `prisma/migrations/<timestamp>_<name>/` di-commit (Vercel auto-apply pas build)
- [ ] Translation keys baru ditambahin di **kedua** `messages/en.json` & `messages/id.json`
- [ ] Kalau ada fitur baru yg bisa di-toggle: tambah flag di `src/config/features.ts`
- [ ] Test minimal di browser (tampilan utama, golden path)

---

## Common Scenarios

### Migration aman (additive)
- Tambah table baru
- Tambah kolom nullable
- Tambah index

→ Apply schema duluan atau setelahnya, gak masalah. Code lama gak akan crash karena perubahan ini.

### Migration breaking
- Rename kolom
- Drop kolom yg masih dipakai code
- Change tipe kolom

→ Lebih aman split jadi 2 PR:
- **PR 1**: tambah kolom baru, copy data dari kolom lama, deploy. Code dual-write.
- **PR 2**: pindahin semua code ke kolom baru, drop yg lama, deploy.

Atau urutkan ketat: apply schema → langsung deploy code, dengan downtime singkat.

### Neon DB tidur (cold start)
Neon free tier auto-suspend setelah idle. Kalau `pnpm db:deploy` atau `prisma migrate status` error `P1001: Can't reach database server`:

```bash
sleep 5 && pnpm prisma migrate status   # retry, biasa nya 2-5 detik wake-up
```

Kalau lebih dari 30 detik tetep gak bisa, cek dashboard Neon (mungkin compute-nya pause permanent atau credits abis).

### Migration udah ke-apply tapi gagal di tengah
Kalau Prisma error "migration failed and has been rolled back":
1. Cek `prisma/migrations/_failed_migrations` — Prisma simpan info disitu
2. Mark as resolved dgn `pnpm prisma migrate resolve --rolled-back <migration_name>`
3. Fix migration SQL → re-apply

### Lupa nama migration
```bash
ls prisma/migrations/   # list semua
pnpm prisma migrate status   # status applied/pending
```

---

## Environment Variables

`.env` (gitignored, untuk lokal):
```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
NEXT_PUBLIC_CHURCH_NAME="..."
INITIAL_ADMIN_EMAIL="admin@..."
INITIAL_ADMIN_PASSWORD="..."
```

Production (Vercel dashboard → Settings → Environment Variables):
- Wajib ada `DATABASE_URL` (dari Neon)
- Wajib ada `AUTH_SECRET` (generate via `openssl rand -base64 32`)
- `NEXT_PUBLIC_*` untuk branding

---

## Backup DB Sebelum Migration Risky

Untuk migration yg ngubah/drop data (misal rename kolom yg udah ada isinya):

```bash
# Pakai pg_dump (DATABASE_URL ada di .env)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M).sql
```

Kalau ada masalah, restore:

```bash
psql $DATABASE_URL < backup-YYYYMMDD-HHMM.sql
```

Neon juga punya **point-in-time recovery** di dashboard — pilih timestamp, restore ke branch baru, switch DATABASE_URL kalau perlu.
