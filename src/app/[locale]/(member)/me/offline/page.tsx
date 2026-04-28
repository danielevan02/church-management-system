import { WifiOff } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";

export default async function OfflinePage() {
  const t = await getTranslations("memberPortal.offline");

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {t("description")}
        </p>
        <Button asChild className="mt-2">
          <Link href="/me/dashboard">{t("retry")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
