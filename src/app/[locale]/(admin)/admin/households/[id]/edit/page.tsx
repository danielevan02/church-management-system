
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { HouseholdEditForm } from "./household-edit-form";

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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref={`/admin/households/${id}`}
        backLabel={household.name}
        title={t("edit.title")}
      />

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
