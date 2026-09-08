import { Plus, Settings } from "lucide-react";
import { EmptyState } from "@/components/m3/empty-state";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { ToggleActiveButton } from "@/components/admin/settings/toggle-active-button";
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
import { parsePageParam } from "@/server/queries/_pagination";
import { listUsers } from "@/server/queries/users";
import { formatJakarta } from "@/lib/datetime";

export default async function UsersListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "ADMIN")) notFound();

  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const t = await getTranslations("settings.users");
  const tEyebrow = await getTranslations("eyebrow");
  const tRole = await getTranslations("settings.users.roles");

  const result = await listUsers({ page });

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("settings")}
        title={t("title")}
        subtitle={t("subtitle", { total: result.total })}
        action={
          <Button asChild>
            <Link href="/admin/settings/users/new">
              <Plus className="h-4 w-4" />
              {t("newButton")}
            </Link>
          </Button>
        }
      />

      {result.total === 0 ? (
        <EmptyState icon={Settings} title={t("empty")} />
      ) : (
        <div className="rounded-lg bg-surface-container-low overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colUser")}</TableHead>
                <TableHead>{t("colRole")}</TableHead>
                <TableHead>{t("colMember")}</TableHead>
                <TableHead>{t("colLastLogin")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((u) => {
                const isSelf = u.id === session.user.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          {u.member?.photoUrl ? (
                            <AvatarImage
                              src={u.member.photoUrl}
                              alt={u.member.fullName}
                            />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {(u.username ?? u.member?.fullName ?? "?")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span
                            className={
                              u.username
                                ? "text-sm font-medium uppercase tracking-wide"
                                : "text-sm font-medium"
                            }
                          >
                            {u.username ?? u.member?.fullName ?? "—"}
                          </span>
                          {u.phone ? (
                            <span className="text-xs text-on-surface-variant">
                              {u.phone}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {tRole(roleKey(u.role))}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {u.member ? (
                        <Link
                          href={`/admin/members/${u.member.id}`}
                          className="hover:underline"
                        >
                          {u.member.fullName}
                        </Link>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs tabular-nums text-on-surface-variant">
                      {u.lastLoginAt
                        ? formatJakarta(u.lastLoginAt, "dd MMM yyyy, HH:mm")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Badge variant="default">{t("active")}</Badge>
                      ) : (
                        <Badge variant="secondary">{t("inactive")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/settings/users/${u.id}/edit`}>
                            {t("edit")}
                          </Link>
                        </Button>
                        <ToggleActiveButton
                          id={u.id}
                          isActive={u.isActive}
                          disabled={isSelf}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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

function roleKey(r: string): string {
  switch (r) {
    case "ADMIN":
      return "admin";
    case "STAFF":
      return "staff";
    case "LEADER":
      return "leader";
    default:
      return "member";
  }
}
