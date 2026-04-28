# Panduan Pengguna — Pengurus & Staff

Panduan lengkap mengoperasikan Church Management System (ChMS) dari sisi admin/staff/leader. Dokumen ini ditujukan untuk **pengurus gereja** yang setiap hari mengelola data jemaat, kehadiran, persembahan, dan komunikasi.

> **Untuk jemaat** (pengguna portal `/me`), lihat [`user-guide-jemaat.md`](./user-guide-jemaat.md).
>
> **Untuk teknisi** yang men-deploy / men-customize, lihat [`deployment.md`](./deployment.md) dan [`customization.md`](./customization.md).

---

## Daftar Isi

1. [Pengenalan](#1-pengenalan)
2. [Akses & Login](#2-akses--login)
3. [Tata Letak & Navigasi](#3-tata-letak--navigasi)
4. [Modul Jemaat (Members)](#4-modul-jemaat-members)
5. [Modul Keluarga (Households)](#5-modul-keluarga-households)
6. [Modul Kehadiran (Attendance)](#6-modul-kehadiran-attendance)
7. [Modul Persembahan (Giving)](#7-modul-persembahan-giving)
8. [Modul Komsel (Cell Groups)](#8-modul-komsel-cell-groups)
9. [Modul Acara (Events)](#9-modul-acara-events)
10. [Modul Komunikasi (Communications)](#10-modul-komunikasi-communications)
11. [Modul Pelayanan (Volunteers)](#11-modul-pelayanan-volunteers)
12. [Modul Anak (Children)](#12-modul-anak-children)
13. [Modul Penggembalaan (Pastoral)](#13-modul-penggembalaan-pastoral)
14. [Modul Pemuridan (Discipleship)](#14-modul-pemuridan-discipleship)
15. [Modul Permintaan Doa (Prayer Requests)](#15-modul-permintaan-doa-prayer-requests)
16. [Dasbor & Laporan](#16-dasbor--laporan)
17. [Pencarian Global](#17-pencarian-global)
18. [Pengaturan (Settings)](#18-pengaturan-settings)
19. [Skenario Umum (Cookbook)](#19-skenario-umum-cookbook)
20. [Troubleshooting](#20-troubleshooting)
21. [Best Practices](#21-best-practices)

---

## 1. Pengenalan

ChMS adalah aplikasi web pengelolaan gereja terpusat. Satu deployment = satu gereja. Tidak ada langganan bulanan; gereja membeli sekali, di-host sendiri atau dikelola oleh pihak yang menjual.

### Apa saja yang bisa dikelola

| Modul | Fungsi |
|---|---|
| Jemaat & Keluarga | Direktori jemaat, profil, status keanggotaan |
| Kehadiran | Jadwal ibadah, check-in via QR/manual, tren mingguan |
| Persembahan | Catatan offline (transfer/cash/QRIS), fund/anggaran |
| Komsel | Daftar komsel, leader, anggota, laporan mingguan |
| Acara | Acara dengan RSVP, kapasitas, waitlist |
| Komunikasi | Template pesan, broadcast WA/email |
| Pelayanan | Tim pelayanan, jadwal sukarelawan |
| Anak | Check-in/check-out anak di kebaktian |
| Penggembalaan | Catatan kunjungan, tindak lanjut |
| Pemuridan | Milestone rohani per jemaat |
| Permintaan Doa | Submission jemaat, status |
| Laporan | KPI, tren, insight cross-modul |

### Peran (Role)

Setiap user yang login ke `/admin` punya salah satu role berikut, dari paling tinggi:

| Role | Akses |
|---|---|
| `SUPER_ADMIN` | Semua + Settings (users, features, audit log). Biasanya developer / handover account. |
| `ADMIN` | Operasional penuh: semua modul, termasuk Persembahan & Audit. Untuk pendeta / gembala senior. |
| `STAFF` | Operasional umum tanpa Persembahan detail & Settings. Untuk staf umum. |
| `LEADER` | Hanya data komsel yang dipimpin + jemaat anggotanya. Untuk pemimpin komsel. |
| `MEMBER` | Tidak bisa akses `/admin`. Akses portal `/me` saja. |

### Bahasa

Aplikasi tersedia dalam Bahasa Indonesia (default) dan English. Switch bahasa via settings profil atau ganti URL: `/id/admin` atau `/en/admin`.

---

## 2. Akses & Login

### Login pertama kali (admin awal)

Setelah deployment selesai, akun **SUPER_ADMIN** awal sudah dibuat oleh seed script (lihat `INITIAL_ADMIN_EMAIL` di env). Caranya:

1. Buka `https://<domain-gereja>/auth/sign-in`
2. Pilih tab **"Pengurus / Admin"** (bukan "Jemaat")
3. Masukkan email & password admin awal
4. Klik **Login**

> ⚠️ **Segera ganti password** setelah login pertama. Settings → Users → Edit → set password baru.

### Login staff/admin biasa

Sama seperti di atas. Email & password yang dipakai sudah dibuat oleh super admin via Settings → Users.

### Lupa password

Tidak ada self-service reset password. Hubungi admin/super admin di gereja untuk reset:
- Settings → Users → klik user → **Reset Password**
- Sistem generate password baru, sampaikan secara langsung (jangan via WA/email)
- User wajib ganti password lagi setelah login

### Logout

Klik avatar di pojok kanan bawah sidebar → **Sign out**. Sesi langsung berakhir.

### Sesi otomatis berakhir

Sesi login bertahan ~30 hari. Sistem akan minta login ulang setelah itu, atau setelah `AUTH_SECRET` di-rotasi.

---

## 3. Tata Letak & Navigasi

### Sidebar (kiri)

Berisi semua modul yang tersedia untuk role kamu. Item yang di-disable (warna pudar, badge "Soon") = modul belum aktif untuk deployment ini.

### Header (atas)

- **Hamburger** — buka/tutup sidebar (di mobile/tablet otomatis tertutup)
- **Judul halaman** — turun otomatis dari path yang aktif
- **Tombol search** ([🔍 di sidebar](#17-pencarian-global)) — pencarian global

### Footer sidebar

- **Avatar + email kamu** — klik untuk dropdown sign out

### Navigasi mobile

Di layar kecil, sidebar berubah jadi sheet (geser dari kiri). Klik hamburger untuk buka.

---

## 4. Modul Jemaat (Members)

Menu: **Jemaat** di sidebar. Direktori utama semua jemaat.

### List jemaat

Tampilan default: tabel dengan kolom Nama, Status, Komsel, Telepon. Filter di atas:
- **Search** — cari berdasarkan nama, email, telepon
- **Status** — Aktif / Tamu / Non-aktif / Pindah / Meninggal
- **Gender**
- **Sort** — A-Z, terbaru bergabung, dst.

Klik baris untuk lihat detail.

### Tambah jemaat baru

1. Klik tombol **+ Tambah Jemaat** (kanan atas)
2. Isi field wajib: Nama lengkap, Telepon (format `08xxx` atau `+628xxx`), Status
3. Field opsional: Email, Tanggal lahir, Alamat, Kota, Foto, Tanggal bergabung, Tanggal baptis, Gereja baptis
4. Klik **Simpan**

> Telepon harus **unik** — tidak boleh ada 2 jemaat dengan nomor sama. Sistem akan menolak.

### Edit profil jemaat

1. Buka detail jemaat → klik **Ubah** (kanan atas)
2. Edit field yang perlu → **Simpan**
3. Perubahan ke-track di [audit log](#18-pengaturan-settings) (yang diubah, oleh siapa, kapan)

### Tab di halaman detail jemaat

| Tab | Isi |
|---|---|
| **Profil** | Data identitas + alamat |
| **Keluarga** | Anggota household (lihat [Households](#5-modul-keluarga-households)) |
| **Komsel** | Komsel yang diikuti jemaat |
| **Kehadiran** | Riwayat check-in (per ibadah) |
| **Persembahan** | Riwayat persembahan (visible untuk ADMIN+ saja) |
| **Pemuridan** | Milestone rohani |
| **Pelayanan** | Riwayat & jadwal pelayanan |
| **Penggembalaan** | Catatan kunjungan pastoral |

### Status jemaat

| Status | Kapan dipakai |
|---|---|
| **Aktif** | Jemaat reguler |
| **Tamu** | Belum jadi anggota tetap, datang beberapa kali |
| **Non-aktif** | Lama tidak muncul, belum keluar resmi |
| **Pindah** | Sudah pindah ke gereja lain |
| **Meninggal** | Sudah meninggal dunia |

Status mempengaruhi tampilan di laporan & dashboard.

### Hapus jemaat

Klik **Hapus** di detail. Soft-delete: data masih ada di database (untuk riwayat persembahan, kehadiran, dst.), tapi tidak muncul di list. Untuk benar-benar hapus permanen, hubungi developer (jarang diperlukan, biasanya cukup ubah status jadi "Pindah" atau "Meninggal").

### Foto profil

Upload via form Tambah/Edit. Format: JPG/PNG, maks ~5 MB. Disimpan di server.

---

## 5. Modul Keluarga (Households)

Menu: **Keluarga**. Mengelompokkan jemaat dalam satu rumah tangga (KK).

### Buat household

1. Klik **+ Tambah Keluarga**
2. Isi nama keluarga (mis. "Keluarga Surya"), alamat
3. Klik **Simpan**

### Tambah anggota ke household

1. Buka detail household
2. Section **Anggota** → klik **+ Tambah**
3. Cari jemaat yang sudah ada (autocomplete) atau buat jemaat baru langsung
4. Set hubungan (Suami / Istri / Anak / Orang tua / dll)
5. Salah satu anggota harus ditandai sebagai **Kepala Keluarga**

### Kenapa ini penting?

- Modul **Anak** otomatis menemukan anak-anak di household yang sama dengan guardian (jemaat dewasa)
- Laporan demografi gereja berbasis jumlah KK aktif
- Memudahkan pengiriman undangan keluarga (mis. seminar pasangan)

---

## 6. Modul Kehadiran (Attendance)

Menu: **Kehadiran**. Mengelola jadwal ibadah & catatan kehadiran.

### Konsep

- **Service (Ibadah)** = satu instance kebaktian dengan tanggal & jam tertentu (mis. "Ibadah Minggu Pagi 28 April 2026, 09:00")
- **Recurring service** = template untuk auto-generate ibadah mingguan/bulanan
- **AttendanceRecord** = satu catatan check-in (jemaat / tamu / nama saja)

### Buat ibadah satuan

1. Klik **Tambah Ibadah** di home Kehadiran
2. Isi: Nama, Jenis (Minggu Pagi / Sore / Doa / Komsel), Tanggal & jam mulai, Durasi, Lokasi, Aktif?
3. **Simpan**

### Buat ibadah berulang (recurring)

1. **Kelola Ibadah** → tab **Berulang** → **+ Tambah Recurring**
2. Pilih hari (Minggu, Senin, dll), jam, jenis, lokasi
3. Set tanggal mulai & berakhir (atau biarkan kosong = berlanjut terus)
4. Klik **Simpan + Generate**
5. Sistem otomatis membuat semua instance ibadah dari hari ini sampai tanggal akhir

> Tip: untuk Ibadah Minggu reguler, set recurring tanpa tanggal akhir, lalu sistem auto-generate setiap minggu.

### Check-in

Saat ibadah berlangsung, buka **Konsol Check-in**:

1. Dari home Kehadiran → bagian "Sedang Buka Check-in" → klik **Buka Konsol**
2. Akan tampil halaman scanner

#### Scan QR

- Klik **Scan QR** → izinkan kamera
- Arahkan kamera ke QR jemaat (di HP jemaat dari portal `/me/qr`)
- Otomatis tercatat hadir (notif hijau)

#### Manual

- Tab **Cari Jemaat** → ketik nama → klik **Check-in**
- Tab **Tamu** → isi nama tamu → klik **Catat**

#### Walk-in tanpa data

Pengunjung yang tidak ingin meninggalkan data: pilih tab Tamu, kosongkan semua field selain nama. Tetap masuk hitungan tapi anonim.

### Edit / hapus catatan

Buka detail ibadah → list catatan → klik baris → **Hapus** atau **Edit**.

### Laporan kehadiran

**Kehadiran → Laporan**:
- Tren mingguan 12 minggu terakhir (chart)
- Tren bulanan 12 bulan
- Daftar jemaat tidak aktif (tidak hadir 6 minggu+)

### Window check-in

Default: check-in terbuka **60 menit sebelum** sampai **60 menit setelah** ibadah berakhir. Bisa diubah developer di `src/server/queries/services.ts`.

---

## 7. Modul Persembahan (Giving)

Menu: **Persembahan**. Hanya akses untuk **ADMIN+**. STAFF tidak bisa lihat detail nominal.

### Konsep

- **Fund** = pos/anggaran (mis. "Operasional", "Misi", "Pembangunan")
- **GivingRecord** = satu catatan persembahan dengan amount, tanggal, fund, jemaat (opsional, anonim juga OK), metode (Cash / Transfer / QRIS)

### Setup awal: buat funds

Sebelum mencatat persembahan, pastikan ada minimal 1 fund:

1. **Persembahan → Funds → + Tambah Fund**
2. Isi: Nama, Kategori (Tithe / Offering / Misi / Pembangunan / Khusus), Aktif
3. **Simpan**

Fund "Operasional" dan "Misi" biasanya selalu ada.

### Catat persembahan masuk

1. **Persembahan → + Catat Persembahan** (atau dari dashboard)
2. Isi:
   - **Jemaat** — opsional, search autocomplete. Kosongkan kalau anonim
   - **Nominal** — dalam Rupiah
   - **Fund** — pilih dari dropdown
   - **Metode** — Cash / Transfer / QRIS
   - **Tanggal terima** — default hari ini
   - **Reference / catatan** — mis. nomor transfer "BCA-20251215-001"
3. **Simpan**

### Edit / void

Catatan yang salah: buka detail → **Ubah** (audit log mencatat perubahan), atau **Void** (status berubah jadi VOIDED, tidak masuk laporan).

### Laporan persembahan

**Persembahan → Laporan**:
- Total YTD vs tahun lalu (% growth)
- Tren bulanan 12 bulan
- Breakdown per fund
- Top givers (anonim by default, ADMIN bisa toggle)

### Riwayat per jemaat

Di detail jemaat, tab **Persembahan** menampilkan riwayat lengkap. Untuk surat keterangan tahunan (kebutuhan pajak), export manual ke spreadsheet (belum ada built-in export).

---

## 8. Modul Komsel (Cell Groups)

Menu: **Komsel**. Mengelola kelompok kecil / sel.

### Buat komsel

1. **Komsel → + Tambah Komsel**
2. Isi: Nama, Leader (cari jemaat), Hari pertemuan, Jam, Lokasi, Aktif
3. **Simpan**

Leader otomatis dapat role `LEADER` (bisa login ke `/admin` tapi hanya melihat komsel-nya sendiri).

### Tambah anggota komsel

1. Buka detail komsel → tab **Anggota**
2. **+ Tambah Anggota** → cari jemaat → **Tambah**
3. Set tanggal join (default hari ini)

### Hapus anggota

Klik baris anggota → **Keluarkan** → set tanggal `leftAt`. Soft-delete (riwayat tetap ada).

### Laporan komsel

Tiap kali komsel bertemu, leader bisa input laporan:

1. **Komsel → [komsel] → tab Laporan → + Tambah Laporan**
2. Isi: Tanggal, Hadir (otomatis multi-select dari anggota), Topik, Pokok doa, Catatan tindak lanjut
3. **Simpan**

Laporan ke-track di dashboard untuk monitor health komsel.

### Coverage komsel

Di dashboard admin: **% Coverage Komsel** = jemaat aktif yang minimal di 1 komsel aktif. Target idealnya >70%.

---

## 9. Modul Acara (Events)

Menu: **Acara**. Acara satu kali dengan RSVP (Retreat, Seminar, Natal, dll).

### Buat acara

1. **Acara → + Tambah Acara**
2. Isi:
   - Judul, deskripsi
   - Mulai & selesai (tanggal + jam)
   - Lokasi
   - Kapasitas (kosong = unlimited)
   - Biaya (kosong = gratis)
   - Cover image URL (opsional)
3. **Simpan sebagai draft** (belum publish, tidak terlihat jemaat)

### Publish acara

Saat siap publish:
1. Buka detail → **Publish**
2. Sekarang muncul di portal jemaat `/me/events` dan jemaat bisa RSVP

### Manage RSVP

Buka detail → tab **RSVP**:
- List jemaat yang sudah RSVP (Going / Maybe / Not Going)
- Waitlist otomatis muncul kalau Going > kapasitas
- Klik **Promote dari waitlist** kalau ada slot kosong (mis. ada yang batal)

### Walk-in di hari acara

Jemaat datang tapi belum RSVP: gunakan check-in attendance (modul Kehadiran) atau catat manual di tab RSVP.

### Tutup pendaftaran

Buka detail → **Tutup pendaftaran**. Jemaat tidak bisa RSVP lagi, tapi yang sudah RSVP tetap valid.

---

## 10. Modul Komunikasi (Communications)

Menu: **Komunikasi**. Kirim WhatsApp / Email broadcast.

### Konsep

- **Template** = template pesan dengan placeholder (mis. `Halo {{firstName}}, ibadah Minggu jam 9.`)
- **Campaign** = satu broadcast: pakai template apa, target audience siapa, kapan dikirim

### Buat template

1. **Komunikasi → Templates → + Tambah**
2. Isi:
   - Nama (untuk identifikasi internal)
   - Channel (WhatsApp / Email)
   - Body — pakai placeholder `{{firstName}}`, `{{fullName}}`, dll
3. **Simpan**

### Buat campaign

1. **Komunikasi → + Buat Campaign**
2. Pilih template
3. Pilih audience filter:
   - Semua jemaat aktif
   - Komsel tertentu
   - Custom: by gender, status, kota, dll
4. Klik **Preview Audience** → cek jumlah penerima sebelum kirim
5. Klik **Kirim Sekarang** atau **Jadwalkan** (jadwal di masa depan)

### Status campaign

| Status | Arti |
|---|---|
| Draft | Belum dikirim |
| Scheduled | Akan dikirim otomatis |
| Sending | Sedang dikirim |
| Completed | Selesai |
| Failed | Gagal (cek log) |

### Riwayat pengiriman

Buka detail campaign → tab **Riwayat**: per-recipient status (sent / failed) + error message kalau ada.

### ⚠️ Setup provider WhatsApp

Default `WHATSAPP_PROVIDER=stub` = pesan cuma log ke server console, **tidak terkirim ke jemaat**. Sebelum launch, ganti ke provider real (Fonnte / WhatsApp Cloud API). Lihat [`deployment.md`](./deployment.md).

---

## 11. Modul Pelayanan (Volunteers)

Menu: **Pelayanan**. Mengelola tim sukarelawan & jadwal.

### Konsep

- **Team** = tim pelayanan (Worship, Multimedia, Usher, Kids Ministry, dll)
- **Position** = posisi dalam tim (Lead Vocal, Drum, Sound Engineer, dll)
- **Assignment** = penugasan: siapa, posisi apa, di kebaktian/acara mana

### Buat tim

1. **Pelayanan → Tim → + Tambah Tim**
2. Isi nama, deskripsi, aktif
3. Tambah position di dalam tim (Lead, Backup, dll)

### Jadwalkan pelayanan

1. **Pelayanan → + Jadwal Baru**
2. Pilih tim, posisi, jemaat (cari autocomplete), tanggal pelayanan
3. **Simpan**

### Konfirmasi dari jemaat

Jemaat lihat jadwal di portal `/me/volunteer`, lalu Accept/Decline. Status assignment update otomatis.

### Pengganti

Kalau jemaat decline, admin tinggal edit assignment → ganti memberId ke jemaat lain.

---

## 12. Modul Anak (Children)

Menu: **Anak**. Check-in/check-out anak di kebaktian (kebaktian anak Sekolah Minggu).

### Konsep

- **Class** = kelas anak (Balita, TK, SD-A, SD-B, dst.)
- Anak = jemaat di Members yang umurnya ≤ cutoff (default 12 tahun)
- **Guardian** = jemaat dewasa di household yang sama dengan anak
- **CheckIn** = catatan check-in dengan timestamp masuk + keluar

### Setup awal: buat kelas

1. **Anak → Kelas → + Tambah Kelas**
2. Isi: Nama (mis. "SD Kelas 1-3"), umur min/max, kapasitas, aktif
3. **Simpan**

### Check-in saat kebaktian

Di pintu Sekolah Minggu:

1. **Anak → Check-in**
2. Cari nama anak (autocomplete dari members yang umurnya match)
3. Pilih kelas → **Check-in**
4. Sistem cetak nomor antrean / sticker (kalau printer disetup; default hanya tampil di layar)

### Check-out

Saat orang tua jemput:

1. **Anak → Check-in** → tab **Yang sedang ada**
2. Cari nama / scan kode (kalau ada)
3. **Check-out** → catat siapa yang menjemput (ID guardian)

### Riwayat

**Anak → Riwayat**: list semua check-in/out dengan timestamps. Untuk audit kalau ada complaint.

### Memastikan keamanan

Saat check-out, validasi guardian:
- Sistem tampilkan list guardian dari household yang sama
- Wajib pilih salah satu (atau "Other" + nama lengkap)
- Catatan masuk audit log

---

## 13. Modul Penggembalaan (Pastoral)

Menu: **Penggembalaan**. Catatan kunjungan pastoral & follow-up.

### Catat kunjungan

1. **Penggembalaan → + Catat Kunjungan**
2. Isi:
   - Jemaat yang dikunjungi
   - Tipe (Home Visit / Hospital / Phone Call / Counseling / dll)
   - Tanggal kunjungan
   - Yang berkunjung (nama gembala / staff)
   - Catatan ringkas
   - Follow-up yang perlu dilakukan + tanggal target (opsional)
3. **Simpan**

### Tindak lanjut (follow-up)

Dashboard admin section **Perlu perhatian** menampilkan top 5 follow-up yang sudah dekat tanggal-nya. Klik untuk buka detail.

### Kerahasiaan

Catatan pastoral **sensitif**. Hanya:
- ADMIN: lihat semua
- STAFF: lihat semua
- LEADER: hanya kunjungan ke anggota komsel-nya

Audit log mencatat siapa yang melihat catatan apa.

---

## 14. Modul Pemuridan (Discipleship)

Menu: **Pemuridan**. Track milestone rohani per jemaat.

### Tipe milestone

| Tipe | Kapan dicatat |
|---|---|
| Decision to Follow Christ | Jemaat menyatakan menerima Yesus |
| Baptism | Sudah dibaptis |
| Membership | Resmi jadi anggota |
| Foundations Class | Selesai kelas dasar |
| Discipleship Class | Selesai pemuridan |
| Leadership Training | Pelatihan pemimpin |
| Cell Group Leader | Diangkat jadi pemimpin komsel |
| Mission Trip | Ikut perjalanan misi |
| Other | Bebas |

### Catat milestone

1. **Pemuridan → + Catat Milestone**
2. Pilih jemaat, tipe milestone, tanggal achieve, catatan
3. **Simpan**

### Lihat perjalanan jemaat

Di detail jemaat → tab **Pemuridan**: timeline lengkap.

Di portal jemaat (`/me/discipleship`): jemaat lihat perjalanan-nya sendiri.

### Laporan

Dashboard / Laporan menampilkan jumlah milestone per tipe untuk tahun berjalan — gambaran progress disipleship gereja.

---

## 15. Modul Permintaan Doa (Prayer Requests)

Menu: **Permintaan Doa**. Submission jemaat yang butuh didoakan.

### Cara jemaat submit

Dari portal `/me/prayer-requests/new`. Mereka bisa:
- Pilih anonim (admin tetap tahu siapa, tapi tidak ditampilkan di list publik)
- Pilih public (boleh ditampilkan di sharing) atau private (hanya untuk doa internal)

### Status

- **OPEN** — baru masuk, belum di-tindak
- **PRAYING** — sedang didoakan jemaat
- **ANSWERED** — sudah dijawab Tuhan (testimoni)
- **CLOSED** — tutup tanpa update

### Workflow admin

1. **Permintaan Doa** → list pakai filter status default OPEN
2. Buka detail → baca → ubah status ke PRAYING
3. Saat sudah ada jawaban, ubah ke ANSWERED + tulis catatan testimoni

Dashboard admin menampilkan **Doa Terbuka** sebagai KPI agar tidak tertinggal.

---

## 16. Dasbor & Laporan

### Dasbor Admin (`/admin/dashboard`)

Halaman pertama setelah login. Berisi:

1. **4 KPI Cards**:
   - Jemaat Aktif (+ jumlah join bulan ini)
   - Kehadiran Terakhir (+ rata-rata 4 minggu)
   - Persembahan Bulan Ini (ADMIN+) atau Coverage Komsel (STAFF)
   - Doa Terbuka

2. **Hari ini & mendatang**: 3 ibadah terdekat + 3 acara terdekat (clickable)

3. **Perlu perhatian**: Top 5 follow-up pastoral + open prayer requests

4. **Aksi cepat**: 6 shortcut paling sering: Tambah Jemaat, Buka Check-in, Catat Persembahan (ADMIN+), Kirim Pesan, Tambah Acara, Laporan

5. **Aktivitas Terbaru** (ADMIN+): 10 audit log terakhir

### Laporan (`/admin/reports`)

Halaman laporan komprehensif:

- **Membership**: Total aktif, growth chart 12 bulan, top 5 kota, breakdown by status
- **Kehadiran**: Service terakhir, rata-rata 4 minggu, unique attendees bulan ini, weekly trend chart
- **Persembahan** (ADMIN+): YTD vs tahun lalu (% delta), tren bulanan, fund breakdown
- **Komsel**: Active count, leader count, coverage %, avg group size
- **Pemuridan**: Tahun ini, all-time, breakdown per tipe milestone

Print-friendly: gunakan browser Print (Ctrl+P) → save as PDF kalau perlu hardcopy.

---

## 17. Pencarian Global

Klik tombol **🔍 Cari** di sidebar (atau tekan `Ctrl/Cmd+K` shortcut, kalau diaktifkan).

### Jangkauan pencarian

Sistem cari paralel di:
- Jemaat (nama, email, telepon)
- Komsel (nama)
- Acara (judul)
- Catatan permintaan doa (judul)

Hasil disusun per kategori. Klik untuk navigate langsung.

### Tip

Cari nomor HP terakhir 4 digit (mis. `1234`) — sistem tetap match dari nomor lengkap.

---

## 18. Pengaturan (Settings)

Menu: **Pengaturan** (hanya untuk ADMIN+, kecuali audit log = SUPER_ADMIN).

### Users

Settings → **Users**: kelola akun login admin/staff.

- **+ Tambah User**: email, password, role (STAFF/LEADER/ADMIN), jemaat yang di-link (opsional)
- **Edit user**: ganti role, reset password, disable
- **Hapus user**: soft-delete (audit log tetap ada)

### Features

Settings → **Features**: toggle modul on/off untuk deployment ini. Lihat [`customization.md`](./customization.md).

### Audit Log

Settings → **Audit** (SUPER_ADMIN only): log semua aksi di sistem.

- Filter: action, entity type, user, tanggal
- Per entry: siapa, kapan, dari IP berapa, action apa, target apa, payload metadata

Pakai untuk:
- Investigasi insiden ("siapa yang ubah data jemaat X?")
- Compliance audit
- Debug ("kenapa giving record Y berubah?")

Audit log tidak bisa dihapus.

---

## 19. Skenario Umum (Cookbook)

### A. Onboarding jemaat baru (dari awal)

1. **Jemaat → + Tambah Jemaat** — isi data dasar
2. Set status = "Tamu" (belum anggota tetap)
3. Kalau ada household-nya: **Keluarga → tambah ke household existing** atau buat baru
4. Sambungkan ke komsel: **Komsel → [komsel] → tambah anggota**
5. Catat decision/baptism kalau sudah: **Pemuridan → catat milestone**
6. Setelah baptism: ubah status jadi **"Aktif"** + catat **Membership** milestone

### B. Setup minggu ibadah

1. Pastikan recurring service Minggu sudah ada (lihat [Kehadiran](#6-modul-kehadiran-attendance))
2. Setup tim pelayanan: **Pelayanan → jadwal baru** untuk worship, multimedia, dll, untuk tanggal Minggu yang akan datang
3. Buat acara khusus kalau ada (mis. baptisan): **Acara → + Tambah** + publish
4. Pesan reminder broadcast: **Komunikasi → Campaign → audience: aktif → kirim Sabtu sore**

### C. Closing books bulanan persembahan

Akhir bulan:
1. **Persembahan → Laporan** → lihat breakdown bulan
2. Cross-check dengan rekening koran bank
3. Kalau ada selisih: cari di list **Persembahan** (filter tanggal) → adjust kalau perlu (catat baru atau void yang salah)
4. Export ke spreadsheet: copy-paste manual dari tabel browser ke Excel/Google Sheets
5. Backup database (lihat [`deployment.md`](./deployment.md))

### D. Ganti pemimpin komsel

1. **Komsel → [komsel] → Ubah** → ganti `leader` ke jemaat baru
2. Sistem otomatis update role:
   - Leader lama → kalau tidak memimpin komsel lain, role-nya turun ke MEMBER
   - Leader baru → role naik ke LEADER
3. Kasih tahu leader baru via WA bahwa dia sekarang bisa login ke `/admin` (akses terbatas)

### E. Komunikasi crisis (mis. ibadah dibatalkan)

1. **Komunikasi → Campaign baru**
2. Template "Pengumuman Singkat" (atau buat baru)
3. Audience: semua jemaat aktif + tamu aktif
4. Channel: WhatsApp (cepat)
5. **Kirim Sekarang**

---

## 20. Troubleshooting

### "Saya tidak bisa login"

- Cek email & password (case sensitive)
- Hubungi super admin untuk reset
- Kalau masalah server-side: hubungi developer

### "Jemaat tidak menerima OTP WhatsApp"

- Cek `WHATSAPP_PROVIDER` di env — kalau `stub`, OTP cuma muncul di server log (development mode)
- Kalau provider real: cek device Fonnte connected, saldo cukup, nomor jemaat valid (format `+628xxx`)
- Cek rate limit: max 3 OTP per nomor per 15 menit (built-in safety)

### "Camera tidak jalan saat scan QR"

- Pastikan akses kamera di-allow di browser (icon gembok di address bar)
- HTTPS only — kamera tidak boleh di HTTP non-localhost
- Coba browser lain (Chrome / Edge / Safari iOS 14+)

### "Filter / search tidak return data"

- Refresh halaman (Ctrl+R) — kadang state filter stuck
- Reset semua filter ke "Any" → lihat list lengkap → narrow lagi
- Database baru di-restore? Tunggu beberapa detik lalu reload

### "Halaman lambat / loading lama"

- Database besar (>10k jemaat) bisa lambat di list. Pakai filter untuk narrow.
- Cek koneksi internet kamu
- Hubungi developer kalau berlanjut > 24 jam

### "Saya melihat 'Forbidden' / 'Not Found'"

- Kemungkinan role kamu tidak punya akses ke fitur itu
- Atau modul-nya di-disable via feature flag (lihat [`customization.md`](./customization.md))

---

## 21. Best Practices

### Data hygiene

- Setiap minggu: review jemaat status "Tamu" — promote ke "Aktif" atau "Non-aktif" sesuai kondisi
- Setiap bulan: review komsel coverage, sweep jemaat tanpa komsel
- Setiap kuartal: review jemaat tidak aktif → cari tahu kondisinya, tindak lanjut pastoral

### Backup

- Database **wajib** di-backup harian (lihat [`deployment.md`](./deployment.md))
- Test restore minimal 1x setahun (di environment staging)
- Foto profil & dokumen lain di `public/` juga ikut di-backup

### Permission

- Beri role **secukupnya** — staf umum cukup STAFF, jangan langsung ADMIN
- Rotasi password admin per kuartal
- Audit log review berkala: cek aktivitas anomali

### Komunikasi

- **Jangan spam**: maks 1 broadcast non-urgent per minggu
- Selalu **preview audience** sebelum kirim — pastikan tidak salah target
- Test kirim ke 1-2 nomor (tim) sebelum kirim massal

### Privasi data jemaat

- Catatan pastoral, persembahan, prayer requests = sensitif. Jangan share screenshot tanpa redact.
- Jangan ekspor list jemaat ke pihak luar gereja
- Saat handover akses staff lama: **disable user** segera, jangan delete (audit log butuh trace)

---

## Pertanyaan & Bantuan

Ada bug atau request fitur? Hubungi pengembang aplikasi (lihat [`README.md`](../README.md) untuk kontak repository).
