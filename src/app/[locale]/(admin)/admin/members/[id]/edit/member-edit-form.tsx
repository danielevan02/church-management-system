"use client";

import { MemberForm } from "@/components/admin/members/member-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updateMemberAction } from "@/server/actions/members/update";

import type { ComponentProps } from "react";

type Initial = NonNullable<ComponentProps<typeof MemberForm>["initialValues"]>;

export function MemberEditForm({
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
    <MemberForm
      submitLabel={submitLabel}
      initialValues={initialValues}
      onSubmit={(input) => updateMemberAction(id, input)}
      onSuccess={() => router.push(`/admin/members/${id}`)}
    />
  );
}
