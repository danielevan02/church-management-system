import { format } from "date-fns";
import { EyeOff, Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { DeletePrayerButton } from "@/components/admin/prayer-requests/delete-prayer-button";
import { PrayerStatusSelect } from "@/components/admin/prayer-requests/status-select";
import { Pagination } from "@/components/shared/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import type { PrayerStatusInput } from "@/lib/validation/prayer-requests";
import { listPrayerRequests } from "@/server/queries/prayer-requests";
import { parsePageParam } from "@/server/queries/_pagination";

export default async function AdminPrayerRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const sp = await searchParams;
  const statusParam = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const page = parsePageParam(sp.page);

  const t = await getTranslations("prayerRequests.list");
  const tStatus = await getTranslations("prayerRequests.status");

  const result = await listPrayerRequests({
    filters: statusParam ? { status: statusParam } : undefined,
    page,
  });

  const canDelete = hasAtLeastRole(session.user.role, "ADMIN");

  const filterOptions: (PrayerStatusInput | "ALL")[] = [
    "ALL",
    "OPEN",
    "PRAYING",
    "ANSWERED",
    "ARCHIVED",
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle", { total: result.total })}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 -mx-1 overflow-x-auto px-1">
        {filterOptions.map((opt) => {
          const active = (statusParam ?? "ALL") === opt;
          const href =
            opt === "ALL"
              ? "/admin/prayer-requests"
              : `/admin/prayer-requests?status=${opt}`;
          return (
            <Button
              key={opt}
              asChild
              variant={active ? "default" : "outline"}
              size="sm"
            >
              <Link href={href}>
                {opt === "ALL"
                  ? t("filterAll")
                  : tStatus(opt.toLowerCase() as never)}
              </Link>
            </Button>
          );
        })}
      </div>

      {result.total === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colMember")}</TableHead>
                <TableHead>{t("colTitle")}</TableHead>
                <TableHead>{t("colVisibility")}</TableHead>
                <TableHead>{t("colCreatedAt")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.isAnonymous ? (
                      <span className="text-sm italic text-muted-foreground">
                        {t("anonymous")}
                      </span>
                    ) : p.member ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          {p.member.photoUrl ? (
                            <AvatarImage
                              src={p.member.photoUrl}
                              alt={p.member.fullName}
                            />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {p.member.fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Link
                          href={`/admin/members/${p.member.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {p.member.fullName}
                        </Link>
                      </div>
                    ) : (
                      <span className="text-sm italic text-muted-foreground">
                        {p.submittedBy ?? "—"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <Link
                      href={`/admin/prayer-requests/${p.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {p.title || (
                        <span className="text-muted-foreground">
                          {t("untitled")}
                        </span>
                      )}
                    </Link>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {p.body}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {p.isAnonymous ? (
                        <Badge variant="outline">
                          <EyeOff className="h-3 w-3" />
                          {t("anon")}
                        </Badge>
                      ) : null}
                      {p.isPublic ? (
                        <Badge variant="outline">
                          <Globe className="h-3 w-3" />
                          {t("public")}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums text-muted-foreground">
                    {format(p.createdAt, "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <PrayerStatusSelect id={p.id} value={p.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/prayer-requests/${p.id}`}>
                          {t("view")}
                        </Link>
                      </Button>
                      {canDelete ? <DeletePrayerButton id={p.id} /> : null}
                    </div>
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
