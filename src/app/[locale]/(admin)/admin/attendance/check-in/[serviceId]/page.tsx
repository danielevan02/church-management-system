import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { CheckInConsole } from "@/components/admin/attendance/check-in-console";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { listAttendanceForService } from "@/server/queries/attendance";
import { getService, isCheckInOpen } from "@/server/queries/services";
import { formatJakarta } from "@/lib/datetime";

export default async function UsherCheckInPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const service = await getService(serviceId);
  if (!service) notFound();

  const t = await getTranslations("attendance.checkIn");
  const tType = await getTranslations("services.type");
  const { total, memberCount, visitorCount, items } =
    await listAttendanceForService(serviceId);
  const open = service.isActive && isCheckInOpen(service, new Date());

  const initialRecent = items.slice(0, 20).map((r) => ({
    recordId: r.id,
    name: r.member?.fullName ?? r.visitorName ?? "—",
    source: r.source,
    alreadyCheckedIn: false,
    at: r.checkedInAt,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={`/admin/attendance/services/${serviceId}`}>
            <ArrowLeft className="h-4 w-4" />
            {service.name}
          </Link>
        </Button>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("pageTitle")}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{service.name}</span>
              <span>•</span>
              <span>{tType(typeKey(service.type))}</span>
              <span>•</span>
              <span>
                {formatJakarta(service.startsAt, "EEE dd MMM yyyy, HH:mm")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Badge variant={open ? "default" : "secondary"}>
              {open ? t("statusOpen") : t("statusClosed")}
            </Badge>
            <span className="tabular-nums text-muted-foreground">
              {total} ({memberCount}M / {visitorCount}V)
            </span>
          </div>
        </div>
      </header>

      {!open ? (
        <div className="rounded-md border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground">
          {t("closedNotice")}
        </div>
      ) : (
        <CheckInConsole serviceId={serviceId} initialRecent={initialRecent} />
      )}
    </div>
  );
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
