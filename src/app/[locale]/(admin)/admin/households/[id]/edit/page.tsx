import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { HouseholdEditForm } from "./household-edit-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { getHousehold } from "@/server/queries/households";

export default async function EditHouseholdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const household = await getHousehold(id);
  if (!household) notFound();

  const t = await getTranslations("households");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={`/admin/households/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            {household.name}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("edit.title")}</h1>
      </header>

      <HouseholdEditForm
        id={id}
        submitLabel={t("edit.submit")}
        initialValues={{
          name: household.name,
          address: household.address ?? "",
        }}
      />
    </div>
  );
}
