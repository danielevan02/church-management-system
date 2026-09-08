import {
  BarChart3,
  BookOpen,
  Calendar,
  HandCoins,
  Heart,
  HeartHandshake,
  HelpCircle,
  Megaphone,
  Settings,
  Sprout,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { IconChip } from "@/components/m3/icon-chip";
import { PageHeader } from "@/components/m3/page-header";
import { Button } from "@/components/ui/button";

import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";

const MODULES = [
  { key: "members", icon: Users, href: "/admin/members" },
  { key: "households", icon: BookOpen, href: "/admin/households" },
  { key: "attendance", icon: UserCheck, href: "/admin/attendance" },
  { key: "giving", icon: HandCoins, href: "/admin/giving" },
  { key: "cellGroups", icon: UsersRound, href: "/admin/cell-groups" },
  { key: "events", icon: Calendar, href: "/admin/events" },
  { key: "announcements", icon: Megaphone, href: "/admin/announcements" },
  { key: "volunteers", icon: HeartHandshake, href: "/admin/volunteers" },
  { key: "children", icon: Heart, href: "/admin/children" },
  { key: "pastoral", icon: HeartHandshake, href: "/admin/pastoral" },
  { key: "discipleship", icon: Sprout, href: "/admin/discipleship" },
  { key: "reports", icon: BarChart3, href: "/admin/reports" },
  { key: "settings", icon: Settings, href: "/admin/settings" },
] as const;

export default async function HelpPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const t = await getTranslations("help");

  const tEyebrow = await getTranslations("eyebrow");
  const tModule = await getTranslations("help.modules");
  const tQuick = await getTranslations("help.quickStart");

  const QUICK_STEPS: Array<{ key: string }> = [
    { key: "step1" },
    { key: "step2" },
    { key: "step3" },
    { key: "step4" },
    { key: "step5" },
  ];

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        leading={<IconChip icon={HelpCircle} size="lg" tone="secondary" />}
        eyebrow={tEyebrow("help")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <BlockSection
        title={tQuick("title")}
        description={tQuick("description")}
        staggerChildren
      >
        <ol className="ml-4 flex list-decimal flex-col gap-2 text-sm">
          {QUICK_STEPS.map((s) => (
            <li key={s.key}>{tQuick(s.key as never)}</li>
          ))}
        </ol>
      </BlockSection>

      <BlockSection
        title={t("modulesTitle")}
        description={t("modulesDescription")}
        staggerChildren
      >
        <ul suppressHydrationWarning data-stagger="cards" className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {MODULES.map((m) => (
            <li
              key={m.key}
              className="flex items-start gap-3 rounded-2xl p-3 bg-surface-container-high"
            >
              <m.icon className="mt-0.5 h-5 w-5 shrink-0 text-on-surface-variant" />
              <div className="flex flex-1 flex-col gap-1">
                <span className="font-medium">
                  {tModule(`${m.key}.title` as never)}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {tModule(`${m.key}.description` as never)}
                </span>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="mt-1 w-fit"
                >
                  <Link href={m.href}>{t("openModule")}</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </BlockSection>

      <BlockSection
        title={t("commonTasksTitle")}
        description={t("commonTasksDescription")}
        bodyClassName="space-y-4 text-sm"
        staggerChildren
      >
        <Section
          title={t("tasks.addMember.title")}
          description={t("tasks.addMember.description")}
        />
        <Section
          title={t("tasks.recordAttendance.title")}
          description={t("tasks.recordAttendance.description")}
        />
        <Section
          title={t("tasks.recordGiving.title")}
          description={t("tasks.recordGiving.description")}
        />
        <Section
          title={t("tasks.broadcastMessage.title")}
          description={t("tasks.broadcastMessage.description")}
        />
        <Section
          title={t("tasks.checkInChild.title")}
          description={t("tasks.checkInChild.description")}
        />
      </BlockSection>

      <BlockSection
        title={t("supportTitle")}
        description={t("supportDescription")}
        bodyClassName="text-sm text-on-surface-variant"
      >
        {t("supportBody")}
      </BlockSection>
    </div>
  );
}

function Section({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <p className="font-medium text-on-surface">{title}</p>
      <p className="text-on-surface-variant">{description}</p>
    </div>
  );
}

