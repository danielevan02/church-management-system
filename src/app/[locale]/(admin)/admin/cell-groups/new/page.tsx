import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

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
  const [leaders, parents] = await Promise.all([
    listLeaderCandidates(),
    listAllCellGroups(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <CellGroupCreateForm
        leaders={leaders.map((m) => ({ id: m.id, fullName: m.fullName }))}
        parentGroups={parents.map((g) => ({ id: g.id, name: g.name }))}
        submitLabel={t("submit")}
      />
    </div>
  );
}
