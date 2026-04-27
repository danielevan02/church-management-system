import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { MemberCreateForm } from "./member-create-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";

export default async function NewMemberPage() {
  const t = await getTranslations("members");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/members">
            <ArrowLeft className="h-4 w-4" />
            {t("list.title")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("new.title")}</h1>
        <p className="text-muted-foreground">{t("new.subtitle")}</p>
      </header>

      <MemberCreateForm submitLabel={t("new.submit")} />
    </div>
  );
}
