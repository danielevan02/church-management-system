import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { FundEditForm } from "./fund-edit-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/giving/funds">
            <ArrowLeft className="h-4 w-4" />
            {fund.name}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("edit.title")}</h1>
      </header>
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
