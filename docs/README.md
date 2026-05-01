# Dokumentasi

Index untuk semua dokumentasi proyek. Pilih dokumen sesuai kebutuhan kamu:

## Untuk pengguna aplikasi

| Dokumen | Audiens | Isi |
|---|---|---|
| [`user-guide-admin.md`](./user-guide-admin.md) | Pengurus, staff, gembala | Panduan lengkap operasional admin: 13 modul step-by-step, skenario umum, troubleshooting, best practices |
| [`user-guide-jemaat.md`](./user-guide-jemaat.md) | Anggota jemaat | Panduan portal jemaat (`/me`): login phone+PIN, install PWA, push notif, fitur QR/giving/RSVP/doa/renungan, FAQ |

## Untuk teknisi & deployment

| Dokumen | Audiens | Isi |
|---|---|---|
| [`deployment.md`](./deployment.md) | Devops / yang men-deploy | Runbook deployment: Vercel+Neon, self-host Docker, post-deploy checklist, rotation, upgrade |
| [`runbook.md`](./runbook.md) | Devops / yang on-call | Operasi pasca-deploy: backup/restore, admin lockout recovery, push troubleshooting, migrasi gagal |
| [`customization.md`](./customization.md) | Devops / yang men-customize | Branding via env, asset replacement, PWA icons, feature flags, lokalisasi, data import |
| [`../README.md`](../README.md) | Developer / kontributor | Overview proyek, tech stack, dev quick-start, common commands, project structure, conventions |
| [`../CLAUDE.md`](../CLAUDE.md) | Developer / AI assistant | Konvensi proyek lengkap, do's & don'ts, arsitektur |

## Cara pakai dokumentasi ini

### Sebagai pengembang yang men-deploy gereja baru

1. Baca [`../README.md`](../README.md) untuk overview teknis
2. Ikuti [`deployment.md`](./deployment.md) end-to-end
3. Ikuti [`customization.md`](./customization.md) untuk branding gereja
4. Setelah live, kirim [`user-guide-admin.md`](./user-guide-admin.md) ke pengurus gereja

### Sebagai pengurus gereja yang baru pertama kali pakai

1. Baca [`user-guide-admin.md`](./user-guide-admin.md) — minimal section 1-3 untuk orientasi
2. Lompat ke section modul yang sedang kamu pakai (mis. [Kehadiran](./user-guide-admin.md#6-modul-kehadiran-attendance) saat hari Minggu)
3. Saat ada masalah, lihat section [Troubleshooting](./user-guide-admin.md#20-troubleshooting)
4. Untuk best practices jangka panjang, lihat section [Best Practices](./user-guide-admin.md#21-best-practices)

### Sebagai jemaat yang baru install portal

1. Baca [`user-guide-jemaat.md`](./user-guide-jemaat.md) section 1-3 (apa ini, login, install)
2. Saat ada pertanyaan spesifik, langsung lompat ke section yang relevan
3. Bagian [FAQ](./user-guide-jemaat.md#16-faq--pertanyaan-sering-ditanyakan) menjawab pertanyaan umum

## Format & cetak

Semua dokumentasi ditulis dalam **Markdown**. Bisa:
- **Dibaca di GitHub** langsung (rendering otomatis)
- **Di-print** dari browser (Ctrl+P → Save as PDF)
- **Di-convert ke PDF** pakai [pandoc](https://pandoc.org/) atau [Markdown to PDF online tools](https://www.markdowntopdf.com/)
- **Di-share via WA** sebagai link langsung ke file di GitHub

## Update dokumentasi

Saat ada fitur baru atau perubahan workflow, update dokumen yang relevan dan commit bersamaan dengan perubahan kode. Jangan biarkan dokumentasi out-of-date — lebih baik tidak ada daripada salah.
