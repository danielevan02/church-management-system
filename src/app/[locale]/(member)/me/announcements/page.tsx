import { Megaphone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ExpandableAnnouncementCard } from "@/components/member/announcements/expandable-announcement-card";
import { Pagination } from "@/components/shared/pagination";
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
        <p className="text-on-surface-variant">{t("subtitle")}</p>
      </header>

      {result.total === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <Megaphone className="mx-auto mb-2 h-8 w-8 text-on-surface-variant" />
          <p className="text-sm text-on-surface-variant">{t("empty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {result.items.map((a) => {
            const isFresh =
              Date.now() - a.publishedAt.getTime() < 24 * 60 * 60 * 1000;
            return (
              <ExpandableAnnouncementCard
                key={a.id}
                announcement={a}
                isFresh={isFresh}
              />
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
