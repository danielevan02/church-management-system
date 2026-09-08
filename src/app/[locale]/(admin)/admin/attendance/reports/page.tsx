import { formatDistanceToNow } from "date-fns";
import { getTranslations } from "next-intl/server";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { WeeklyTrendChart } from "@/components/admin/attendance/weekly-trend-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/lib/i18n/navigation";
import {
  getInactiveMembers,
  getWeeklyAttendanceTrend,
} from "@/server/queries/attendance";
import { listServices } from "@/server/queries/services";
import { formatJakarta } from "@/lib/datetime";

const INACTIVE_WEEKS_DEFAULT = 6;

export default async function AttendanceReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v ?? null;
  };
  const inactiveWeeksRaw = Number.parseInt(
    get("inactiveWeeks") ?? `${INACTIVE_WEEKS_DEFAULT}`,
    10,
  );
  const inactiveWeeks =
    Number.isNaN(inactiveWeeksRaw) || inactiveWeeksRaw < 1 || inactiveWeeksRaw > 52
      ? INACTIVE_WEEKS_DEFAULT
      : inactiveWeeksRaw;

  const t = await getTranslations("attendance.reports");

  const tEyebrow = await getTranslations("eyebrow");
  const tType = await getTranslations("services.type");

  const [trend, inactive, recentServices] = await Promise.all([
    getWeeklyAttendanceTrend(12),
    getInactiveMembers(inactiveWeeks),
    listServices({ page: 1, pageSize: 8 }),
  ]);

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("attendance")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <BlockSection
        title={t("trendTitle")}
        description={t("trendDescription")}
      >
        {trend.length === 0 ? (
          <p className="text-sm text-on-surface-variant">{t("trendEmpty")}</p>
        ) : (
          <WeeklyTrendChart data={trend} />
        )}
      </BlockSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BlockSection
          title={t("recentServicesTitle")}
          description={t("recentServicesDescription")}
        >
          {recentServices.items.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              {t("recentServicesEmpty")}
            </p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {recentServices.items.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-2xl p-3 bg-surface-container-high"
                >
                  <div className="flex flex-col">
                    <Link
                      href={`/admin/attendance/services/${s.id}`}
                      className="font-medium hover:underline"
                    >
                      {s.name}
                    </Link>
                    <span className="text-xs text-on-surface-variant">
                      {tType(typeKey(s.type))} ·{" "}
                      {formatJakarta(s.startsAt, "dd MMM yyyy, HH:mm")}
                    </span>
                  </div>
                  <span className="text-lg font-semibold tabular-nums">
                    {s._count.attendances}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </BlockSection>

        <BlockSection
          title={t("inactiveTitle", { weeks: inactiveWeeks })}
          description={t("inactiveDescription")}
        >
          {inactive.length === 0 ? (
            <p className="text-sm text-on-surface-variant">{t("inactiveEmpty")}</p>
          ) : (
            <div className="rounded-lg bg-surface-container-low overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("colName")}</TableHead>
                    <TableHead>{t("colLastSeen")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactive.slice(0, 50).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {m.photoUrl ? (
                              <AvatarImage src={m.photoUrl} alt={m.fullName} />
                            ) : null}
                            <AvatarFallback className="text-xs">
                              {m.fullName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <Link
                              href={`/admin/members/${m.id}`}
                              className="font-medium hover:underline"
                            >
                              {m.fullName}
                            </Link>
                            <span className="text-xs text-on-surface-variant">
                              {m.phone ?? "—"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-on-surface-variant">
                        {m.lastSeenAt
                          ? formatDistanceToNow(m.lastSeenAt, {
                              addSuffix: true,
                            })
                          : t("neverSeen")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {inactive.length > 50 ? (
                <div className="border-t p-2 text-center text-xs text-on-surface-variant">
                  {t("moreCount", { count: inactive.length - 50 })}
                </div>
              ) : null}
            </div>
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
