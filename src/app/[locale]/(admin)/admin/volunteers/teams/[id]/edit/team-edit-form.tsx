"use client";

import { TeamForm } from "@/components/admin/volunteers/team-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updateTeamAction } from "@/server/actions/volunteers/teams";

import type { ComponentProps } from "react";

type Initial = NonNullable<ComponentProps<typeof TeamForm>["initialValues"]>;

export function TeamEditForm({
  id,
  initialValues,
  submitLabel,
}: {
  id: string;
  initialValues: Initial;
  submitLabel: string;
}) {
  const router = useRouter();
  return (
    <TeamForm
      submitLabel={submitLabel}
      initialValues={initialValues}
      onSubmit={(input) => updateTeamAction(id, input)}
      onSuccess={() => router.push(`/admin/volunteers/teams/${id}`)}
    />
  );
}
