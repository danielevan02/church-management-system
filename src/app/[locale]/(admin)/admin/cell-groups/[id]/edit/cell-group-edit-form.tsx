"use client";

import { CellGroupForm } from "@/components/admin/cell-groups/cell-group-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updateCellGroupAction } from "@/server/actions/cell-groups/update";

import type { ComponentProps } from "react";

type Initial = NonNullable<ComponentProps<typeof CellGroupForm>["initialValues"]>;

export function CellGroupEditForm({
  id,
  leaders,
  parentGroups,
  initialValues,
  submitLabel,
  canChangeLeader,
}: {
  id: string;
  leaders: Array<{ id: string; fullName: string }>;
  parentGroups: Array<{ id: string; name: string }>;
  initialValues: Initial;
  submitLabel: string;
  canChangeLeader: boolean;
}) {
  const router = useRouter();
  return (
    <CellGroupForm
      leaders={leaders}
      parentGroups={parentGroups}
      submitLabel={submitLabel}
      initialValues={initialValues}
      canChangeLeader={canChangeLeader}
      onSubmit={(input) => updateCellGroupAction(id, input)}
      onSuccess={() => router.push(`/admin/cell-groups/${id}`)}
    />
  );
}
