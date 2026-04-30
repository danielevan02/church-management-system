import { ArrowLeft } from "lucide-react";
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
    <div className="flex flex-col gap-4">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1">
          <Link href="/me/announcements">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{announcement.title}</CardTitle>
          <CardDescription>
            {formatJakarta(
              announcement.publishedAt,
              "EEEE, dd MMMM yyyy · HH:mm",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MarkdownContent source={announcement.body} />
        </CardContent>
      </Card>
    </div>
  );
}
