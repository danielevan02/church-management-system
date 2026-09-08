import { CalendarPlus, Plus, ScanLine, BarChart3 } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { Button } from "@/components/ui/button";

import { Link } from "@/lib/i18n/navigation";
import { formatJakarta } from "@/lib/datetime";
import {
  getCheckInOpenServices,
  getUpcomingServices,
} from "@/server/queries/services";

export default async function AttendanceHomePage() {
  const t = await getTranslations("attendance.home");
  const tEyebrow = await getTranslations("eyebrow");
  const tType = await getTranslations("services.type");

  const [openNow, upcoming] = await Promise.all([
    getCheckInOpenServices(),
    getUpcomingServices(5),
  ]);

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("attendance")}
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/attendance/services">
                <CalendarPlus className="h-4 w-4" />
                {t("manageServices")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/attendance/reports">
                <BarChart3 className="h-4 w-4" />
                {t("reports")}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/attendance/services/new">
                <Plus className="h-4 w-4" />
                {t("newService")}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BlockSection
          title={t("openNow")}
          description={t("openNowDescription")}
          staggerChildren
        >
          {openNow.length === 0 ? (
            <p className="text-sm text-on-surface-variant">{t("noOpenNow")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {openNow.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-2 rounded-2xl p-3 sm:flex-row sm:items-center sm:justify-between bg-surface-container-high"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-on-surface-variant">
                      {tType(typeKey(s.type))} ·{" "}
                      {formatJakarta(s.startsAt, "EEE dd MMM, HH:mm")} ·{" "}
                      {s._count.attendances} {t("checkedInAbbr")}
                    </span>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/admin/attendance/check-in/${s.id}`}>
                      <ScanLine className="h-4 w-4" />
                      {t("openCheckIn")}
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </BlockSection>

        <BlockSection
          title={t("upcoming")}
          description={t("upcomingDescription")}
          staggerChildren
        >
          {upcoming.length === 0 ? (
            <p className="text-sm text-on-surface-variant">{t("noUpcoming")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {upcoming.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-1 rounded-2xl p-3 bg-surface-container-high"
                >
                  <Link
                    href={`/admin/attendance/services/${s.id}`}
                    className="font-medium hover:underline"
                  >
                    {s.name}
                  </Link>
                  <span className="text-xs text-on-surface-variant">
                    {tType(typeKey(s.type))} ·{" "}
                    {formatJakarta(s.startsAt, "EEE dd MMM yyyy, HH:mm")}
                    {s.location ? ` · ${s.location}` : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </BlockSection>
      </div>
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
