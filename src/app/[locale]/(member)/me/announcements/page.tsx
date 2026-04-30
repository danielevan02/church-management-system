import { ArrowRight, Megaphone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Pagination } from "@/components/shared/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { excerpt } from "@/lib/markdown";
import { parsePageParam } from "@/server/queries/_pagination";
import { listAnnouncementsForMember } from "@/server/queries/announcements";

export default async function MemberAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const t = await getTranslations("memberPortal.announcements");
  const result = await listAnnouncementsForMember({ page });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {result.total === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <Megaphone className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {result.items.map((a) => {
            const isFresh =
              Date.now() - a.publishedAt.getTime() < 24 * 60 * 60 * 1000;
            return (
              <Link
                key={a.id}
                href={`/me/announcements/${a.id}`}
                className="group block focus-visible:outline-none"
              >
                <Card className="overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
                  <CardContent className="flex items-stretch gap-0 p-0">
                    <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-0.5 border-r bg-muted/40 p-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {formatJakarta(a.publishedAt, "EEE")}
                      </span>
                      <span className="text-2xl font-bold leading-none tabular-nums text-foreground">
                        {formatJakarta(a.publishedAt, "dd")}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {formatJakarta(a.publishedAt, "MMM")}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-3 p-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold leading-tight line-clamp-1">
                            {a.title}
                          </h3>
                          {isFresh ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                              {t("new")}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatJakarta(a.publishedAt, "HH:mm")} WIB
                        </p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {excerpt(a.body)}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
