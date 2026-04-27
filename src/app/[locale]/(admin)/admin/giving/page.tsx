import { format } from "date-fns";
import { BarChart3, Layers, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { GivingFilters } from "@/components/admin/giving/giving-filters";
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
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { listFunds } from "@/server/queries/funds";
import { listGiving, type GivingFilters as Filters } from "@/server/queries/giving";

import type { GivingMethod, GivingStatus } from "@prisma/client";

const STATUS_VALUES: readonly GivingStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
];
const METHOD_VALUES: readonly GivingMethod[] = [
  "QRIS",
  "BANK_TRANSFER",
  "EWALLET",
  "CASH",
  "CARD",
  "OTHER",
];

function parseStatus(v: string | null): GivingStatus | undefined {
  return v && (STATUS_VALUES as readonly string[]).includes(v)
    ? (v as GivingStatus)
    : undefined;
}
function parseMethod(v: string | null): GivingMethod | undefined {
  return v && (METHOD_VALUES as readonly string[]).includes(v)
    ? (v as GivingMethod)
    : undefined;
}
function parseDate(v: string | null): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function GivingListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v ?? null;
  };

  const filters: Filters = {
    fundId: get("fundId") ?? undefined,
    status: parseStatus(get("status")),
    method: parseMethod(get("method")),
    from: parseDate(get("from")),
    to: parseDate(get("to")),
  };
  const pageNum = Number.parseInt(get("page") ?? "1", 10);
  const page = Number.isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;

  const t = await getTranslations("giving.list");
  const tMethod = await getTranslations("giving.method");
  const tStatus = await getTranslations("giving.status");

  const [funds, result] = await Promise.all([
    listFunds(),
    listGiving({ filters, page }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle", {
              total: result.total,
              sum: formatRupiah(result.sum),
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/giving/funds">
              <Layers className="h-4 w-4" />
              {t("manageFunds")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/giving/reports">
              <BarChart3 className="h-4 w-4" />
              {t("reports")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/giving/new">
              <Plus className="h-4 w-4" />
              {t("newButton")}
            </Link>
          </Button>
        </div>
      </header>

      <GivingFilters
        funds={funds.map((f) => ({ id: f.id, name: f.name }))}
        current={{
          fundId: get("fundId") ?? undefined,
          method: get("method") ?? undefined,
          status: get("status") ?? undefined,
          from: get("from") ?? undefined,
          to: get("to") ?? undefined,
        }}
      />

      {result.items.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colDate")}</TableHead>
                <TableHead>{t("colGiver")}</TableHead>
                <TableHead>{t("colFund")}</TableHead>
                <TableHead>{t("colMethod")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead className="text-right">{t("colAmount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="text-sm tabular-nums">
                    <Link
                      href={`/admin/giving/${g.id}`}
                      className="hover:underline"
                    >
                      {format(g.receivedAt, "dd MMM yyyy")}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {g.member ? (
                      <Link
                        href={`/admin/members/${g.member.id}`}
                        className="font-medium hover:underline"
                      >
                        {g.member.fullName}
                      </Link>
                    ) : (
                      <span className="font-medium">
                        {g.giverName ?? "—"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{g.fund.name}</TableCell>
                  <TableCell className="text-sm">
                    {tMethod(methodKey(g.method))}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={g.status} label={tStatus(statusKey(g.status))} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatRupiah(g.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {result.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">
            {t("page", { page: result.page, totalPages: result.totalPages })}
          </span>
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link
              href={{ pathname: "/admin/giving", query: { ...sp, page: page - 1 } }}
            >
              {t("prev")}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={page >= result.totalPages}
          >
            <Link
              href={{ pathname: "/admin/giving", query: { ...sp, page: page + 1 } }}
            >
              {t("next")}
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status, label }: { status: GivingStatus; label: string }) {
  const variant: "default" | "secondary" | "outline" | "destructive" =
    status === "COMPLETED"
      ? "default"
      : status === "PENDING"
        ? "outline"
        : status === "REFUNDED"
          ? "secondary"
          : "destructive";
  return <Badge variant={variant}>{label}</Badge>;
}

function methodKey(m: GivingMethod): string {
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
function statusKey(s: GivingStatus): string {
  switch (s) {
    case "COMPLETED":
      return "completed";
    case "PENDING":
      return "pending";
    case "FAILED":
      return "failed";
    default:
      return "refunded";
  }
}
