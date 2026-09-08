import { ArrowRight, BookOpen } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/m3/empty-state";
import { ExpressiveCard } from "@/components/m3/expressive-card";
import { PageHeader } from "@/components/m3/page-header";
import { Pagination } from "@/components/shared/pagination";
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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {result.total === 0 ? (
        <EmptyState icon={BookOpen} title={t("empty")} />
      ) : (
        <div suppressHydrationWarning data-stagger="cards" className="flex flex-col gap-3">
          {result.items.map((d) => (
            <ExpressiveCard
              key={d.id}
              asChild
              interactive
              padding="none"
              className="group overflow-hidden"
            >
              <Link href={`/me/devotionals/${d.id}`}>
                <div className="flex items-stretch">
                  {/* Date rail. An archive is navigated by date before it is
                      navigated by title, so the date is a landmark rather than
                      a line of metadata. */}
                  <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-0.5 bg-primary/10 p-3">
                    <BookOpen className="mb-1 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold leading-none tabular-nums text-on-surface">
                      {formatJakarta(d.publishedAt, "dd")}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                      {formatJakarta(d.publishedAt, "MMM")}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-3 p-4">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      {d.verseRef || d.authorName ? (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          {d.verseRef ? (
                            <span className="inline-flex items-center rounded-md bg-surface-container-high px-2 py-0.5 text-[11px] font-semibold text-primary">
                              {d.verseRef}
                            </span>
                          ) : null}
                          {d.authorName ? (
                            <span className="text-xs text-on-surface-variant">
                              — {d.authorName}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <h3 className="line-clamp-1 text-base font-bold leading-tight text-on-surface transition-colors group-hover:text-primary">
                        {d.title}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
                        {excerpt(d.body)}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </div>
              </Link>
            </ExpressiveCard>
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
