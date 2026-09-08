"use client";

import * as React from "react";
import {
  CalendarDays,
  Download,
  HeartHandshake,
  MapPin,
  QrCode,
  ScanLine,
  SunMedium,
  X,
} from "lucide-react";
import Image from "next/image";

import { ContainerTransform } from "@/components/m3/container-transform";
import { HeroBanner } from "@/components/m3/hero-banner";
import { Button } from "@/components/ui/button";
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

/**
 * The dashboard centrepiece: a boarding-pass-shaped `HeroBanner` for the next
 * service, with the member's identity QR one tap away.
 *
 * All the visual mechanics live in `HeroBanner` — this component's job is the
 * *content* decision: which of the next service, the standing serving duty, and
 * the QR is worth the top of the screen on any given Sunday.
 */
export function SmartWorshipPass({
  member,
  upcomingService,
  volunteerAssignment,
  qrDataUrl,
  hasSelfCheckIn,
}: SmartWorshipPassProps) {
  return (
    <HeroBanner
      badge={{
        icon: CalendarDays,
        label: upcomingService ? "Ibadah Terdekat" : "Sanctuari Jemaat",
      }}
      meta={member?.fullName}
      artwork={{ src: "/images/jesus-welcoming.jpg", priority: true }}
      title={
        upcomingService ? upcomingService.name : "Selamat Beristirahat dalam Kasih Tuhan"
      }
      detail={
        upcomingService ? (
          <>
            <span className="font-semibold text-primary">
              {formatJakarta(
                upcomingService.startsAt,
                "EEEE, dd MMMM yyyy · HH:mm",
              )}{" "}
              WIB
            </span>
            {upcomingService.location ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{upcomingService.location}</span>
              </span>
            ) : null}
          </>
        ) : null
      }
      description={
        upcomingService
          ? null
          : "Belum ada jadwal ibadah umum berikutnya. Tetap bertumbuh melalui renungan dan komsel."
      }
      actions={
        <>
          {hasSelfCheckIn ? (
            <Button
              asChild
              variant="filled"
              className="h-10 rounded-full px-5 text-xs font-semibold shadow-level-1 transition-all hover:shadow-level-2 active:scale-95 sm:text-sm"
            >
              <Link href="/me/check-in" className="flex items-center gap-2">
                <ScanLine className="h-4 w-4" />
                <span>Check-in Mandiri</span>
              </Link>
            </Button>
          ) : null}

          {qrDataUrl ? (
            <QrPassButton member={member} qrDataUrl={qrDataUrl} />
          ) : (
            <Button
              asChild
              variant="tonal"
              className="h-10 rounded-full px-4 text-xs font-semibold transition-all active:scale-95 sm:text-sm"
            >
              <Link href="/me/qr" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                <span>QR Saya</span>
              </Link>
            </Button>
          )}
        </>
      }
    >
      {volunteerAssignment ? (
        <div className="inline-flex max-w-fit items-center gap-2 rounded-2xl bg-secondary-container px-3.5 py-1.5 text-xs font-semibold text-on-secondary-container">
          <HeartHandshake className="h-4 w-4 shrink-0 text-primary" />
          <span>
            Tugas Pelayanan: {volunteerAssignment.team.name}
            {volunteerAssignment.position
              ? ` (${volunteerAssignment.position.name})`
              : ""}
          </span>
        </div>
      ) : null}
    </HeroBanner>
  );
}

/**
 * The QR is a container transform rather than a route: on a Sunday morning the
 * member is being waved through a door, and a page navigation there costs a
 * round trip they are standing still for.
 *
 * `data-m3-origin-hidden` plus the inline `visibility: hidden` is the fix for the
 * origin card ghosting behind the expanded surface — see `container-transform.tsx`.
 * The inline style is deliberate: a class would be a frame late.
 */
function QrPassButton({
  member,
  qrDataUrl,
}: {
  member: SmartWorshipPassProps["member"];
  qrDataUrl: string;
}) {
  const pill = (
    <div className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-surface-container-highest px-4 text-xs font-semibold text-on-surface shadow-level-0 transition-all hover:bg-surface-container-highest/80 active:scale-95 sm:text-sm">
      <QrCode className="h-4 w-4 text-primary" />
      <span>Tampilkan QR</span>
    </div>
  );

  return (
    <ContainerTransform
      title="QR Identitas Jemaat"
      maxWidth={420}
      triggerContent={pill}
      trigger={({ open, isOpen, ref }) => (
        <div
          ref={ref}
          onClick={open}
          tabIndex={0}
          role="button"
          aria-haspopup="dialog"
          data-m3-origin-hidden={isOpen ? "true" : undefined}
          style={
            isOpen
              ? {
                  visibility: "hidden",
                  opacity: 0,
                  transition: "none",
                  pointerEvents: "none",
                }
              : undefined
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              open();
            }
          }}
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {pill}
        </div>
      )}
    >
      {({ close }) => (
        <div className="flex flex-col p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-on-surface">
                QR Identitas Jemaat
              </h2>
              <p className="text-xs font-medium text-on-surface-variant">
                {member?.fullName ?? "Jemaat"}
              </p>
            </div>
            <Button
              variant="text"
              size="icon"
              onClick={close}
              aria-label="Tutup QR"
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-col items-center gap-4 py-6">
            <div className="rounded-3xl bg-white p-4 shadow-level-2">
              <Image
                src={qrDataUrl}
                alt={`QR Jemaat ${member?.fullName ?? ""}`}
                width={240}
                height={240}
                className="h-56 w-56 object-contain"
                unoptimized
              />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1 text-xs font-medium text-on-surface-variant">
              <SunMedium className="h-3.5 w-3.5 text-warning" />
              <span>Tingkatkan kecerahan layar untuk scan optimal</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-outline-variant/30 pt-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
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
              onClick={close}
              className="rounded-full px-5 text-xs"
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </ContainerTransform>
  );
}
