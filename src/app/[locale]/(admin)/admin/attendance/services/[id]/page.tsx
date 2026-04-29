import { ArrowLeft, Pencil, QrCode, ScanLine } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { ServiceDeleteRecordButton } from "./service-delete-record-button";
import { ServiceTogglePublishButton } from "./service-toggle-publish-button";
import { Pagination } from "@/components/shared/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/lib/i18n/navigation";
import { listAttendanceForService } from "@/server/queries/attendance";
import { parsePageParam } from "@/server/queries/_pagination";
import { getService, isCheckInOpen } from "@/server/queries/services";
import { formatJakarta } from "@/lib/datetime";

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const service = await getService(id);
  if (!service) notFound();

  const t = await getTranslations("services.detail");
  const tType = await getTranslations("services.type");
  const result = await listAttendanceForService(id, { page });
  const { items, memberCount, visitorCount, total } = result;
  const open = service.isActive && isCheckInOpen(service, new Date());

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/attendance/services">
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Link>
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {service.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={service.isActive ? "default" : "secondary"}>
                {service.isActive
                  ? t("statusActive")
                  : t("statusInactive")}
              </Badge>
              <span>•</span>
              <span>{tType(typeKey(service.type))}</span>
              <span>•</span>
              <span>
                {formatJakarta(service.startsAt, "EEE dd MMM yyyy, HH:mm")}
              </span>
              {service.location ? (
                <>
                  <span>•</span>
                  <span>{service.location}</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/admin/attendance/services/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                {t("edit")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/admin/attendance/services/${id}/qr-banner`}>
                <QrCode className="h-4 w-4" />
                {t("printQrBanner")}
              </Link>
            </Button>
            <ServiceTogglePublishButton id={id} isActive={service.isActive} />
            <Button asChild disabled={!open}>
              <Link href={`/admin/attendance/check-in/${id}`}>
                <ScanLine className="h-4 w-4" />
                {open ? t("openCheckIn") : t("checkInClosed")}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t("statTotal")} value={total} />
        <StatCard label={t("statMembers")} value={memberCount} />
        <StatCard label={t("statVisitors")} value={visitorCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("rosterTitle")}</CardTitle>
          <CardDescription>{t("rosterDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("rosterEmpty")}</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("colName")}</TableHead>
                    <TableHead>{t("colSource")}</TableHead>
                    <TableHead>{t("colCheckedInAt")}</TableHead>
                    <TableHead className="text-right">{t("colActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {row.member?.photoUrl ? (
                              <AvatarImage
                                src={row.member.photoUrl}
                                alt={row.member.fullName}
                              />
                            ) : null}
                            <AvatarFallback className="text-xs">
                              {(row.member?.fullName ?? row.visitorName ?? "?")
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            {row.member ? (
                              <Link
                                href={`/admin/members/${row.member.id}`}
                                className="font-medium hover:underline"
                              >
                                {row.member.fullName}
                              </Link>
                            ) : (
                              <span className="font-medium">
                                {row.visitorName}{" "}
                                <span className="text-xs text-muted-foreground">
                                  ({t("visitorTag")})
                                </span>
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {row.member?.phone ?? row.visitorPhone ?? "—"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <SourceBadge source={row.source} />
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {formatJakarta(row.checkedInAt, "HH:mm")}
                      </TableCell>
                      <TableCell className="text-right">
                        <ServiceDeleteRecordButton recordId={row.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-3xl font-bold tabular-nums">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function SourceBadge({ source }: { source: string }) {
  const variant: "default" | "secondary" | "outline" =
    source === "qr_usher"
      ? "default"
      : source === "self"
        ? "outline"
        : "secondary";
  return <Badge variant={variant}>{sourceLabel(source)}</Badge>;
}

function sourceLabel(s: string): string {
  switch (s) {
    case "qr_usher":
      return "QR";
    case "manual_usher":
      return "Manual";
    case "self":
      return "Self";
    case "visitor_usher":
      return "Visitor";
    default:
      return s;
  }
}

function typeKey(t: string): string {
  switch (t) {
    case "SUNDAY_MORNING":
      return "sundayMorning";
    case "SUNDAY_EVENING":
      return "sundayEvening";
    case "MIDWEEK":
      return "midweek";
    case "YOUTH":
      return "youth";
    case "CHILDREN":
      return "children";
    case "SPECIAL":
      return "special";
    default:
      return "other";
  }
}
