import { ArrowLeft, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { DeleteGivingButton } from "./delete-giving-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatJakarta } from "@/lib/datetime";
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { getGivingEntry } from "@/server/queries/giving";

export default async function GivingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getGivingEntry(id);
  if (!entry) notFound();

  const t = await getTranslations("giving.detail");

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
              {formatRupiah(entry.amount)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {entry.service
                ? `${entry.service.name} · ${formatJakarta(entry.service.startsAt, "EEEE, dd MMM yyyy HH:mm")}`
                : `${t("standalone")} · ${formatJakarta(entry.receivedAt, "EEEE, dd MMM yyyy")}`}
            </p>
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
          <Field
            label={t("fields.service")}
            value={
              entry.service ? (
                <Link
                  href={`/admin/attendance/services/${entry.service.id}`}
                  className="text-primary hover:underline"
                >
                  {entry.service.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">
                  {t("standalone")}
                </span>
              )
            }
          />
          <Field
            label={t("fields.receivedAt")}
            value={formatJakarta(entry.receivedAt, "EEEE, dd MMM yyyy")}
          />
          <Field label={t("fields.fund")} value={entry.fund.name} />
          <Separator />
          <Field
            label={t("fields.amount")}
            value={
              <span className="font-semibold tabular-nums">
                {formatRupiah(entry.amount)}
              </span>
            }
          />
          <Field label={t("fields.recordedBy")} value={entry.recordedBy} />
          <Field
            label={t("fields.recordedAt")}
            value={formatJakarta(entry.createdAt, "dd MMM yyyy HH:mm")}
          />
          {entry.notes ? (
            <>
              <Separator />
              <div>
                <div className="text-muted-foreground">{t("fields.notes")}</div>
                <p className="whitespace-pre-wrap">{entry.notes}</p>
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
