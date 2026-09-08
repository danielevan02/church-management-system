import { Megaphone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/m3/empty-state";
import { PageHeader } from "@/components/m3/page-header";
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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {result.total === 0 ? (
        <EmptyState icon={Megaphone} title={t("empty")} />
      ) : (
        <div suppressHydrationWarning data-stagger="cards" className="flex flex-col gap-3">
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
