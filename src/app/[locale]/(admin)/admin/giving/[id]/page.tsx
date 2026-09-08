import { Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { DeleteGivingButton } from "./delete-giving-button";
import { Button } from "@/components/ui/button";

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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/giving"
        backLabel={t("backToList")}
        title={formatRupiah(entry.amount)}
        subtitle={
          <p>
            {entry.service
              ? `${entry.service.name} · ${formatJakarta(entry.service.startsAt, "EEEE, dd MMM yyyy HH:mm")}`
              : `${t("standalone")} · ${formatJakarta(entry.receivedAt, "EEEE, dd MMM yyyy")}`}
          </p>
        }
        action={
          <>
            <Button asChild variant="outline">
              <Link href={`/admin/giving/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                {t("edit")}
              </Link>
            </Button>
            <DeleteGivingButton id={id} />
          </>
        }
      />

      <BlockSection
        title={t("details")}
        bodyClassName="space-y-2 text-sm"
      >
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
              <span className="text-on-surface-variant">
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
              <div className="text-on-surface-variant">{t("fields.notes")}</div>
              <p className="whitespace-pre-wrap">{entry.notes}</p>
            </div>
          </>
        ) : null}
      </BlockSection>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="col-span-2">{value || "—"}</dd>
    </div>
  );
}
