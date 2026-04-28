import { ArrowLeft, Check, X } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { features, type FeatureFlag } from "@/config/features";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";

const FLAG_KEYS: FeatureFlag[] = [
  "childrensCheckIn",
  "pastoralCare",
  "discipleship",
  "volunteers",
  "giving",
  "whatsappBroadcast",
  "selfCheckIn",
];

export default async function FeaturesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "ADMIN")) notFound();

  const t = await getTranslations("settings.features");
  const tFlag = await getTranslations("settings.features.flags");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/settings">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("statusTitle")}</CardTitle>
          <CardDescription>{t("statusDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2 text-sm">
            {FLAG_KEYS.map((flag) => {
              const enabled = features[flag];
              return (
                <li
                  key={flag}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{tFlag(`${flag}.label` as never)}</span>
                    <span className="text-xs text-muted-foreground">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("howToTitle")}</CardTitle>
          <CardDescription>{t("howToDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">{t("howToBody")}</p>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
{`// src/config/features.ts
export const features = {
  childrensCheckIn: true,
  pastoralCare: true,
  // ...
} as const;`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
