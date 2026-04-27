"use client";

import { TemplateForm } from "@/components/admin/communications/template-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updateTemplateAction } from "@/server/actions/communications/templates";

import type { ComponentProps } from "react";

type Initial = NonNullable<ComponentProps<typeof TemplateForm>["initialValues"]>;

export function TemplateEditForm({
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
    <TemplateForm
      submitLabel={submitLabel}
      initialValues={initialValues}
      onSubmit={(input) => updateTemplateAction(id, input)}
      onSuccess={() => router.push("/admin/communications/templates")}
    />
  );
}
