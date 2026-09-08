import { Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { ExpressiveCard } from "@/components/m3/expressive-card";
import { PageHeader } from "@/components/m3/page-header";
import { DeleteEventButton } from "./delete-event-button";
import { DeleteRsvpButton } from "@/components/admin/events/delete-rsvp-button";
import { GuestRsvpForm } from "@/components/admin/events/guest-rsvp-form";
import { PublishToggleButton } from "@/components/admin/events/publish-toggle-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { getEventWithRsvps } from "@/server/queries/events";
import { formatJakarta } from "@/lib/datetime";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventWithRsvps(id);
  if (!event) notFound();

  const t = await getTranslations("events.detail");
  const tStatus = await getTranslations("events.rsvpStatus");

  const goingTotal = event.rsvps
    .filter((r) => r.status === "GOING")
    .reduce((acc, r) => acc + r.guestCount, 0);
  const waitlistTotal = event.rsvps.filter((r) => r.status === "WAITLIST").length;
  const maybeTotal = event.rsvps.filter((r) => r.status === "MAYBE").length;

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/events"
        backLabel={t("backToList")}
        title={event.title}
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={event.isPublished ? "default" : "secondary"}>
              {event.isPublished ? t("statusPublished") : t("statusDraft")}
            </Badge>
            <span>•</span>
            <span>
              {formatJakarta(event.startsAt, "EEE, dd MMM yyyy · HH:mm")}
              {" → "}
              {formatJakarta(event.endsAt, "HH:mm")}
            </span>
            {event.location ? (
              <>
                <span>•</span>
                <span>{event.location}</span>
              </>
            ) : null}
          </div>
        }
        action={
          <>
            <Button asChild variant="outlined" className="rounded-full">
              <Link href={`/admin/events/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                {t("edit")}
              </Link>
            </Button>
            <PublishToggleButton id={id} isPublished={event.isPublished} />
            <DeleteEventButton id={id} />
          </>
        }
      />

      {event.description ? (
        <ExpressiveCard padding="compact">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-on-surface-variant">
            {event.description}
          </p>
        </ExpressiveCard>
      ) : null}

      <div suppressHydrationWarning data-stagger="cards" className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label={t("statGoing")} value={goingTotal}>
          {event.capacity ? `/ ${event.capacity}` : null}
        </StatCard>
        <StatCard label={t("statWaitlist")} value={waitlistTotal} />
        <StatCard label={t("statMaybe")} value={maybeTotal} />
        <StatCard
          label={t("statFee")}
          textValue={event.fee ? formatRupiah(event.fee) : "—"}
        />
      </div>

      <BlockSection
        title={t("addGuestTitle")}
        description={t("addGuestDescription")}
      >
        <GuestRsvpForm eventId={id} />
      </BlockSection>

      <BlockSection
        title={t("rosterTitle")}
        description={t("rosterDescription", { count: event.rsvps.length })}
      >
        {event.rsvps.length === 0 ? (
          <p className="text-sm text-on-surface-variant">{t("rosterEmpty")}</p>
        ) : (
          <div className="rounded-lg bg-surface-container-low overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("colName")}</TableHead>
                  <TableHead>{t("colStatus")}</TableHead>
                  <TableHead>{t("colCount")}</TableHead>
                  <TableHead>{t("colNotes")}</TableHead>
                  <TableHead className="text-right">{t("colActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.rsvps.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {r.member?.photoUrl ? (
                            <AvatarImage
                              src={r.member.photoUrl}
                              alt={r.member.fullName}
                            />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {(r.member?.fullName ?? r.guestName ?? "?")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          {r.member ? (
                            <Link
                              href={`/admin/members/${r.member.id}`}
                              className="font-medium hover:underline"
                            >
                              {r.member.fullName}
                            </Link>
                          ) : (
                            <span className="font-medium">
                              {r.guestName}{" "}
                              <span className="text-xs text-on-surface-variant">
                                ({t("guestTag")})
                              </span>
                            </span>
                          )}
                          <span className="text-xs text-on-surface-variant">
                            {r.member?.phone ?? r.guestPhone ?? "—"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RsvpStatusBadge
                        status={r.status}
                        label={tStatus(statusKey(r.status))}
                      />
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {r.guestCount}
                    </TableCell>
                    <TableCell className="text-xs text-on-surface-variant">
                      {r.notes ?? ""}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteRsvpButton rsvpId={r.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </BlockSection>
    </div>
  );
}

function StatCard({
  label,
  value,
  textValue,
  children,
}: {
  label: string;
  value?: number;
  textValue?: string;
  children?: React.ReactNode;
}) {
  return (
    <ExpressiveCard className="pt-6">
      <div className="text-3xl font-bold tabular-nums">
        {value !== undefined ? value : textValue ?? "—"}
        {children ? (
          <span className="ml-1 text-base font-medium text-on-surface-variant">
            {children}
          </span>
        ) : null}
      </div>
      <div className="text-sm text-on-surface-variant">{label}</div>
    </ExpressiveCard>
  );
}

function RsvpStatusBadge({ status, label }: { status: string; label: string }) {
  const variant: "default" | "secondary" | "outline" | "destructive" =
    status === "GOING"
      ? "default"
      : status === "WAITLIST"
        ? "secondary"
        : status === "NOT_GOING"
          ? "destructive"
          : "outline";
  return <Badge variant={variant}>{label}</Badge>;
}

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
      return s.toLowerCase();
  }
}
