import { ArrowRight, BookOpen } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Pagination } from "@/components/shared/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { excerpt } from "@/lib/markdown";
import { parsePageParam } from "@/server/queries/_pagination";
import { listDevotionalsForMember } from "@/server/queries/devotionals";

export default async function MemberDevotionalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const t = await getTranslations("memberPortal.devotionals");
  const result = await listDevotionalsForMember({ page });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {result.total === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {result.items.map((d) => (
            <Link
              key={d.id}
              href={`/me/devotionals/${d.id}`}
              className="group block focus-visible:outline-none"
            >
              <Card className="overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
                <CardContent className="flex items-stretch gap-0 p-0">
                  <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-0.5 border-r bg-gradient-to-b from-primary/10 to-primary/5 p-3">
                    <BookOpen className="mb-1 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold leading-none tabular-nums text-foreground">
                      {formatJakarta(d.publishedAt, "dd")}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {formatJakarta(d.publishedAt, "MMM")}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-3 p-4">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      {d.verseRef || d.authorName ? (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          {d.verseRef ? (
                            <span className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/5 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                              {d.verseRef}
                            </span>
                          ) : null}
                          {d.authorName ? (
                            <span className="text-xs italic text-muted-foreground">
                              — {d.authorName}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <h3 className="font-semibold leading-tight line-clamp-1">
                        {d.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {excerpt(d.body)}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
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
