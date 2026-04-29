import { Megaphone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Pagination } from "@/components/shared/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listAnnouncementsForMember } from "@/server/queries/announcements";
import { parsePageParam } from "@/server/queries/_pagination";
import { formatJakarta } from "@/lib/datetime";

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
        <div className="flex flex-col gap-3">
          {result.items.map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <CardTitle>{a.title}</CardTitle>
                <CardDescription>
                  {formatJakarta(a.publishedAt, "EEE, dd MMM yyyy · HH:mm")}
                </CardDescription>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm">
                {a.body}
              </CardContent>
            </Card>
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
