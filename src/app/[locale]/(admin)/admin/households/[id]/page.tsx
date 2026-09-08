import { Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { AssignMemberForm } from "./assign-member-form";
import { DeleteHouseholdButton } from "./delete-household-button";
import { RemoveMemberButton } from "./remove-member-button";
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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/households"
        backLabel={t("backToList")}
        title={household.name}
        subtitle={household.address ?? t("noAddress")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/admin/households/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                {t("edit")}
              </Link>
            </Button>
            <DeleteHouseholdButton
              id={id}
              memberCount={household.members.length}
            />
          </div>
        }
      />

      <BlockSection
        title={t("members.title")}
        description={t("members.subtitle", { count: household.members.length })}
        bodyClassName="flex flex-col gap-4"
      >
        {household.members.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            {t("members.empty")}
          </p>
        ) : (
          <div className="rounded-lg bg-surface-container-low overflow-hidden">
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
                    <TableCell className="text-sm text-on-surface-variant">
                      {m.householdRole ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-on-surface-variant">
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
      </BlockSection>
    </div>
  );
}
