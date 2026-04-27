import { getTranslations } from "next-intl/server";

import { GiveInfoCard } from "@/components/giving/give-info-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { church } from "@/config/church";

export default async function PublicGivePage() {
  const t = await getTranslations("publicGive");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle", { church: church.name })}
        </p>
      </header>

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

      <Card>
        <CardHeader>
          <CardTitle>{t("howToTitle")}</CardTitle>
          <CardDescription>{t("howToDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
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
        </CardContent>
      </Card>
    </div>
  );
}
