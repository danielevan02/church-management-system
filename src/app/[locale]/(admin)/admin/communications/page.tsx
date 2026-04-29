import { format } from "date-fns";
import { FileText, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/lib/i18n/navigation";
import { listCampaigns } from "@/server/queries/communications";
import { parsePageParam } from "@/server/queries/_pagination";

export default async function CommunicationsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const t = await getTranslations("communications.list");
  const tChannel = await getTranslations("communications.channel");
  const tStatus = await getTranslations("communications.campaign.status");
  const result = await listCampaigns({ page });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle", { total: result.total })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/communications/templates">
              <FileText className="h-4 w-4" />
              {t("templatesButton")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/communications/new">
              <Plus className="h-4 w-4" />
              {t("newButton")}
            </Link>
          </Button>
        </div>
      </header>

      {result.total === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colName")}</TableHead>
                <TableHead>{t("colChannel")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead>{t("colSent")}</TableHead>
                <TableHead className="text-right">{t("colTotals")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      href={`/admin/communications/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.name}
                    </Link>
                    {c.subject ? (
                      <div className="text-xs text-muted-foreground">
                        {c.subject}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {tChannel(c.channel.toLowerCase() as never)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={c.status}
                      label={tStatus(statusKey(c.status))}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.sentAt ? format(c.sentAt, "dd MMM yyyy, HH:mm") : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {c.successCount}/{c.totalCount}
                    {c.failureCount > 0 ? (
                      <span className="ml-2 text-destructive">
                        ({c.failureCount} {t("failedAbbr")})
                      </span>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

function StatusBadge({ status, label }: { status: string; label: string }) {
  const variant: "default" | "secondary" | "outline" | "destructive" =
    status === "SENT"
      ? "default"
      : status === "DRAFT"
        ? "outline"
        : status === "SENDING"
          ? "secondary"
          : status === "FAILED"
            ? "destructive"
            : "outline";
  return <Badge variant={variant}>{label}</Badge>;
}

function statusKey(s: string): string {
  switch (s) {
    case "DRAFT":
      return "draft";
    case "SENDING":
      return "sending";
    case "SENT":
      return "sent";
    case "FAILED":
      return "failed";
    default:
      return s.toLowerCase();
  }
}
