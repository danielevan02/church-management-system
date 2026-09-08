import { Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Banner } from "@/components/m3/banner";
import { PageHeader } from "@/components/m3/page-header";
import { CheckInConsole } from "@/components/admin/attendance/check-in-console";
import { Badge } from "@/components/ui/badge";

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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref={`/admin/attendance/services/${serviceId}`}
        backLabel={service.name}
        title={t("pageTitle")}
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <span>{service.name}</span>
            <span>•</span>
            <span>{tType(typeKey(service.type))}</span>
            <span>•</span>
            <span>
              {formatJakarta(service.startsAt, "EEE dd MMM yyyy, HH:mm")}
            </span>
          </div>
        }
        action={
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={open ? "default" : "secondary"}>
              {open ? t("statusOpen") : t("statusClosed")}
            </Badge>
            <span className="tabular-nums text-on-surface-variant">
              {total} ({memberCount}M / {visitorCount}V)
            </span>
          </div>
        }
      />

      {!open ? (
        <Banner tone="warning" icon={Lock} title={t("closedNotice")} />
      ) : (
        <CheckInConsole serviceId={serviceId} initialRecent={initialRecent} />
      )}
    </div>
  );
}

function typeKey(t: string): string {
  switch (t) {
    case "SUNDAY_SERVICE":
      return "sundayService";
    case "PRAYER_MEETING":
      return "prayerMeeting";
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
