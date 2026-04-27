import { format } from "date-fns";
import { Calendar, HandCoins, QrCode, UserCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { prisma } from "@/lib/prisma";

export default async function MemberDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const t = await getTranslations("dashboard.member");
  const tQuick = await getTranslations("dashboard.member.quickActions");

  const member = session.user.memberId
    ? await prisma.member.findUnique({
        where: { id: session.user.memberId },
        include: {
          cellGroupMembers: {
            where: { leftAt: null },
            include: {
              cellGroup: {
                select: {
                  id: true,
                  name: true,
                  meetingDay: true,
                  meetingTime: true,
                  meetingLocation: true,
                },
              },
            },
          },
        },
      })
    : null;

  const upcomingService = await prisma.service.findFirst({
    where: { isActive: true, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      name: true,
      startsAt: true,
      location: true,
    },
  });

  const cellGroup = member?.cellGroupMembers[0]?.cellGroup ?? null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("welcome", { name: member?.firstName ?? "Jemaat" })}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <QuickAction
          href="/me/qr"
          icon={QrCode}
          label={tQuick("myQr")}
        />
        <QuickAction
          href="/me/profile"
          icon={UserCircle}
          label={tQuick("myProfile")}
        />
        <QuickAction
          href="/me/giving"
          icon={HandCoins}
          label={tQuick("giveNow")}
          disabled
        />
        <QuickAction
          href="/me/events"
          icon={Calendar}
          label={tQuick("events")}
          disabled
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("nextService")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {upcomingService ? (
              <div className="flex flex-col gap-1">
                <span className="font-medium">{upcomingService.name}</span>
                <span className="text-muted-foreground">
                  {format(upcomingService.startsAt, "EEEE, dd MMM yyyy · HH:mm")}
                </span>
                {upcomingService.location ? (
                  <span className="text-muted-foreground">
                    {upcomingService.location}
                  </span>
                ) : null}
              </div>
            ) : (
              <p className="text-muted-foreground">{t("noNextService")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("myCellGroup")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {cellGroup ? (
              <div className="flex flex-col gap-1">
                <span className="font-medium">{cellGroup.name}</span>
                {cellGroup.meetingDay || cellGroup.meetingTime ? (
                  <span className="text-muted-foreground">
                    {[cellGroup.meetingDay, cellGroup.meetingTime]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                ) : null}
                {cellGroup.meetingLocation ? (
                  <span className="text-muted-foreground">
                    {cellGroup.meetingLocation}
                  </span>
                ) : null}
              </div>
            ) : (
              <p className="text-muted-foreground">{t("noCellGroup")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("phaseNote.title")}
          </CardTitle>
          <CardDescription>{t("phaseNote.description")}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  disabled,
}: {
  href: string;
  icon: typeof QrCode;
  label: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <Button
        variant="outline"
        className="h-auto flex-col gap-2 py-4 opacity-50"
        disabled
      >
        <Icon className="h-5 w-5" />
        <span className="text-xs">{label}</span>
      </Button>
    );
  }
  return (
    <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
      <Link href={href}>
        <Icon className="h-5 w-5" />
        <span className="text-xs">{label}</span>
      </Link>
    </Button>
  );
}
