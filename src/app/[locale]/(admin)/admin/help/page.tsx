import {
  BarChart3,
  BookOpen,
  Calendar,
  HandCoins,
  Heart,
  HeartHandshake,
  HelpCircle,
  MessageSquare,
  Settings,
  Sprout,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";
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

const MODULES = [
  { key: "members", icon: Users, href: "/admin/members" },
  { key: "households", icon: BookOpen, href: "/admin/households" },
  { key: "attendance", icon: UserCheck, href: "/admin/attendance" },
  { key: "giving", icon: HandCoins, href: "/admin/giving" },
  { key: "cellGroups", icon: UsersRound, href: "/admin/cell-groups" },
  { key: "events", icon: Calendar, href: "/admin/events" },
  { key: "communications", icon: MessageSquare, href: "/admin/communications" },
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <HelpCircle className="h-7 w-7" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tQuick("title")}</CardTitle>
          <CardDescription>{tQuick("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="ml-4 flex list-decimal flex-col gap-2 text-sm">
            {QUICK_STEPS.map((s) => (
              <li key={s.key}>{tQuick(s.key as never)}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("modulesTitle")}</CardTitle>
          <CardDescription>{t("modulesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {MODULES.map((m) => (
              <li
                key={m.key}
                className="flex items-start gap-3 rounded-md border p-3"
              >
                <m.icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-medium">
                    {tModule(`${m.key}.title` as never)}
                  </span>
                  <span className="text-xs text-muted-foreground">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("commonTasksTitle")}</CardTitle>
          <CardDescription>{t("commonTasksDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("supportTitle")}</CardTitle>
          <CardDescription>{t("supportDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t("supportBody")}
        </CardContent>
      </Card>
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
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

