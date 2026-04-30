import { ArrowLeft, BookOpen } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { MarkdownContent } from "@/components/shared/markdown-content";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const meta = [
    formatJakarta(devotional.publishedAt, "EEEE, dd MMMM yyyy"),
    devotional.authorName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1">
          <Link href="/me/devotionals">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">{devotional.title}</CardTitle>
          <CardDescription>{meta}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <MarkdownContent source={devotional.body} />
        </CardContent>
      </Card>
    </div>
  );
}
