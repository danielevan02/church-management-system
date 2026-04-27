import { format } from "date-fns";
import { Heart, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { CancelMyPrayerButton } from "@/components/member/prayer-requests/cancel-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { listPrayerRequestsForMember } from "@/server/queries/prayer-requests";

export default async function MyPrayerRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.prayerRequests");
  const tStatus = await getTranslations("prayerRequests.status");

  const items = await listPrayerRequestsForMember(memberId);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/me/prayer-requests/new">
            <Plus className="h-4 w-4" />
            {t("newButton")}
          </Link>
        </Button>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Heart className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
            <Button asChild size="sm">
              <Link href="/me/prayer-requests/new">{t("emptyCta")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    {p.title || t("untitled")}
                  </CardTitle>
                  <Badge variant={p.status === "ANSWERED" ? "default" : "outline"}>
                    {tStatus(p.status.toLowerCase() as never)}
                  </Badge>
                </div>
                <CardDescription className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="tabular-nums">
                    {format(p.createdAt, "dd MMM yyyy")}
                  </span>
                  {p.isAnonymous ? (
                    <Badge variant="secondary" className="text-[10px]">
                      {t("anonymous")}
                    </Badge>
                  ) : null}
                  {p.isPublic ? (
                    <Badge variant="secondary" className="text-[10px]">
                      {t("public")}
                    </Badge>
                  ) : null}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="whitespace-pre-wrap text-sm">{p.body}</p>
                {p.status === "OPEN" ? (
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/me/prayer-requests/${p.id}/edit`}>
                        {t("edit")}
                      </Link>
                    </Button>
                    <CancelMyPrayerButton id={p.id} />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
