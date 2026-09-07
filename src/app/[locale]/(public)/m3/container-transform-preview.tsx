"use client";

import * as React from "react";
import { Calendar, MapPin, Sparkles, UserCheck, X } from "lucide-react";

import { ContainerTransform } from "@/components/m3/container-transform";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardEyebrow,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ContainerTransformPreview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Card 1: Ibadah Raya */}
      <ContainerTransform
        title="Detail Ibadah Raya"
        triggerContent={
          <Card className="h-full border-none bg-surface-container shadow-none">
            <CardHeader>
              <CardEyebrow>Ibadah Raya</CardEyebrow>
              <CardTitle>Minggu Pagi 09:00 WIB</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-body-md text-on-surface-variant">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Gedung Utama Lt. 2</span>
              </div>
              <p className="text-body-sm text-outline">
                Klik kartu ini — perhatikan kartu ini akan lepas dari posisinya dan terbang ke tengah...
              </p>
            </CardContent>
          </Card>
        }
        trigger={({ open, ref }) => (
          <div
            ref={ref}
            onClick={open}
            tabIndex={0}
            role="button"
            aria-haspopup="dialog"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
              }
            }}
            className="cursor-pointer rounded-lg outline-none transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Card interactive className="h-full group hover:shadow-level-2">
              <CardHeader>
                <CardEyebrow>Ibadah Raya</CardEyebrow>
                <CardTitle>Minggu Pagi 09:00 WIB</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-body-md text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Gedung Utama Lt. 2</span>
                </div>
                <p className="text-body-sm text-outline">
                  Klik kartu ini — perhatikan kartu ini akan lepas dari posisinya dan terbang ke tengah...
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      >
        {({ close }) => (
          <div className="flex flex-col gap-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-label-md font-semibold tracking-wider text-primary uppercase">
                  Ibadah Raya · Minggu
                </span>
                <h3 className="text-headline-md mt-1 font-semibold">
                  Minggu Pagi 09:00 WIB
                </h3>
              </div>
              <Button
                variant="text"
                size="icon"
                onClick={close}
                aria-label="Tutup detail"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-px bg-outline-variant/60" />

            <div className="space-y-3 text-body-md text-on-surface-variant">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Minggu, 13 September 2026 · 09:00 - 11:00 WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Gedung Utama Lt. 2 (Kapasitas 450 jemaat)</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <span>Pengkhotbah: Pdt. Budi Santoso, S.Th.</span>
              </div>

              <div className="mt-4 rounded-xl bg-surface-container-highest/70 p-4 text-body-sm">
                <p className="font-medium text-on-surface">
                  Tentang Pola Transisi M3 Container Transform:
                </p>
                <p className="mt-1 text-on-surface-variant">
                  Kartu di kisi (<em>grid</em>) secara fisik lepas dari slot asalnya
                  dan terbang langsung ke tengah layar sambil membesar dengan pegas spasial M3.
                  Saat ditutup, kontainer ini akan terbang kembali tepat ke slot asalnya!
                </p>
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outlined" onClick={close}>
                Tutup
              </Button>
              <Button variant="filled" onClick={close}>
                Konfirmasi Kehadiran
              </Button>
            </div>
          </div>
        )}
      </ContainerTransform>

      {/* Card 2: Ibadah Pemuda (Untuk perbandingan berdampingan) */}
      <ContainerTransform
        title="Detail Ibadah Pemuda"
        triggerContent={
          <Card className="h-full border-none bg-surface-container shadow-none">
            <CardHeader>
              <CardEyebrow>Youth &amp; Young Adult</CardEyebrow>
              <CardTitle>Sabtu Sore 17:00 WIB</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-body-md text-on-surface-variant">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Ruang Pemuda Lt. 3</span>
              </div>
              <p className="text-body-sm text-outline">
                Klik kartu kedua ini untuk melihat kartu ini melayang dari kanan ke tengah...
              </p>
            </CardContent>
          </Card>
        }
        trigger={({ open, ref }) => (
          <div
            ref={ref}
            onClick={open}
            tabIndex={0}
            role="button"
            aria-haspopup="dialog"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
              }
            }}
            className="cursor-pointer rounded-lg outline-none transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Card interactive className="h-full group hover:shadow-level-2">
              <CardHeader>
                <CardEyebrow>Youth &amp; Young Adult</CardEyebrow>
                <CardTitle>Sabtu Sore 17:00 WIB</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-body-md text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Ruang Pemuda Lt. 3</span>
                </div>
                <p className="text-body-sm text-outline">
                  Klik kartu kedua ini untuk melihat kartu ini melayang dari kanan ke tengah...
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      >
        {({ close }) => (
          <div className="flex flex-col gap-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-label-md font-semibold tracking-wider text-primary uppercase">
                  Youth &amp; Young Adult · Sabtu
                </span>
                <h3 className="text-headline-md mt-1 font-semibold">
                  Sabtu Sore 17:00 WIB
                </h3>
              </div>
              <Button
                variant="text"
                size="icon"
                onClick={close}
                aria-label="Tutup detail"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-px bg-outline-variant/60" />

            <div className="space-y-3 text-body-md text-on-surface-variant">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-tertiary" />
                <span>Praise &amp; Worship + Fellowship &amp; Diskusi Terbuka</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Ruang Pemuda Lt. 3 (Kapasitas 120 orang)</span>
              </div>

              <div className="mt-4 rounded-xl bg-surface-container-highest/70 p-4 text-body-sm">
                <p className="font-medium text-on-surface">
                  Perhatikan Perbedaan Posisi Asal:
                </p>
                <p className="mt-1 text-on-surface-variant">
                  Karena kartu ini berada di kolom kanan, animasinya secara dinamis
                  berangkat dari koordinat kolom kanan menuju ke tengah, dan akan kembali
                  ke kolom kanan saat Anda menutupnya.
                </p>
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outlined" onClick={close}>
                Tutup
              </Button>
              <Button variant="filled" onClick={close}>
                Daftar Hadir
              </Button>
            </div>
          </div>
        )}
      </ContainerTransform>
    </div>
  );
}
