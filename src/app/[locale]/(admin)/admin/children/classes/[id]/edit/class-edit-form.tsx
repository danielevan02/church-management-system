"use client";

import { ChildClassForm } from "@/components/admin/children/class-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updateChildClassAction } from "@/server/actions/children/classes";

import type { ComponentProps } from "react";

type Initial = NonNullable<ComponentProps<typeof ChildClassForm>["initialValues"]>;

export function ClassEditForm({
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
    <ChildClassForm
      submitLabel={submitLabel}
      initialValues={initialValues}
      onSubmit={(input) => updateChildClassAction(id, input)}
      onSuccess={() => router.push("/admin/children/classes")}
    />
  );
}
