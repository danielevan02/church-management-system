import { CalendarClock, CheckCircle2, ScanLine } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { AutoCheckIn } from "./auto-check-in";
import { ScanBannerButton } from "./scan-banner-button";
import { SelfCheckInButton } from "./self-check-in-button";
import { BlockRow, BlockSection } from "@/components/m3/block-section";
import { EmptyState } from "@/components/m3/empty-state";
import { PageHeader } from "@/components/m3/page-header";
import { auth } from "@/lib/auth";
import { formatJakarta } from "@/lib/datetime";
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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        action={<ScanBannerButton memberId={memberId} />}
      />

      {autoCheckInTarget ? (
        <AutoCheckIn
          serviceId={autoCheckInTarget.id}
          memberId={memberId}
          serviceName={autoCheckInTarget.name}
        />
      ) : null}

      <BlockSection
        icon={ScanLine}
        iconTone="secondary"
        title={t("openNow")}
        description={t("openNowDescription")}
        bodyClassName="space-y-2"
      >
        {open.length === 0 ? (
          <EmptyState
            icon={ScanLine}
            tone="quiet"
            title={t("noOpen")}
            className="py-6"
          />
        ) : (
          open.map((s) => {
            const already = checkedInIds.has(s.id);
            return (
              <BlockRow key={s.id} className="flex-col items-stretch sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold text-on-surface">
                    {s.name}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {tType(typeKey(s.type))} ·{" "}
                    {formatJakarta(s.startsAt, "EEE dd MMM, HH:mm")}
                    {s.location ? ` · ${s.location}` : ""}
                  </span>
                </div>
                {already ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success-container px-3 py-1 text-xs font-semibold text-on-success-container">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("alreadyCheckedIn")}
                  </span>
                ) : (
                  <SelfCheckInButton serviceId={s.id} memberId={memberId} />
                )}
              </BlockRow>
            );
          })
        )}
      </BlockSection>

      <BlockSection
        icon={CalendarClock}
        title={t("upcoming")}
        description={t("upcomingDescription")}
        bodyClassName="space-y-2"
      >
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            tone="quiet"
            title={t("noUpcoming")}
            className="py-6"
          />
        ) : (
          upcoming.map((s) => (
            <BlockRow key={s.id}>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold text-on-surface">
                  {s.name}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {tType(typeKey(s.type))} ·{" "}
                  {formatJakarta(s.startsAt, "EEE dd MMM yyyy, HH:mm")}
                </span>
              </div>
            </BlockRow>
          ))
        )}
      </BlockSection>
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
