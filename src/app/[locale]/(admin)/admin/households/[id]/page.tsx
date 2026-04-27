import { ArrowLeft, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { AssignMemberForm } from "./assign-member-form";
import { RemoveMemberButton } from "./remove-member-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/lib/i18n/navigation";
import {
  getHousehold,
  listMembersAvailableForHousehold,
} from "@/server/queries/households";

export default async function HouseholdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const household = await getHousehold(id);
  if (!household) notFound();

  const t = await getTranslations("households.detail");
  const availableMembers = await listMembersAvailableForHousehold(id);
  const candidates = availableMembers.filter(
    (m) => !household.members.some((hm) => hm.id === m.id),
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href="/admin/households">
              <ArrowLeft className="h-4 w-4" />
              {t("backToList")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {household.name}
          </h1>
          <p className="text-muted-foreground">
            {household.address ?? t("noAddress")}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/households/${id}/edit`}>
            <Pencil className="h-4 w-4" />
            {t("edit")}
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("members.title")}</CardTitle>
          <CardDescription>
            {t("members.subtitle", { count: household.members.length })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {household.members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("members.empty")}
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("members.colName")}</TableHead>
                    <TableHead>{t("members.colRole")}</TableHead>
                    <TableHead>{t("members.colContact")}</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {household.members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <Link
                          href={`/admin/members/${m.id}`}
                          className="font-medium hover:underline"
                        >
                          {m.fullName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.householdRole ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.phone ?? m.email ?? "—"}
                      </TableCell>
                      <TableCell>
                        <RemoveMemberButton
                          householdId={id}
                          memberId={m.id}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <AssignMemberForm
            householdId={id}
            candidates={candidates}
          />
        </CardContent>
      </Card>
    </div>
  );
}
