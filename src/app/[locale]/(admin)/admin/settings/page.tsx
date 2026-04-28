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

import { OperationalSettingsForm } from "@/components/admin/settings/operational-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {/* Sub-section links */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            {t("identity.title")}
          </CardTitle>
          <CardDescription>{t("identity.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
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
            <dt className="text-muted-foreground">
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
          <p className="text-xs text-muted-foreground">{t("identity.envHint")}</p>
        </CardContent>
      </Card>

      {/* Operational settings (DB-backed, editable) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <SettingsIcon className="h-5 w-5" />
            {t("operational.title")}
          </CardTitle>
          <CardDescription>{t("operational.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <OperationalSettingsForm
            initialValues={initialValues}
            envFallbacks={envFallbacks}
          />
        </CardContent>
      </Card>
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
      <dt className="text-muted-foreground">{label}</dt>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" size="sm">
          <Link href={href}>
            {title}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
