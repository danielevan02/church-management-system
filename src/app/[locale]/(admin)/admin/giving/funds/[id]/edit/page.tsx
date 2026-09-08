
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { FundEditForm } from "./fund-edit-form";

import { getFund } from "@/server/queries/funds";

export default async function EditFundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fund = await getFund(id);
  if (!fund) notFound();

  const t = await getTranslations("giving.fund");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/giving/funds"
        backLabel={fund.name}
        title={t("edit.title")}
      />
      <FundEditForm
        id={id}
        submitLabel={t("edit.submit")}
        initialValues={{
          name: fund.name,
          category: fund.category,
          description: fund.description ?? "",
          isActive: fund.isActive,
        }}
      />
    </div>
  );
}
