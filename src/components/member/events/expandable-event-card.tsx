"use client";

import * as React from "react";
import {
  Calendar,
  ExternalLink,
  MapPin,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { ContainerTransform } from "@/components/m3/container-transform";
import { MemberRsvpButtons } from "@/components/member/events/member-rsvp-button";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatJakarta } from "@/lib/datetime";
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";

export type ExpandableEventCardProps = {
  event: {
    id: string;
    title: string;
    description: string | null;
    startsAt: Date;
    endsAt: Date;
    location: string | null;
    capacity: number | null;
    fee: number | string | { toString(): string } | null;
    requiresRsvp: boolean;
    registrationOpen: boolean;
    _count: { rsvps: number };
    myRsvp: { id: string; status: string } | null;
  };
};

function statusKey(s: string): string {
  switch (s) {
    case "GOING":
      return "going";
    case "MAYBE":
      return "maybe";
    case "NOT_GOING":
      return "notGoing";
    case "WAITLIST":
      return "waitlist";
    default:
      return "notGoing";
  }
}

export function ExpandableEventCard({ event }: ExpandableEventCardProps) {
  const t = useTranslations("memberPortal.events");
  const tDetail = useTranslations("memberPortal.events.detail");
  const tStatus = useTranslations("events.rsvpStatus");

  const cardPreview = (
    <Card className="h-full transition-all hover:border-primary/40 hover:shadow-md">
      <CardContent className="flex flex-col gap-3 pt-6">
        <div className="flex items-start justify-between gap-2">
          <span className="text-lg font-semibold tracking-tight text-on-surface">
            {event.title}
          </span>
          {event.myRsvp ? (
            <Badge>{tStatus(statusKey(event.myRsvp.status))}</Badge>
          ) : null}
        </div>
        <div className="text-sm text-on-surface-variant">
          {formatJakarta(event.startsAt, "EEE, dd MMM yyyy · HH:mm")}
          {event.location ? ` · ${event.location}` : ""}
        </div>
        {event.capacity ? (
          <div className="text-xs text-on-surface-variant">
            {event._count.rsvps}/{event.capacity} {t("rsvpsAbbr")}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  return (
    <ContainerTransform
      title={event.title}
      triggerContent={cardPreview}
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
          className="group block h-full cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {cardPreview}
        </div>
      )}
    >
      {({ close }) => (
        <div className="flex max-h-[88vh] flex-col p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold leading-tight text-on-surface">
                  {event.title}
                </h2>
                {event.myRsvp ? (
                  <Badge>{tStatus(statusKey(event.myRsvp.status))}</Badge>
                ) : null}
              </div>
              <p className="text-xs text-on-surface-variant">
                {formatJakarta(event.startsAt, "EEEE, dd MMMM yyyy · HH:mm")}{" "}
                WIB
              </p>
            </div>
            <Button
              variant="text"
              size="icon"
              onClick={close}
              aria-label="Tutup detail acara"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="my-4 h-px bg-outline-variant/60" />

          {/* Details & RSVP */}
          <div className="overflow-y-auto pr-1 space-y-5">
            {/* Quick Metadata */}
            <div className="grid gap-3 sm:grid-cols-2 text-sm text-on-surface-variant bg-surface-container/60 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {formatJakarta(event.startsAt, "dd MMM yyyy · HH:mm")} -{" "}
                  {formatJakarta(event.endsAt, "HH:mm")} WIB
                </span>
              </div>
              {event.location ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>{event.location}</span>
                </div>
              ) : null}
              {event.capacity ? (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {event._count.rsvps}/{event.capacity} {t("rsvpsAbbr")}
                  </span>
                </div>
              ) : null}
              {event.fee ? (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary shrink-0" />
                  <span>{formatRupiah(event.fee)}</span>
                </div>
              ) : null}
            </div>

            {/* RSVP Form / Action */}
            {event.requiresRsvp ? (
              <div className="space-y-2 rounded-xl border border-outline-variant/50 p-4">
                <h3 className="font-semibold text-sm text-on-surface">
                  {tDetail("myRsvp")}
                </h3>
                <MemberRsvpButtons
                  eventId={event.id}
                  current={(event.myRsvp?.status as "GOING" | "MAYBE" | "NOT_GOING" | "WAITLIST") ?? null}
                  rsvpId={event.myRsvp?.id ?? null}
                  registrationOpen={event.registrationOpen}
                />
              </div>
            ) : null}

            {/* Description */}
            {event.description ? (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-on-surface">
                  {tDetail("about")}
                </h3>
                <MarkdownContent source={event.description} />
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/40">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/me/events/${event.id}`}>
                <ExternalLink className="h-4 w-4" />
                <span>Buka Halaman Lengkap</span>
              </Link>
            </Button>
            <Button variant="outlined" onClick={close}>
              {tDetail("backToList")}
            </Button>
          </div>
        </div>
      )}
    </ContainerTransform>
  );
}
