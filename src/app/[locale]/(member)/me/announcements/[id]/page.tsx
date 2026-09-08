import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { ExpressiveCard } from "@/components/m3/expressive-card";
import { PageHeader } from "@/components/m3/page-header";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { formatJakarta } from "@/lib/datetime";
import { getAnnouncementForMember } from "@/server/queries/announcements";

export default async function MemberAnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await getAnnouncementForMember(id);
  if (!announcement) notFound();

  const t = await getTranslations("memberPortal.announcements");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-5 pb-28 sm:pb-12">
      <PageHeader
        backHref="/me/announcements"
        backLabel={t("back")}
        eyebrow={formatJakarta(
          announcement.publishedAt,
          "EEEE, dd MMMM yyyy · HH:mm",
        )}
        title={announcement.title}
      />

      <ExpressiveCard padding="spacious">
        <MarkdownContent source={announcement.body} />
      </ExpressiveCard>
    </div>
  );
}
