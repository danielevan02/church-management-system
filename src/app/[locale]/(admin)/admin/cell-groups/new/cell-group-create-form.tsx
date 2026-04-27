"use client";

import { CellGroupForm } from "@/components/admin/cell-groups/cell-group-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createCellGroupAction } from "@/server/actions/cell-groups/create";

export function CellGroupCreateForm({
  leaders,
  parentGroups,
  submitLabel,
}: {
  leaders: Array<{ id: string; fullName: string }>;
  parentGroups: Array<{ id: string; name: string }>;
  submitLabel: string;
}) {
  const router = useRouter();
  return (
    <CellGroupForm
      leaders={leaders}
      parentGroups={parentGroups}
      submitLabel={submitLabel}
      onSubmit={createCellGroupAction}
      onSuccess={(result) => {
        if (result.id) router.push(`/admin/cell-groups/${result.id}`);
      }}
    />
  );
}
