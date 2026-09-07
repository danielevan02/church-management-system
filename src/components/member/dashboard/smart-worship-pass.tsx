"use client";

import * as React from "react";
import {
  CalendarDays,
  Church,
  Download,
  HeartHandshake,
  MapPin,
  QrCode,
  ScanLine,
  SunMedium,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";

export type SmartWorshipPassProps = {
  member: {
    id: string;
    fullName: string;
    firstName: string;
  } | null;
  upcomingService: {
    id: string;
    name: string;
    startsAt: Date;
    location: string | null;
  } | null;
  volunteerAssignment?: {
    team: { name: string };
    position?: { name: string } | null;
    serviceDate: Date;
    status: string;
  } | null;
  qrDataUrl: string | null;
  hasSelfCheckIn: boolean;
};

export function SmartWorshipPass({
  member,
  upcomingService,
  volunteerAssignment,
  qrDataUrl,
  hasSelfCheckIn,
}: SmartWorshipPassProps) {
  const [qrOpen, setQrOpen] = React.useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-surface-container-high to-surface-container p-5 sm:p-7 shadow-level-0 transition-all duration-300">
      {/* Subtle Background Watermark / Ambient Accent */}
      <Church
        aria-hidden
        className="pointer-events-none absolute -right-6 -bottom-8 h-48 w-48 text-primary/[0.04] select-none"
      />

      <div className="relative flex flex-col gap-4">
        {/* Pass Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{upcomingService ? "Ibadah Terdekat" : "Sanctuari Jemaat"}</span>
          </div>

          {member ? (
            <span className="text-xs font-medium text-on-surface-variant">
              {member.fullName}
            </span>
          ) : null}
        </div>

        {/* Service Core Info */}
        {upcomingService ? (
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface leading-tight">
              {upcomingService.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-on-surface-variant">
              <span className="font-semibold text-primary">
                {formatJakarta(upcomingService.startsAt, "EEEE, dd MMMM yyyy · HH:mm")} WIB
              </span>
              {upcomingService.location ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{upcomingService.location}</span>
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-1 py-1">
            <h2 className="text-lg font-bold text-on-surface">
              Selamat Beristirahat dalam Kasih Tuhan
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Belum ada jadwal ibadah umum berikutnya. Tetap bertumbuh melalui renungan dan komsel.
            </p>
          </div>
        )}

        {/* Volunteer Duty Badge (if assigned to serve on duty) */}
        {volunteerAssignment ? (
          <div className="inline-flex max-w-fit items-center gap-2 rounded-2xl bg-secondary-container px-3.5 py-1.5 text-xs font-semibold text-on-secondary-container">
            <HeartHandshake className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Tugas Pelayanan: {volunteerAssignment.team.name}
              {volunteerAssignment.position ? ` (${volunteerAssignment.position.name})` : ""}
            </span>
          </div>
        ) : null}

        {/* Action Group: Instant Check-in & Interactive QR Modal */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {hasSelfCheckIn ? (
            <Button
              asChild
              variant="filled"
              className="rounded-full px-5 h-10 text-xs sm:text-sm font-semibold shadow-level-1 hover:shadow-level-2 active:scale-95 transition-all"
            >
              <Link href="/me/check-in" className="flex items-center gap-2">
                <ScanLine className="h-4 w-4" />
                <span>Check-in Mandiri</span>
              </Link>
            </Button>
          ) : null}

          {qrDataUrl ? (
            <Dialog open={qrOpen} onOpenChange={setQrOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="tonal"
                  className="rounded-full px-4 h-10 text-xs sm:text-sm font-semibold flex items-center gap-2 active:scale-95 transition-all"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Tampilkan QR</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader className="text-center sm:text-center">
                  <DialogTitle className="text-xl font-bold">
                    QR Identitas Jemaat
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    {member?.fullName ?? "Jemaat"}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="rounded-2xl bg-white p-4 shadow-level-1">
                    <Image
                      src={qrDataUrl}
                      alt={`QR Jemaat ${member?.fullName ?? ""}`}
                      width={240}
                      height={240}
                      className="h-56 w-56 object-contain"
                      unoptimized
                    />
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-[11px] font-medium text-on-surface-variant">
                    <SunMedium className="h-3.5 w-3.5 text-warning" />
                    <span>Tingkatkan kecerahan layar untuk scan optimal</span>
                  </div>
                </div>

                <DialogFooter className="flex flex-row items-center justify-between gap-2 sm:justify-between">
                  <Button asChild variant="ghost" size="sm" className="text-xs">
                    <a
                      href={qrDataUrl}
                      download={`qr-${member?.id ?? "jemaat"}.png`}
                      className="flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Simpan QR</span>
                    </a>
                  </Button>
                  <Button
                    variant="tonal"
                    size="sm"
                    onClick={() => setQrOpen(false)}
                    className="rounded-full px-4"
                  >
                    Tutup
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              asChild
              variant="tonal"
              className="rounded-full px-4 h-10 text-xs sm:text-sm font-semibold active:scale-95 transition-all"
            >
              <Link href="/me/qr" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                <span>QR Saya</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
