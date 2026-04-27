import { format } from "date-fns";
import { HandCoins } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

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
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { getGivingForMember } from "@/server/queries/giving";

export default async function MemberGivingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.giving");
  const tCategory = await getTranslations("giving.fund.category");
  const tMethod = await getTranslations("giving.method");

  const data = await getGivingForMember(memberId, 50);
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/me/giving/give">
            <HandCoins className="h-4 w-4" />
            {t("giveNow")}
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              {t("totalThisYear", { year: yearStart.getFullYear() })}
            </div>
            <div className="text-3xl font-bold tabular-nums">
              {formatRupiah(data.totalThisYear)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              {t("totalAllTime")}
            </div>
            <div className="text-3xl font-bold tabular-nums">
              {formatRupiah(data.totalAllTime)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("historyTitle")}</CardTitle>
          <CardDescription>{t("historyDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("historyEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {data.items.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-2 rounded-md border p-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{row.fund.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {tCategory(row.fund.category.toLowerCase() as never)} ·{" "}
                      {format(row.receivedAt, "dd MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{tMethod(methodKey(row.method))}</Badge>
                    <span className="font-semibold tabular-nums">
                      {formatRupiah(row.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function methodKey(m: string): string {
  switch (m) {
    case "BANK_TRANSFER":
      return "bankTransfer";
    case "QRIS":
      return "qris";
    case "EWALLET":
      return "ewallet";
    case "CASH":
      return "cash";
    case "CARD":
      return "card";
    default:
      return "other";
  }
}
