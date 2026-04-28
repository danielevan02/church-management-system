import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { AutoCheckIn } from "./auto-check-in";
import { SelfCheckInButton } from "./self-check-in-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getCheckInOpenServices,
  getService,
  getUpcomingServices,
  isCheckInOpen,
} from "@/server/queries/services";

export default async function MemberCheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.checkIn");
  const tType = await getTranslations("services.type");

  const sp = await searchParams;
  const requestedServiceId = sp.service;

  const [open, upcoming, alreadyChecked, requestedService] = await Promise.all([
    getCheckInOpenServices(),
    getUpcomingServices(5),
    prisma.attendanceRecord.findMany({
      where: { memberId },
      orderBy: { checkedInAt: "desc" },
      take: 50,
      select: { serviceId: true },
    }),
    requestedServiceId ? getService(requestedServiceId) : Promise.resolve(null),
  ]);

  const checkedInIds = new Set(alreadyChecked.map((r) => r.serviceId));

  // Auto-checkin via QR scan: ?service=<id> appended by service banner QR
  const autoCheckInTarget =
    requestedService &&
    requestedService.isActive &&
    isCheckInOpen(requestedService, new Date())
      ? requestedService
      : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {autoCheckInTarget ? (
        <AutoCheckIn
          serviceId={autoCheckInTarget.id}
          memberId={memberId}
          serviceName={autoCheckInTarget.name}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("openNow")}</CardTitle>
          <CardDescription>{t("openNowDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {open.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noOpen")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {open.map((s) => {
                const already = checkedInIds.has(s.id);
                return (
                  <li
                    key={s.id}
                    className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {tType(typeKey(s.type))} ·{" "}
                        {format(s.startsAt, "EEE dd MMM, HH:mm")}
                        {s.location ? ` · ${s.location}` : ""}
                      </span>
                    </div>
                    {already ? (
                      <span className="flex items-center gap-1 text-sm text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        {t("alreadyCheckedIn")}
                      </span>
                    ) : (
                      <SelfCheckInButton
                        serviceId={s.id}
                        memberId={memberId}
                      />
                    )}
                  </li>
                );
              })}
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
            <ul className="flex flex-col gap-2 text-sm">
              {upcoming.map((s) => (
                <li key={s.id} className="flex flex-col gap-1 rounded-md border p-3">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tType(typeKey(s.type))} ·{" "}
                    {format(s.startsAt, "EEE dd MMM yyyy, HH:mm")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
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
