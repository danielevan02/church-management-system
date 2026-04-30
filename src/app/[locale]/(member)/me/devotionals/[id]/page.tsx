import { ArrowLeft, BookOpen } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { MarkdownContent } from "@/components/shared/markdown-content";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
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
    <div className="flex flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit gap-1">
        <Link href="/me/devotionals">
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
      </Button>

      <Card className="relative overflow-hidden">
        {/* Decorative watermark */}
        <BookOpen
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 text-primary/5"
        />

        {/* Hero header */}
        <header className="relative border-b bg-linear-to-br from-primary/10 via-primary/5 to-transparent px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              <BookOpen className="h-3 w-3" />
              {tDash("label")}
            </span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {formatJakarta(devotional.publishedAt, "EEEE, dd MMMM yyyy")}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">
            {devotional.title}
          </h1>
          {devotional.authorName ? (
            <p className="mt-2 text-sm italic text-muted-foreground">
              — {devotional.authorName}
            </p>
          ) : null}
        </header>

        {/* Body */}
        <div className="relative space-y-6 px-6 py-8 sm:px-8">
          {/* Verse panel */}
          {devotional.verseRef || devotional.verseText ? (
            <div className="rounded-md border-l-4 border-primary/40 bg-primary/5 p-4">
              {devotional.verseRef ? (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <BookOpen className="h-4 w-4" />
                  {devotional.verseRef}
                </p>
              ) : null}
              {devotional.verseText ? (
                <p className="mt-2 whitespace-pre-wrap text-sm italic leading-relaxed text-muted-foreground">
                  {devotional.verseText}
                </p>
              ) : null}
            </div>
          ) : null}

          <MarkdownContent
            source={devotional.body}
            className="prose-base prose-p:leading-relaxed sm:prose-lg"
          />
        </div>
      </Card>
    </div>
  );
}
