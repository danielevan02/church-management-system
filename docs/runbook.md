# Runbook — Operasi Produksi

> Buku panduan untuk operator (Anda) saat **ada masalah di produksi** atau perlu melakukan **operasi rutin yang berisiko**. Beda dengan [`deployment.md`](./deployment.md) yang fokus ke setup awal — runbook ini fokus ke "kalau X terjadi, lakukan Y".

**Sebelum kejadian beneran, baca runbook ini sekali. Saat kejadian, ikuti langkah secara berurutan, jangan improvisasi.**

---

## Daftar Isi

1. [Backup & Restore Database](#1-backup--restore-database)
2. [Admin Lupa Password / Akun Terkunci](#2-admin-lupa-password--akun-terkunci)
3. [Member Tidak Bisa Login](#3-member-tidak-bisa-login)
4. [Push Notification Tidak Sampai](#4-push-notification-tidak-sampai)
5. [PWA Stuck di Versi Lama](#5-pwa-stuck-di-versi-lama)
6. [Migrasi Database Gagal saat Deploy](#6-migrasi-database-gagal-saat-deploy)
7. [Database Performance Menurun](#7-database-performance-menurun)
8. [Health Check Pasca-Deploy](#8-health-check-pasca-deploy)

---

## 1. Backup & Restore Database

### 1a. Backup otomatis (sudah ada)

**Neon** (provider PostgreSQL default) punya **Point-in-Time Recovery (PITR)** built-in:
- **Free tier**: history 7 hari
- **Launch tier**: history 30 hari
- **Scale tier**: history sampai 1 tahun

Tidak perlu konfigurasi tambahan. Backup berjalan terus-menerus tanpa downtime.

### 1b. Backup manual (sebelum operasi berisiko)

Sebelum migrasi besar atau perubahan schema yang sensitif, **dump manual** lewat `pg_dump`:

```bash
# Dapatkan DATABASE_URL dari Vercel env, lalu:
pg_dump "$DATABASE_URL" --no-owner --no-acl > backup-$(date +%Y%m%d-%H%M).sql

# Atau hanya schema (struktur tabel):
pg_dump "$DATABASE_URL" --schema-only > schema-$(date +%Y%m%d).sql
```

Simpan file `.sql` di lokasi aman (Google Drive, encrypted disk). **JANGAN commit ke git.**

### 1c. Restore dari Neon PITR

Saat data terhapus tanpa sengaja atau corruption:

1. Login ke [console.neon.tech](https://console.neon.tech)
2. Pilih project gereja → **Branches** tab
3. Klik **Create branch from time**
4. Pilih timestamp sebelum kejadian (granularitas detik)
5. Branch baru muncul dengan connection string sendiri
6. **Verifikasi** data di branch baru via Prisma Studio:
   ```bash
   DATABASE_URL="<branch-connection-string>" pnpm db:studio
   ```
7. Kalau benar, **swap connection** di Vercel env: ganti `DATABASE_URL` dengan branch baru
8. Re-deploy via Vercel UI ("Redeploy" tombol)
9. Tunggu deploy selesai, test sign-in & data
10. Hapus branch lama setelah ~1 minggu kalau semua aman

**Estimasi downtime**: 5-10 menit (waktu deploy ulang).

### 1d. Restore dari `pg_dump` manual

Kalau hanya punya file SQL backup:

```bash
# Restore ke database kosong (HATI-HATI: akan timpa data)
psql "$DATABASE_URL" < backup-20260501-1430.sql
```

⚠️ **Selalu test restore di Neon branch dulu**, jangan langsung ke prod.

### 1e. Test recovery (lakukan sekali sebelum launch)

Buat fire drill: hapus 1 announcement test → coba restore → verifikasi muncul lagi. Kalau Anda baru cari tahu cara restore pas data hilang beneran, **terlambat**.

---

## 2. Admin Lupa Password / Akun Terkunci

**Symptom**: ADMIN tunggal tidak bisa login. Email recovery tidak ada.

**Solution**: gunakan emergency reset script.

```bash
# Lokal (paling aman, butuh DATABASE_URL prod):
DATABASE_URL="<prod-connection-string>" \
  pnpm admin:reset-password \
  --email admin@gereja.id \
  --password "passwordbaruyangkuat"
```

Script akan:
- Validasi password minimal 8 karakter
- Refuse kalau target bukan ADMIN (kecuali `--force`)
- Re-enable akun kalau sebelumnya `isActive: false`

**Aturan keamanan**:
- Setelah reset, **segera** minta admin login dan ganti ke password mereka sendiri
- Hapus `DATABASE_URL` dari shell history (`history -c` atau hapus dari `~/.zsh_history`)
- Kalau perlu reset member (bukan admin), pakai UI di `/admin/settings/users` — script ini khusus emergency

---

## 3. Member Tidak Bisa Login

**Symptom**: Jemaat input phone + PIN, dapat error "Kredensial tidak valid".

### Triage

**Step 1: Cek nomor HP**
- Format E.164? Sistem normalize otomatis (`08xxx` → `+628xxx`).
- Cek di `/admin/members/<id>` apakah phone tersimpan benar.

**Step 2: Cek PIN sudah di-set**
- Buka `/admin/members/<id>` → kalau "PIN belum di-set" → klik **Reset PIN**.
- Member yang baru ditambahkan TIDAK punya PIN sampai admin set.

**Step 3: Cek status akun**
- Di `/admin/settings/users` cari user → kalau `isActive: false`, klik toggle.

**Step 4: Cek throttle**
- Setelah 10 percobaan gagal dalam 15 menit, ada cooldown 30 detik.
- Solusi: tunggu 1 menit lalu coba lagi. Tidak ada permanent lockout.
- Kalau curiga ada brute-force: cek tabel `pin_attempts` di Prisma Studio.

**Step 5: Member soft-deleted**
- Cek `members` tabel: kalau `deletedAt` not null, member dianggap tidak ada.
- Kalau salah hapus, restore via SQL:
  ```sql
  UPDATE members SET deleted_at = NULL WHERE id = '<member-id>';
  ```

---

## 4. Push Notification Tidak Sampai

**Symptom**: Admin bikin announcement, member tidak terima notifikasi.

### Triage

**Step 1: Cek VAPID env vars**
```bash
# Di Vercel project settings → Environment Variables
# Pastikan ada DAN tidak kosong:
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@gereja.id
```

Kalau kosong, push **silently no-op** (sengaja, supaya staging tidak crash).

**Step 2: Cek member sudah subscribe**
- Member buka `/me/dashboard` → lihat banner "Aktifkan notifikasi" → klik Allow.
- Permission browser harus "Allow" — kalau "Block" mereka harus reset di browser settings.

**Step 3: Cek service worker terinstall**
- Member buka DevTools → Application → Service Workers
- Pastikan `/sw.js` ter-register dan aktif.
- Kalau tidak ada: hard refresh (`Ctrl+Shift+R`) atau uninstall PWA → reinstall.

**Step 4: Cek Vercel logs**
```
Vercel project → Logs → filter "[push]"
```
Lihat error stream. Common errors:
- `404 Not Found`: subscription expired di sisi push gateway → akan auto-prune.
- `410 Gone`: sama, auto-prune.
- `401 Unauthorized`: VAPID keys salah/mismatch.

**Step 5: Test manual**
Lewat Prisma Studio, cek tabel `push_subscriptions` — jumlah row > 0?

---

## 5. PWA Stuck di Versi Lama

**Symptom**: Sudah deploy, tapi member masih lihat UI lama / fitur baru tidak muncul.

### Cause
Service worker cache tidak invalidated. Pada deployment normal **ini sudah otomatis** — `scripts/build-sw.cjs` stamp `CACHE_VERSION` dengan git SHA tiap build, jadi cache key berubah setiap deploy.

Kalau masih stuck, kemungkinan: build-sw script gagal jalan, atau browser member belum check service worker baru (SW update tertunda kalau tab tertutup lama).

### Verifikasi build-sw jalan
Setelah deploy, cek `https://your-domain.com/sw.js` di browser. Cari baris:
```js
const CACHE_VERSION = "abc1234"; // ← harus git SHA, BUKAN "__BUILD_VERSION__" atau "dev-..."
```

Kalau yang tampil literal `__BUILD_VERSION__` → script `predev`/`prebuild` tidak jalan. Cek logs Vercel build.

### Source of truth
- **Source**: [`public/sw.template.js`](../public/sw.template.js) — committed
- **Generated**: `public/sw.js` — gitignored, dibuat oleh `scripts/build-sw.cjs` saat `pnpm dev` / `pnpm build`

### Fix dari sisi member (kalau update belum nyangkut juga)

Member harus:
1. Buka PWA → DevTools → Application → Service Workers → **Unregister**
2. Clear site data: Application → Storage → **Clear site data**
3. Hard refresh

Atau cara pasti: uninstall PWA → restart phone → install ulang.

---

## 6. Migrasi Database Gagal saat Deploy

**Symptom**: Vercel deploy gagal dengan error dari `prisma migrate deploy`.

### Triage

**Step 1: Baca error di Vercel logs**
- Migrasi yang sudah apply: di tabel `_prisma_migrations` ada row `applied_steps_count` > 0 tapi `finished_at` null.
- Itu artinya migrasi **gagal di tengah** — DB ada di state inkonsisten.

**Step 2: Roll forward atau roll back?**

**Roll forward** (paling umum, lebih aman daripada rollback):
1. Bikin migrasi baru yang fix issue di branch lokal:
   ```bash
   pnpm db:migrate
   # Buat migrasi yang menyelesaikan state inkonsisten
   ```
2. Test di Neon branch (jangan langsung prod)
3. Push → deploy → verifikasi

**Roll back** (kalau perubahan belum critical):
1. Login Neon → restore branch ke timestamp sebelum deploy
2. Swap `DATABASE_URL` ke branch baru di Vercel
3. Revert commit yang menyebabkan migrasi:
   ```bash
   git revert <bad-commit-sha>
   git push origin main
   ```

**Step 3: Cegah ke depan**
Setiap migrasi schema yang non-trivial (drop column, rename, type change) wajib:
- Dijalankan di Neon branch dulu, bukan langsung prod
- Dump backup manual sebelum apply

---

## 7. Database Performance Menurun

**Symptom**: Page load lambat, query timeout, Vercel function cold start tinggi.

### Triage

**Step 1: Cek Neon dashboard**
- Login [console.neon.tech](https://console.neon.tech) → **Monitoring**
- Lihat: connection count, query latency p95, autovacuum activity

**Step 2: Cek slow queries**
- Neon punya tab **Insights** untuk slow query log
- Cari query > 500ms — biasanya missing index

**Step 3: Tambah index kalau perlu**
- Edit `prisma/schema.prisma`, tambah `@@index([fieldname])`
- Bikin migrasi → test di branch → deploy

**Step 4: Upgrade tier kalau memang traffic tinggi**
- Free tier: 0.25 vCPU, 256 MB RAM (cukup untuk gereja < 200 anggota)
- Launch tier: 2 vCPU, 8 GB RAM (cukup untuk 1000+ anggota dengan traffic normal)
- Upgrade dari Neon dashboard, tidak ada downtime

---

## 8. Health Check Pasca-Deploy

**Lakukan ini setiap selesai deploy ke prod.** Estimasi 3 menit.

- [ ] Buka homepage `/` — load OK, tidak 500
- [ ] Buka `/auth/sign-in` — pilih bahasa kerja
- [ ] Login sebagai admin — masuk dashboard tanpa error
- [ ] Buka `/admin/members` — list members tampil
- [ ] Buka `/admin/giving` — list persembahan tampil
- [ ] Buka `/admin/volunteers` — weekly view render
- [ ] Logout → login sebagai member (test account)
- [ ] Buka `/me/dashboard` — devotional + announcement muncul
- [ ] Cek Vercel logs — tidak ada `console.error` baru sejak deploy
- [ ] Cek Sentry (kalau aktif) — tidak ada issue baru

Kalau salah satu fail, **investigasi sebelum closed pos**. Jangan tinggalkan deploy yang setengah broken.

---

## 9. Mengaktifkan Sentry (Sekali Setup)

Project sudah ter-instrument dengan Sentry SDK. Tinggal aktifkan dengan langkah berikut:

1. Daftar gratis di [sentry.io](https://sentry.io) → Create Project → pilih **Next.js**
2. Salin **DSN** yang muncul di setup wizard
3. Di Vercel project → Settings → Environment Variables, tambah:
   ```
   NEXT_PUBLIC_SENTRY_DSN=<paste-dsn>
   ```
4. (Opsional, untuk source map upload supaya stack trace prod readable)
   ```
   SENTRY_ORG=<your-org-slug>
   SENTRY_PROJECT=<your-project-slug>
   SENTRY_AUTH_TOKEN=<from-sentry-account-settings>
   ```
5. Redeploy

**Verifikasi**: trigger error sengaja (mis. tambah `throw new Error("test")` di `src/app/[locale]/page.tsx`, deploy, buka homepage) — error harus muncul di Sentry dashboard dalam 30 detik.

**Tanpa DSN**: SDK silently no-op. Tidak break dev / staging.

---

## Hubungi Bantuan

Kalau runbook ini tidak cover masalah Anda:
- Cek [troubleshooting di user guide admin](./user-guide-admin.md#troubleshooting)
- Buka issue di [GitHub repo](https://github.com/danielevan02/church-management-system/issues) (kalau internal/dev support)
- Untuk pertanyaan operasional gereja, kontak developer langsung
