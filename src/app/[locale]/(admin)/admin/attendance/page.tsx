import { format } from "date-fns";
import { CalendarPlus, Plus, ScanLine, BarChart3 } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";
import {
  getCheckInOpenServices,
  getUpcomingServices,
} from "@/server/queries/services";

export default async function AttendanceHomePage() {
  const t = await getTranslations("attendance.home");
  const tType = await getTranslations("services.type");

  const [openNow, upcoming] = await Promise.all([
    getCheckInOpenServices(),
    getUpcomingServices(5),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
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
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("openNow")}</CardTitle>
            <CardDescription>{t("openNowDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {openNow.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noOpenNow")}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {openNow.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {tType(typeKey(s.type))} ·{" "}
                        {format(s.startsAt, "EEE dd MMM, HH:mm")} ·{" "}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("upcoming")}</CardTitle>
            <CardDescription>{t("upcomingDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noUpcoming")}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {upcoming.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-col gap-1 rounded-md border p-3"
                  >
                    <Link
                      href={`/admin/attendance/services/${s.id}`}
                      className="font-medium hover:underline"
                    >
                      {s.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {tType(typeKey(s.type))} ·{" "}
                      {format(s.startsAt, "EEE dd MMM yyyy, HH:mm")}
                      {s.location ? ` · ${s.location}` : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
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
