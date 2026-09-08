import { Check, X } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { Badge } from "@/components/ui/badge";

import { features, type FeatureFlag } from "@/config/features";
import { auth } from "@/lib/auth";

import { hasAtLeastRole } from "@/lib/permissions";

const FLAG_KEYS: FeatureFlag[] = [
  "childrensCheckIn",
  "pastoralCare",
  "discipleship",
  "volunteers",
  "giving",
  "selfCheckIn",
];

export default async function FeaturesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "ADMIN")) notFound();

  const t = await getTranslations("settings.features");
  const tFlag = await getTranslations("settings.features.flags");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/settings"
        backLabel={t("back")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <BlockSection
        title={t("statusTitle")}
        description={t("statusDescription")}
        staggerChildren
      >
        <ul className="flex flex-col gap-2 text-sm">
          {FLAG_KEYS.map((flag) => {
            const enabled = features[flag];
            return (
              <li
                key={flag}
                className="flex items-center justify-between rounded-2xl px-3 py-2 bg-surface-container-high"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{tFlag(`${flag}.label` as never)}</span>
                  <span className="text-xs text-on-surface-variant">
                    {tFlag(`${flag}.description` as never)}
                  </span>
                </div>
                <Badge variant={enabled ? "default" : "outline"}>
                  {enabled ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  {enabled ? t("enabled") : t("disabled")}
                </Badge>
              </li>
            );
          })}
        </ul>
      </BlockSection>

      <BlockSection
        title={t("howToTitle")}
        description={t("howToDescription")}
        bodyClassName="space-y-3 text-sm"
      >
                  <p className="text-on-surface-variant">{t("howToBody")}</p>
                  <pre className="overflow-x-auto rounded-md bg-surface-container-high p-3 text-xs">
        {`// src/config/features.ts
        export const features = {
          childrensCheckIn: true,
          pastoralCare: true,
          // ...
        } as const;`}
                  </pre>
      </BlockSection>
    </div>
  );
}
