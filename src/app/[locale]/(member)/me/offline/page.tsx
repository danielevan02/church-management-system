import { WifiOff } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/m3/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";

export default async function OfflinePage() {
  const t = await getTranslations("memberPortal.offline");

  return (
    <EmptyState
      icon={WifiOff}
      title={t("title")}
      description={t("description")}
      action={
        <Button asChild className="rounded-full px-5">
          <Link href="/me/dashboard">{t("retry")}</Link>
        </Button>
      }
    />
  );
}
