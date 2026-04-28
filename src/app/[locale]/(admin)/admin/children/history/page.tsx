import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

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
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import {
  listCheckInsHistory,
  listChildClasses,
} from "@/server/queries/children";

export default async function CheckInHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!features.childrensCheckIn) notFound();

  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const sp = await searchParams;
  const classParam = pickFirst(sp.class);

  const t = await getTranslations("children.history");

  const [items, classes] = await Promise.all([
    listCheckInsHistory({
      classId: classParam || undefined,
      take: 200,
    }),
    listChildClasses(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/children">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle", { total: items.length })}
        </p>
      </header>

      <div className="-mx-1 flex flex-wrap items-center gap-2 overflow-x-auto px-1">
        <Button
          asChild
          variant={!classParam ? "default" : "outline"}
          size="sm"
        >
          <Link href="/admin/children/history">{t("filterAll")}</Link>
        </Button>
        {classes.map((c) => (
          <Button
            key={c.id}
            asChild
            variant={classParam === c.id ? "default" : "outline"}
            size="sm"
          >
            <Link href={`/admin/children/history?class=${c.id}`}>
              {c.name}
            </Link>
          </Button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colChild")}</TableHead>
                <TableHead>{t("colClass")}</TableHead>
                <TableHead>{t("colCheckedIn")}</TableHead>
                <TableHead>{t("colCheckedOut")}</TableHead>
                <TableHead>{t("colGuardian")}</TableHead>
                <TableHead>{t("colPickup")}</TableHead>
                <TableHead>{t("colCode")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        {row.child.photoUrl ? (
                          <AvatarImage
                            src={row.child.photoUrl}
                            alt={row.child.fullName}
                          />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {row.child.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/admin/members/${row.child.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {row.child.fullName}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{row.childClass.name}</TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {format(row.checkedInAt, "dd MMM yyyy, HH:mm")}
                  </TableCell>
                  <TableCell>
                    {row.checkedOutAt ? (
                      <Badge variant="default">
                        <CheckCircle2 className="h-3 w-3" />
                        {format(row.checkedOutAt, "HH:mm")}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3" />
                        {t("active")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.guardian.fullName}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.pickupGuardian?.fullName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <code className="font-mono text-xs tabular-nums">
                      {row.securityCode}
                    </code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function pickFirst(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}
