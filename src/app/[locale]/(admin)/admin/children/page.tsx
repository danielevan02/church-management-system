import { Activity, ArrowRight, ClipboardList, History } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { Button } from "@/components/ui/button";

import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import {
  listActiveCheckIns,
  listAllChildClasses,
} from "@/server/queries/children";

export default async function ChildrenHubPage() {
  if (!features.childrensCheckIn) notFound();

  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const t = await getTranslations("children");

  const tEyebrow = await getTranslations("eyebrow");

  const [active, classes] = await Promise.all([
    listActiveCheckIns(),
    listAllChildClasses({ activeOnly: true }),
  ]);

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("children")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div suppressHydrationWarning data-stagger="cards" className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label={t("stats.activeNow")} value={active.length} accent />
        <Stat label={t("stats.activeClasses")} value={classes.length} />
      </div>

      <div suppressHydrationWarning data-stagger="cards" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SectionLink
          href="/admin/children/check-in"
          icon={Activity}
          title={t("sections.checkIn.title")}
          description={t("sections.checkIn.description")}
          ctaLabel={t("sections.checkIn.cta")}
          primary
        />
        <SectionLink
          href="/admin/children/classes"
          icon={ClipboardList}
          title={t("sections.classes.title")}
          description={t("sections.classes.description")}
          ctaLabel={t("sections.classes.cta")}
        />
        <SectionLink
          href="/admin/children/history"
          icon={History}
          title={t("sections.history.title")}
          description={t("sections.history.description")}
          ctaLabel={t("sections.history.cta")}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 rounded-lg p-4 sm:p-5 ${
        accent ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high"
      }`}
    >
      <div className="text-xs font-medium text-on-surface-variant">{label}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function SectionLink({
  href,
  icon: Icon,
  title,
  description,
  ctaLabel,
  primary,
}: {
  href: string;
  icon: typeof Activity;
  title: string;
  description: string;
  ctaLabel: string;
  primary?: boolean;
}) {
  return (
    <BlockSection
      icon={Icon}
      title={title}
      description={description}
    >
      <Button asChild variant={primary ? "default" : "outline"} size="sm">
        <Link href={href}>
          {ctaLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </BlockSection>
  );
}
