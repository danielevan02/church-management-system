import { ChevronRight, Megaphone } from "lucide-react";
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
        <div className="flex flex-col gap-2">
          {result.items.map((a) => (
            <Link
              key={a.id}
              href={`/me/announcements/${a.id}`}
              className="block focus-visible:outline-none"
            >
              <Card className="transition-colors hover:border-primary/40 hover:bg-accent/30">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-semibold leading-tight line-clamp-1">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatJakarta(a.publishedAt, "EEE, dd MMM yyyy · HH:mm")}
                    </p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {excerpt(a.body)}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
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
