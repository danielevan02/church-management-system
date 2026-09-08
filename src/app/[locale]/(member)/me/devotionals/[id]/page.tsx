import { BookOpen } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { CardWatermark, ExpressiveCard } from "@/components/m3/expressive-card";
import { PageHeader } from "@/components/m3/page-header";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { formatJakarta } from "@/lib/datetime";
import { getDevotionalForMember } from "@/server/queries/devotionals";

export default async function MemberDevotionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const devotional = await getDevotionalForMember(id);
  if (!devotional) notFound();

  const t = await getTranslations("memberPortal.devotionals");
  const tDash = await getTranslations("dashboard.member.devotionalToday");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-5 pb-28 sm:pb-12">
      <PageHeader
        backHref="/me/devotionals"
        backLabel={t("back")}
        eyebrow={formatJakarta(devotional.publishedAt, "EEEE, dd MMMM yyyy")}
        title={devotional.title}
        subtitle={
          devotional.authorName ? `— ${devotional.authorName}` : undefined
        }
      />

      <ExpressiveCard tone="gradient" padding="spacious" className="group gap-5">
        <CardWatermark icon={BookOpen} className="-top-8 -right-8 bottom-auto h-52 w-52" />

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
          <BookOpen className="h-3.5 w-3.5" />
          {tDash("label")}
        </span>

        {/* The verse is a pull-quote, not a field. It keeps the 4dp accent rule
            — the one border in this language — because scripture is quoted
            material and the rule is what marks it as someone else's words. */}
        {devotional.verseRef || devotional.verseText ? (
          <div className="rounded-2xl border-l-4 border-primary/40 bg-surface-container-high p-4">
            {devotional.verseRef ? (
              <p className="flex items-center gap-1.5 text-sm font-bold text-primary">
                <BookOpen className="h-4 w-4" />
                {devotional.verseRef}
              </p>
            ) : null}
            {devotional.verseText ? (
              <p className="mt-2 text-sm leading-relaxed italic whitespace-pre-wrap text-on-surface-variant">
                {devotional.verseText}
              </p>
            ) : null}
          </div>
        ) : null}

        <MarkdownContent
          source={devotional.body}
          className="prose-base prose-p:leading-relaxed sm:prose-lg"
        />
      </ExpressiveCard>
    </div>
  );
}
