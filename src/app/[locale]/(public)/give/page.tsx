import { getTranslations } from "next-intl/server";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { GiveInfoCard } from "@/components/giving/give-info-card";
import { church } from "@/config/church";

export default async function PublicGivePage() {
  const t = await getTranslations("publicGive");
  const tEyebrow = await getTranslations("eyebrow");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <PageHeader
        eyebrow={tEyebrow("giving")}
        title={t("title")}
        subtitle={t("subtitle", { church: church.name })}
      />

      <GiveInfoCard
        title={t("optionsTitle")}
        description={t("optionsDescription")}
        bank={church.bank}
        labels={{
          qrisLabel: t("qrisLabel"),
          qrisAlt: t("qrisAlt", { church: church.name }),
          bankAccount: t("bankAccount"),
          accountHolder: t("accountHolder"),
          accountNumberCopy: t("copyAccountNumber"),
          notConfigured: t("bankNotConfigured"),
        }}
      />

      <BlockSection
        title={t("howToTitle")}
        description={t("howToDescription")}
        bodyClassName="space-y-2 text-sm"
      >
        <ol className="list-decimal space-y-2 pl-4">
          <li>{t("step1")}</li>
          <li>{t("step2")}</li>
          <li>
            {church.bank.confirmationWhatsApp
              ? t.rich("step3WithWa", {
                  a: (chunks) => (
                    <a
                      href={`https://wa.me/${church.bank.confirmationWhatsApp}`}
                      className="text-primary underline-offset-2 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {chunks}
                    </a>
                  ),
                })
              : t("step3")}
          </li>
        </ol>
      </BlockSection>
    </div>
  );
}
