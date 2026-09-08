import {
  ArrowRight,
  Building2,
  ClipboardList,
  Settings as SettingsIcon,
  ShieldCheck,
  Users as UsersIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { OperationalSettingsForm } from "@/components/admin/settings/operational-form";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import { church } from "@/config/church";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { getOperationalOverrides } from "@/server/queries/settings";

export default async function SettingsHubPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "ADMIN")) notFound();

  const t = await getTranslations("settings");

  const tEyebrow = await getTranslations("eyebrow");

  const overrides = await getOperationalOverrides();

  const initialValues = {
    bankAccountHolder:
      overrides.bankAccountHolder || church.bank.accountHolder || "",
    bankAccountNumber:
      overrides.bankAccountNumber || church.bank.accountNumber || "",
    qrisImagePath: overrides.qrisImagePath || church.bank.qrisImagePath || "",
    confirmationWhatsApp:
      overrides.confirmationWhatsApp || church.bank.confirmationWhatsApp || "",
  };

  const envFallbacks = {
    bankAccountHolder: church.bank.accountHolder || "",
    bankAccountNumber: church.bank.accountNumber || "",
    qrisImagePath: church.bank.qrisImagePath || "",
    confirmationWhatsApp: church.bank.confirmationWhatsApp || "",
  };

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("settings")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {/* Sub-section links */}
      <div suppressHydrationWarning data-stagger="cards" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SectionLink
          href="/admin/settings/users"
          icon={UsersIcon}
          title={t("sections.users.title")}
          description={t("sections.users.description")}
        />
        <SectionLink
          href="/admin/settings/features"
          icon={ShieldCheck}
          title={t("sections.features.title")}
          description={t("sections.features.description")}
        />
        <SectionLink
          href="/admin/settings/audit"
          icon={ClipboardList}
          title={t("sections.audit.title")}
          description={t("sections.audit.description")}
        />
      </div>

      {/* Church identity (read-only ENV-backed values) */}
      <BlockSection
        icon={Building2}
        title={t("identity.title")}
        description={t("identity.description")}
        bodyClassName="space-y-2 text-sm"
      >
        <Field label={t("identity.fields.name")} value={church.name} />
        <Field
          label={t("identity.fields.shortName")}
          value={church.shortName}
        />
        <Field label={t("identity.fields.domain")} value={church.domain} />
        <Field
          label={t("identity.fields.defaultLocale")}
          value={church.defaultLocale}
        />
        <div className="grid grid-cols-3 gap-2">
          <dt className="text-on-surface-variant">
            {t("identity.fields.primaryColor")}
          </dt>
          <dd className="col-span-2 flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 rounded border"
              style={{ backgroundColor: church.primaryColor }}
            />
            <code className="text-xs">{church.primaryColor}</code>
          </dd>
        </div>
        <Field
          label={t("identity.fields.timezone")}
          value={church.timezone}
        />
        <Separator />
        <p className="text-xs text-on-surface-variant">{t("identity.envHint")}</p>
      </BlockSection>

      {/* Operational settings (DB-backed, editable) */}
      <BlockSection
        icon={SettingsIcon}
        title={t("operational.title")}
        description={t("operational.description")}
      >
        <OperationalSettingsForm
          initialValues={initialValues}
          envFallbacks={envFallbacks}
        />
      </BlockSection>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="col-span-2">{value || "—"}</dd>
    </div>
  );
}

function SectionLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Building2;
  title: string;
  description: string;
}) {
  return (
    <BlockSection
      icon={Icon}
      title={title}
      description={description}
    >
      <Button asChild variant="outline" size="sm">
        <Link href={href}>
          {title}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </BlockSection>
  );
}
