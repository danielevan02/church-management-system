# Panduan Pengguna — Jemaat

Panduan lengkap untuk **jemaat** menggunakan portal jemaat (Member Portal) di alamat `/me`. Dokumen ini bisa dibagikan ke jemaat sebagai referensi.

> **Untuk pengurus / staff**, lihat [`user-guide-admin.md`](./user-guide-admin.md).

---

## Daftar Isi

1. [Apa itu Portal Jemaat?](#1-apa-itu-portal-jemaat)
2. [Login dengan WhatsApp](#2-login-dengan-whatsapp)
3. [Install ke layar utama (PWA)](#3-install-ke-layar-utama-pwa)
4. [Dasbor Saya](#4-dasbor-saya)
5. [Profil Saya](#5-profil-saya)
6. [QR Pribadi](#6-qr-pribadi)
7. [Check-in Mandiri](#7-check-in-mandiri)
8. [Komsel Saya](#8-komsel-saya)
9. [Persembahan](#9-persembahan)
10. [Acara](#10-acara)
11. [Pelayanan Saya](#11-pelayanan-saya)
12. [Perjalanan Rohani (Pemuridan)](#12-perjalanan-rohani-pemuridan)
13. [Permintaan Doa](#13-permintaan-doa)
14. [Anak Saya](#14-anak-saya)
15. [Logout](#15-logout)
16. [FAQ — Pertanyaan Sering Ditanyakan](#16-faq--pertanyaan-sering-ditanyakan)

---

## 1. Apa itu Portal Jemaat?

Portal Jemaat adalah aplikasi web khusus untuk jemaat gereja, dengan fitur:

- **QR pribadi** untuk check-in cepat saat datang ke kebaktian
- Lihat **info komsel** (waktu & tempat pertemuan)
- **Beri persembahan** dan lihat riwayat persembahan kamu
- **RSVP acara** gereja (retreat, seminar, dll)
- Submit **permintaan doa** ke pengurus/komsel
- Konfirmasi **jadwal pelayanan**
- Lihat **perjalanan rohani** kamu (baptisan, kelas pemuridan, dll)
- Check-in **anak** ke Sekolah Minggu

Bisa diakses dari HP atau komputer manapun, atau **install ke home screen** seperti aplikasi native.

---

## 2. Login dengan WhatsApp

Login pakai nomor WhatsApp (tidak perlu password!).

### Langkah-langkah

1. Buka `https://<alamat-gereja>/auth/sign-in` di browser
2. Pilih tab **"Jemaat"** (bukan "Pengurus")
3. Masukkan nomor WA kamu (format `08xxxxxx` atau `+628xxxxxx`)
4. Klik **Kirim Kode**
5. Cek WhatsApp — akan masuk pesan berisi kode 6 digit (mis. `483291`)
6. Masukkan kode di halaman → klik **Verifikasi**
7. Berhasil masuk → otomatis redirect ke `/me/dashboard`

### Catatan

- Kode berlaku **5 menit**. Kalau habis, klik "Kirim Ulang"
- Maksimal **3 permintaan kode per 15 menit** per nomor (anti-spam)
- Maksimal **5x salah masukkan** kode — setelah itu request kode baru

### Kalau nomor tidak terdaftar

Sistem akan bilang: "Nomor tidak terdaftar. Hubungi pengurus gereja."

→ Hubungi pengurus untuk daftarkan nomor kamu di sistem.

---

## 3. Install ke layar utama (PWA)

Portal Jemaat bisa di-install seperti aplikasi native. Setelah install, ada ikon di home screen, dibuka full-screen tanpa address bar, dan bisa dipakai meski WiFi sebentar putus (offline).

### Di Android (Chrome / Edge)

1. Buka portal jemaat di Chrome
2. Pop-up "Install <Nama Gereja>?" akan muncul → tap **Install**
3. Atau: tap **menu (⋮)** di kanan atas browser → **"Add to Home screen"** / **"Install app"**
4. Konfirmasi → ikon muncul di home screen

### Di iPhone (Safari)

1. Buka portal di **Safari** (harus Safari, bukan Chrome iOS)
2. Tap tombol **Share** (kotak dengan panah ke atas) di bawah
3. Scroll ke bawah → tap **"Add to Home Screen"**
4. Konfirmasi nama → tap **Add**
5. Ikon muncul di home screen

### Di Desktop (Chrome / Edge)

1. Buka portal di browser
2. Di address bar, klik ikon install (kotak dengan panah ke bawah)
3. Konfirmasi → app muncul di Start Menu (Windows) atau Launchpad (Mac)

### Manfaat install

- Buka 1 tap dari home screen, tanpa ngetik URL
- Tampil full-screen seperti native app
- Bisa buka offline (halaman yang sudah pernah dibuka)
- QR pribadi tetap accessible meski sinyal jelek

---

## 4. Dasbor Saya

Halaman pertama setelah login: `/me/dashboard`. Ringkasan info penting kamu:

- **Aksi cepat**: 6 tombol shortcut — QR, Check-in, Profil, Beri Persembahan, Acara, Doa
- **Mendatang**:
  - Ibadah berikutnya (jadwal & lokasi)
  - Acara yang kamu RSVP (kalau ada)
  - Pelayanan kamu berikutnya (kalau ada)
- **Saya**:
  - Komsel kamu (nama, hari, tempat)
  - Total persembahan kamu tahun ini + persembahan terakhir
  - Perjalanan rohani: jumlah milestone + yang terbaru
- **Anak Saya** (kalau kamu guardian dan punya anak): list anak di rumah tangga

---

## 5. Profil Saya

Menu: **Profil** di sidebar (`/me/profile`).

### Yang BISA kamu ubah sendiri

- Foto profil
- Email
- Alamat
- Kota
- Tanggal lahir (kalau belum diisi pengurus)
- Preferensi komunikasi (mau terima broadcast atau tidak)

### Yang TIDAK bisa kamu ubah (read-only)

- Nama lengkap (hubungi pengurus kalau salah eja)
- Jenis kelamin
- Status keanggotaan
- Tanggal bergabung
- Tanggal baptis
- Gereja baptis

> Mengubah data identitas resmi memerlukan verifikasi pengurus.

### Cara update

1. **Profil** → klik **Edit**
2. Ubah field yang perlu
3. Klik **Simpan Perubahan**
4. Notifikasi hijau "Profil tersimpan"

---

## 6. QR Pribadi

Menu: **QR Saya** (`/me/qr`).

### Apa ini?

QR code unik berisi token yang menandai identitas kamu. Tunjukkan ke usher saat masuk kebaktian → mereka scan → tercatat hadir otomatis.

### Cara pakai

1. Saat tiba di gereja, buka **QR Saya** di HP
2. Tunjukkan QR ke usher di depan pintu
3. Usher scan dengan kamera → notifikasi hijau "Hadir tercatat"
4. Selesai — silakan masuk

### Penting!

- QR ini **personal** — jangan share ke orang lain
- Kalau orang lain pakai QR kamu, sistem tetap mencatat **atas nama kamu**
- QR berlaku 1 tahun, lalu refresh otomatis

### Download QR

Klik tombol **Unduh QR** untuk save sebagai gambar. Bisa di-print kalau perlu (mis. ditempel di stiker dompet).

### Offline-friendly

QR bisa dibuka **tanpa internet** kalau kamu sudah install PWA — penting kalau sinyal di gereja jelek.

---

## 7. Check-in Mandiri

Menu: **Check-in** (`/me/check-in`). Hanya muncul kalau fitur ini diaktifkan oleh gereja.

### Kenapa ada ini?

Daripada antri di pintu untuk di-scan usher, kamu bisa **check-in sendiri** dari HP saat tiba di gereja. Lebih cepat & mengurangi antrian.

### Cara A: Scan QR ibadah di pintu (paling cepat — 1 detik)

Gereja biasanya **menempel banner besar** dengan QR di pintu masuk untuk tiap ibadah. Ada 2 sub-cara scan:

**A1. Pakai aplikasi Kamera bawaan HP** (kalau HP kamu support — kebanyakan iPhone & Android baru):
1. Pastikan sudah **login ke portal jemaat** sebelumnya (sesi bertahan 30 hari)
2. Buka aplikasi **Kamera** di HP (sama seperti scan QRIS untuk pembayaran)
3. Arahkan ke QR di banner → muncul notifikasi/link kuning di atas → tap
4. Browser/PWA terbuka → otomatis masuk ke check-in → notifikasi hijau **"Berhasil hadir!"**

**A2. Pakai scanner di dalam app** (kalau kamera HP gak deteksi QR otomatis — terutama Android lama / merek lokal):
1. Buka portal jemaat → menu **Check-in**
2. Tap tombol **Scan QR Banner** di kanan atas
3. Izinkan akses kamera (sekali saja, browser ingat)
4. Arahkan ke QR banner → otomatis check-in → toast hijau "Berhasil hadir!"

Kedua cara hasilnya sama. **A1 lebih cepat** karena gak perlu buka app dulu. **A2 lebih reliable** karena pakai scanner kustom yang dijamin support semua HP.

### Cara B: Buka menu Check-in manual

1. Saat sudah ada di area gereja, buka **Check-in**
2. Sistem otomatis tampilkan ibadah yang sedang berlangsung (di window 1 jam sebelum-sesudah)
3. Klik tombol **Check-in Sekarang**
4. Notifikasi hijau "Berhasil check-in"

### Catatan

- Check-in mandiri **hanya bisa dilakukan saat di lokasi gereja** (tidak bisa dari rumah) — sistem cek waktu, bukan lokasi GPS, jadi ada window terbatas
- Tidak bisa check-in 2x untuk ibadah yang sama
- Kalau salah check-in, hubungi usher/pengurus untuk koreksi

---

## 8. Komsel Saya

Menu: **Komsel Saya** (`/me/cell-group`).

Kalau kamu sudah tergabung di komsel, halaman ini menampilkan:
- Nama komsel
- Pemimpin komsel
- Hari & jam pertemuan
- Lokasi pertemuan
- List anggota

### Belum punya komsel?

Halaman akan tampil "Anda belum tergabung di komsel manapun." Hubungi pengurus untuk bergabung di komsel terdekat dari rumah kamu.

### Pindah komsel

Tidak bisa pindah sendiri — hubungi pengurus / pemimpin komsel saat ini untuk koordinasi pindahan.

---

## 9. Persembahan

Menu: **Persembahan Saya** (`/me/giving`).

### Lihat riwayat

Tab **Riwayat**: list semua persembahan yang sudah tercatat:
- Tanggal
- Nominal
- Fund (Operasional / Misi / Pembangunan / dll)
- Metode (Cash / Transfer / QRIS)

Total YTD (year-to-date) ditampilkan di atas — sebagai referensi untuk laporan pajak (kalau diperlukan).

### Beri persembahan

Tab **Beri Persembahan** (`/me/giving/give`):

#### Via Transfer Bank

1. Pilih **Transfer Bank**
2. Sistem tampilkan info: nama bank, nomor rekening, nama pemilik
3. Transfer dari bank kamu ke rekening tersebut
4. **Setelah transfer**, klik **Konfirmasi Transfer** → diarahkan ke WhatsApp pengurus untuk kirim bukti
5. Pengurus akan input persembahan ke sistem (manual cocok dengan rekening koran)
6. Beberapa hari kemudian akan muncul di tab **Riwayat**

#### Via QRIS

1. Pilih **QRIS**
2. Tampil gambar QR — scan dengan e-wallet (GoPay / OVO / DANA / ShopeePay / m-banking)
3. Lakukan pembayaran
4. Sama seperti transfer: konfirmasi via WhatsApp ke pengurus

#### Via Cash

Persembahan tunai langsung saat ibadah — dimasukkan ke kotak persembahan saat kebaktian. Pengurus akan input ke sistem bersama persembahan jemaat lain.

### Kenapa tidak ada Midtrans / direct payment?

Sistem ini **bukan** payment gateway. Pencatatan persembahan dilakukan manual oleh pengurus berdasarkan rekening koran bank — supaya transparan & 100% akurat. Pembayaran online direct akan ditambahkan di phase berikutnya.

---

## 10. Acara

Menu: **Acara** (`/me/events`).

### Lihat acara mendatang

List semua acara yang sudah dipublish gereja: retreat, seminar, kebaktian khusus, dll.

Per acara:
- Judul, tanggal, lokasi
- Kapasitas (kalau ada batas)
- Biaya (kalau berbayar)
- Status RSVP kamu (Hadir / Mungkin / Tidak Hadir / belum RSVP)

### RSVP

1. Klik acara → halaman detail
2. Pilih **Hadir / Mungkin / Tidak Hadir**
3. Kalau acara butuh konfirmasi jumlah orang (mis. retreat keluarga), isi field "guest count"
4. Klik **Simpan RSVP**

### Waitlist

Kalau acara penuh:
- Status RSVP kamu = **Waitlist**
- Pengurus akan notify kalau ada slot kosong (mis. ada yang batal)

### Batal RSVP

Buka detail acara → klik **Batalkan RSVP**. Slot kamu jadi available untuk orang waitlist.

### Acara berbayar

Acara berbayar (mis. retreat Rp 500k):
- Setelah RSVP, info pembayaran muncul di halaman detail
- Pembayaran via transfer / QRIS sama seperti persembahan
- Pengurus konfirmasi pembayaran → status RSVP berubah jadi **Confirmed**

---

## 11. Pelayanan Saya

Menu: **Pelayanan Saya** (`/me/volunteer`). Hanya muncul kalau kamu pelayan/sukarelawan.

### Lihat jadwal

Tab **Akan Datang**: list jadwal pelayanan kamu (worship, multimedia, usher, dll).

Per jadwal:
- Tim & posisi
- Tanggal & jam pelayanan
- Status (Pending / Confirmed / Declined)

### Konfirmasi jadwal

Saat pengurus assign kamu, status awalnya **Pending** dan kamu dapat notifikasi WA.

1. Buka **Pelayanan Saya**
2. Klik jadwal yang status Pending
3. Pilih **Terima** atau **Tolak**

### Tolak (decline)

Kalau ada halangan:
- Klik **Tolak**
- Sistem otomatis kasih tahu pengurus → mereka cari pengganti
- Status berubah ke **Declined**

> Mohon konfirmasi atau tolak **paling lambat 3 hari** sebelum tanggal pelayanan supaya pengurus punya waktu cari pengganti.

### Riwayat

Tab **Pelayanan Sebelumnya**: track record pelayanan kamu sepanjang waktu.

---

## 12. Perjalanan Rohani (Pemuridan)

Menu: **Perjalanan Saya** (`/me/discipleship`).

### Apa ini?

Timeline milestone rohani kamu yang dicatat oleh gembala/pengurus:

- Keputusan menerima Yesus
- Baptisan
- Keanggotaan
- Kelas Dasar
- Kelas Pemuridan
- Pelatihan Pemimpin
- Diangkat jadi pemimpin komsel
- Perjalanan misi

Plus catatan custom dari pengurus.

### Tampilan

Timeline vertikal dengan tanggal achieve. Klik milestone untuk lihat catatan tambahan (kalau ada).

### Kalau kosong

"Belum ada milestone tercatat" — wajar kalau kamu baru bergabung. Pengurus akan input setelah ada event signifikan.

### Catatan saya salah?

Hubungi pengurus / gembala untuk koreksi. Kamu **tidak bisa edit sendiri** (data ini bersifat resmi).

---

## 13. Permintaan Doa

Menu: **Doa & Permohonan** (`/me/prayer-requests`).

### Submit permintaan doa

1. Klik **+ Permintaan Doa Baru**
2. Isi:
   - **Judul** singkat (mis. "Kesembuhan ayah")
   - **Body** detail (sebebas mungkin, ceritakan kondisinya)
   - **Anonim?** (default: tidak)
     - Anonim = pengurus tetap tahu kamu, tapi tidak dipajang nama di list publik
   - **Public?** (default: tidak)
     - Public = boleh disebarkan ke jemaat lain untuk didoakan bareng
     - Private = hanya pengurus & gembala yang lihat
3. Klik **Submit**

### Status permintaan

| Status | Arti |
|---|---|
| **Open** | Baru masuk, sedang diproses pengurus |
| **Praying** | Sedang didoakan |
| **Answered** | Sudah dijawab Tuhan — testimoni boleh diisi |
| **Closed** | Tutup tanpa update |

### Lihat permintaan kamu

Tab **Permintaan Saya**: list semua submission kamu, termasuk status terkini.

### Edit / hapus

Klik permintaan → **Edit** (selama status Open). Setelah Praying, hanya pengurus yang bisa update.

---

## 14. Anak Saya

Menu: **Anak Saya** (`/me/children`). Hanya muncul kalau kamu **guardian** (orang tua / wali) yang punya anak di rumah tangga.

### Tampilan

List anak-anak (jemaat berusia di bawah cutoff anak, default ≤12 tahun) yang ada di household yang sama dengan kamu:
- Foto, nama, tanggal lahir
- Riwayat check-in Sekolah Minggu

### Check-in Sekolah Minggu

Saat tiba di gereja:
1. **Anak Saya** → pilih anak
2. Klik **Check-in** → pilih kelas (sistem auto-suggest berdasarkan umur)
3. Sticker / nomor antrean tampil
4. Antar anak ke ruang kelas

### Check-out

Saat jemput:
1. **Anak Saya** → tab **Sedang Check-in**
2. Klik **Check-out** → konfirmasi siapa yang jemput
3. Selesai

### Kalau anak tidak muncul

- Pastikan anak sudah didaftarkan sebagai jemaat oleh pengurus
- Pastikan anak berada di **household yang sama** dengan kamu
- Kalau usia >12 tahun, otomatis tidak masuk daftar anak — sudah dianggap remaja

Hubungi pengurus untuk koreksi data household.

---

## 15. Logout

Klik **avatar kamu** di pojok kiri bawah sidebar → dropdown muncul → **Sign out**.

Sesi langsung berakhir. Untuk login lagi, perlu request OTP baru via WhatsApp.

---

## 16. FAQ — Pertanyaan Sering Ditanyakan

### Q: Saya tidak menerima OTP WhatsApp. Apa yang salah?

A: Cek:
- Nomor yang kamu masukkan benar (format `08xxx` atau `+62xxx`)
- WA aktif, tidak block dari nomor pengirim gereja
- Tunggu 1-2 menit (kadang delay)
- Klik **Kirim Ulang** kalau lebih dari 5 menit
- Kalau tetap tidak masuk: hubungi pengurus, mungkin nomor kamu di sistem berbeda

### Q: Bisa login pakai email saja?

A: **Tidak**. Login jemaat WAJIB pakai WA OTP. Email & password hanya untuk pengurus/staff.

### Q: Kalau ganti nomor HP, bagaimana?

A: Hubungi pengurus untuk update nomor di sistem. Setelah itu, login pakai nomor baru.

### Q: Kenapa profil saya tidak bisa diubah semua?

A: Beberapa field (nama lengkap, jenis kelamin, status, tanggal baptis) **read-only** untuk jemaat. Hubungi pengurus kalau ada yang salah.

### Q: QR saya bocor / dipakai orang lain. Bagaimana?

A: Hubungi pengurus untuk **regenerate QR** kamu. QR lama jadi invalid.

### Q: Saya install PWA tapi tetap minta login terus?

A: PWA simpan login normal seperti browser biasa. Sesi expired setelah ~30 hari. Login lagi via WA OTP.

### Q: Bisa login di 2 device sekaligus?

A: **Bisa**. Misalnya HP + tablet. Tidak ada batas device.

### Q: Aplikasi tidak update ke versi terbaru.

A: **Force refresh**:
- Android Chrome: tutup app → buka lagi
- iPhone Safari: tutup tab → buka lagi
- Atau: buka portal di browser, tekan **Ctrl+Shift+R** (Windows) / **Cmd+Shift+R** (Mac)

### Q: Persembahan saya dari Januari belum muncul di Riwayat.

A: Persembahan di-input manual oleh pengurus dari rekening koran bank. Tunggu 1-2 minggu setelah tanggal transfer. Kalau lebih dari sebulan belum muncul, hubungi pengurus dengan **bukti transfer** (screenshot mutasi rekening).

### Q: Saya bisa lihat persembahan jemaat lain?

A: **Tidak**. Hanya pengurus/admin yang bisa lihat data persembahan jemaat lain. Kamu hanya lihat persembahan kamu sendiri.

### Q: Permintaan doa anonim — pengurus tetap tahu siapa saya?

A: **Ya**, anonim hanya menyembunyikan nama dari list publik (kalau ditampilkan). Pengurus tetap tahu siapa pengirim agar bisa follow-up secara pastoral kalau perlu.

### Q: RSVP ada kuota waitlist. Pasti dapet slot kalau ada yang batal?

A: Tidak otomatis. Pengurus manual approve dari waitlist (urut FIFO biasanya). Kamu akan dapat notifikasi WA kalau di-promote.

### Q: Bagaimana download semua data saya?

A: Belum ada fitur self-service export. Hubungi pengurus untuk request copy data.

### Q: Saya pindah gereja. Akun saya bagaimana?

A: Hubungi pengurus, mereka akan ubah status kamu jadi "Pindah". Login akan dinonaktifkan, tapi data riwayat tetap tersimpan untuk audit.

### Q: Kontak support kalau butuh bantuan teknis?

A: Hubungi pengurus gereja kamu (lihat info kontak di website utama gereja). Pengurus akan eskalasi ke developer kalau perlu.

---

## Tips & Trik

- **Bookmark URL** portal jemaat di browser untuk akses cepat (kalau belum install PWA)
- **Set foto profil** dengan foto wajah jelas → memudahkan pengurus & sesama jemaat mengenal kamu
- **Update preferensi komunikasi** kalau tidak mau terima broadcast — biar inbox WA tidak penuh
- **Submit permintaan doa bahkan untuk hal kecil** — jemaat lain dengan pengalaman yang sama bisa kasih dukungan
- **Konfirmasi RSVP cepat** — bantu pengurus prepare logistik acara
- **Check QR terlebih dahulu** sebelum berangkat ke gereja — antisipasi sinyal hilang saat tiba

---

Selamat memakai Portal Jemaat! Tuhan memberkati 🙏
