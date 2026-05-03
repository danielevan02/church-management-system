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

export default async function MemberGivingPage() {
  const t = await getTranslations("memberPortal.giving");
  const tPublic = await getTranslations("publicGive");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle", { church: church.name })}
        </p>
      </header>

      <GiveInfoCard
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

      <Card>
        <CardHeader>
          <CardTitle>{t("noteTitle")}</CardTitle>
          <CardDescription>{t("noteDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t("noteBody")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
