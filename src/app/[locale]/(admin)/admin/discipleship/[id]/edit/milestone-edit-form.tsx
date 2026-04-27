"use client";

import { MilestoneForm } from "@/components/admin/discipleship/milestone-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updateMilestoneAction } from "@/server/actions/discipleship/milestones";

import type { ComponentProps } from "react";

type Initial = NonNullable<ComponentProps<typeof MilestoneForm>["initialValues"]>;

export function MilestoneEditForm({
  id,
  initialValues,
  initialMemberName,
  submitLabel,
}: {
  id: string;
  initialValues: Initial;
  initialMemberName: string;
  submitLabel: string;
}) {
  const router = useRouter();
  return (
    <MilestoneForm
      submitLabel={submitLabel}
      initialValues={initialValues}
      initialMemberName={initialMemberName}
      onSubmit={(input) => updateMilestoneAction(id, input)}
      onSuccess={() => router.push("/admin/discipleship")}
    />
  );
}
