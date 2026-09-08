import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { CellGroupCreateForm } from "./cell-group-create-form";
import { auth } from "@/lib/auth";
import {
  listAllCellGroups,
  listLeaderCandidates,
} from "@/server/queries/cell-groups";

export default async function NewCellGroupPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "STAFF") {
    redirect("/admin/cell-groups");
  }

  const t = await getTranslations("cellGroups.new");

  const tEyebrow = await getTranslations("eyebrow");
  const [leaders, parents] = await Promise.all([
    listLeaderCandidates(),
    listAllCellGroups(),
  ]);

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("cellGroups")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <CellGroupCreateForm
        leaders={leaders.map((m) => ({ id: m.id, fullName: m.fullName }))}
        parentGroups={parents.map((g) => ({ id: g.id, name: g.name }))}
        submitLabel={t("submit")}
      />
    </div>
  );
}
