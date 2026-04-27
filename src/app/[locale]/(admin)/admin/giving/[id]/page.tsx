import { format } from "date-fns";
import { ArrowLeft, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { DeleteGivingButton } from "./delete-giving-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { getGiving } from "@/server/queries/giving";

export default async function GivingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const giving = await getGiving(id);
  if (!giving) notFound();

  const t = await getTranslations("giving.detail");
  const tMethod = await getTranslations("giving.method");
  const tStatus = await getTranslations("giving.status");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/giving">
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Link>
        </Button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {formatRupiah(giving.amount)}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge>{tStatus(giving.status.toLowerCase() as never)}</Badge>
              <span>•</span>
              <span>{tMethod(methodKey(giving.method))}</span>
              <span>•</span>
              <span>{format(giving.receivedAt, "EEE dd MMM yyyy")}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/admin/giving/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                {t("edit")}
              </Link>
            </Button>
            <DeleteGivingButton id={id} />
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Field label={t("fields.fund")} value={giving.fund.name} />
          <Field
            label={t("fields.giver")}
            value={
              giving.member ? (
                <Link
                  href={`/admin/members/${giving.member.id}`}
                  className="text-primary hover:underline"
                >
                  {giving.member.fullName}
                </Link>
              ) : (
                giving.giverName ?? "—"
              )
            }
          />
          <Field label={t("fields.giverPhone")} value={giving.giverPhone} />
          <Field label={t("fields.giverEmail")} value={giving.giverEmail} />
          <Separator />
          <Field
            label={t("fields.amount")}
            value={
              <span className="font-semibold tabular-nums">
                {formatRupiah(giving.amount)} {giving.currency}
              </span>
            }
          />
          <Field
            label={t("fields.method")}
            value={tMethod(methodKey(giving.method))}
          />
          <Field
            label={t("fields.status")}
            value={tStatus(giving.status.toLowerCase() as never)}
          />
          <Field
            label={t("fields.receivedAt")}
            value={format(giving.receivedAt, "EEEE, dd MMM yyyy")}
          />
          <Field label={t("fields.externalRef")} value={giving.externalRef} />
          <Field label={t("fields.recordedBy")} value={giving.recordedBy} />
          {giving.notes ? (
            <>
              <Separator />
              <div>
                <div className="text-muted-foreground">{t("fields.notes")}</div>
                <p className="whitespace-pre-wrap">{giving.notes}</p>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2">{value || "—"}</dd>
    </div>
  );
}

function methodKey(m: string): string {
  switch (m) {
    case "BANK_TRANSFER":
      return "bankTransfer";
    case "QRIS":
      return "qris";
    case "EWALLET":
      return "ewallet";
    case "CASH":
      return "cash";
    case "CARD":
      return "card";
    default:
      return "other";
  }
}
