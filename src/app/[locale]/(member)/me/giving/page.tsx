import { HandCoins, HeartHandshake } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { GiveInfoCard } from "@/components/giving/give-info-card";
import { church } from "@/config/church";

export default async function MemberGivingPage() {
  const t = await getTranslations("memberPortal.giving");
  const tPublic = await getTranslations("publicGive");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle", { church: church.name })}
      />

      <GiveInfoCard
        icon={HandCoins}
        title={tPublic("optionsTitle")}
        description={tPublic("optionsDescription")}
        bank={church.bank}
        labels={{
          qrisLabel: tPublic("qrisLabel"),
          qrisAlt: tPublic("qrisAlt", { church: church.name }),
          bankAccount: tPublic("bankAccount"),
          accountHolder: tPublic("accountHolder"),
          accountNumberCopy: tPublic("copyAccountNumber"),
          notConfigured: tPublic("bankNotConfigured"),
        }}
      />

      <BlockSection
        icon={HeartHandshake}
        iconTone="secondary"
        title={t("noteTitle")}
        description={t("noteDescription")}
      >
        <p className="text-sm leading-relaxed text-on-surface-variant">
          {t("noteBody")}
        </p>
      </BlockSection>
    </div>
  );
}
