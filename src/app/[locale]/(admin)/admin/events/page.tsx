import { Calendar, Plus } from "lucide-react";
import { ExpressiveCard } from "@/components/m3/expressive-card";
import { EmptyState } from "@/components/m3/empty-state";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { listEvents } from "@/server/queries/events";
import { parsePageParam } from "@/server/queries/_pagination";
import { formatJakarta } from "@/lib/datetime";

export default async function EventsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const t = await getTranslations("events.list");
  const tEyebrow = await getTranslations("eyebrow");
  const result = await listEvents({ page });

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("events")}
        title={t("title")}
        subtitle={t("subtitle", { total: result.total })}
        action={
          <Button asChild>
            <Link href="/admin/events/new">
              <Plus className="h-4 w-4" />
              {t("newButton")}
            </Link>
          </Button>
        }
      />

      {result.total === 0 ? (
        <EmptyState icon={Calendar} title={t("empty")} />
      ) : (
        <div suppressHydrationWarning data-stagger="cards" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map((e) => {
            const past = e.endsAt < new Date();
            return (
              <ExpressiveCard key={e.id} className="flex flex-col gap-3 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/admin/events/${e.id}`}
                    className="text-lg font-semibold tracking-tight hover:underline"
                  >
                    {e.title}
                  </Link>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={e.isPublished ? "default" : "secondary"}>
                      {e.isPublished ? t("statusPublished") : t("statusDraft")}
                    </Badge>
                    {past ? (
                      <Badge variant="outline" className="text-xs">
                        {t("statusPast")}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant">
                  {formatJakarta(e.startsAt, "EEE, dd MMM yyyy · HH:mm")}
                  {e.location ? ` · ${e.location}` : ""}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                  <span>
                    {e._count.rsvps}
                    {e.capacity ? `/${e.capacity}` : ""} {t("rsvpsAbbr")}
                  </span>
                  {e.fee ? (
                    <span className="ml-auto font-medium text-on-surface">
                      {formatRupiah(e.fee)}
                    </span>
                  ) : null}
                </div>
              </ExpressiveCard>
            );
          })}
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  );
}
