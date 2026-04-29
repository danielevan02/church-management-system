import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { GivingEditForm } from "./giving-edit-form";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { listAllFunds } from "@/server/queries/funds";
import { getGiving } from "@/server/queries/giving";

export default async function EditGivingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [giving, funds] = await Promise.all([
    getGiving(id),
    listAllFunds(),
  ]);
  if (!giving) notFound();

  const t = await getTranslations("giving");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={`/admin/giving/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            {formatRupiah(giving.amount)}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("edit.title")}</h1>
      </header>
      <GivingEditForm
        id={id}
        funds={funds.map((f) => ({ id: f.id, name: f.name }))}
        submitLabel={t("edit.submit")}
        initialMemberName={giving.member?.fullName ?? null}
        initialValues={{
          fundId: giving.fundId,
          memberId: giving.memberId ?? "",
          giverName: giving.giverName ?? "",
          giverPhone: giving.giverPhone ?? "",
          giverEmail: giving.giverEmail ?? "",
          amount: giving.amount.toString(),
          method: giving.method,
          status: giving.status,
          receivedAt: format(giving.receivedAt, "yyyy-MM-dd"),
          externalRef: giving.externalRef ?? "",
          notes: giving.notes ?? "",
        }}
      />
    </div>
  );
}
