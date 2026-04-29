import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  const result = await listEvents({ page });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle", { total: result.total })}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4" />
            {t("newButton")}
          </Link>
        </Button>
      </header>

      {result.total === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map((e) => {
            const past = e.endsAt < new Date();
            return (
              <Card key={e.id}>
                <CardContent className="flex flex-col gap-3 pt-6">
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
                  <div className="text-sm text-muted-foreground">
                    {formatJakarta(e.startsAt, "EEE, dd MMM yyyy · HH:mm")}
                    {e.location ? ` · ${e.location}` : ""}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {e._count.rsvps}
                      {e.capacity ? `/${e.capacity}` : ""} {t("rsvpsAbbr")}
                    </span>
                    {e.fee ? (
                      <span className="ml-auto font-medium text-foreground">
                        {formatRupiah(e.fee)}
                      </span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
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
