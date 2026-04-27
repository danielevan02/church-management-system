"use client";

import { TemplateForm } from "@/components/admin/communications/template-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createTemplateAction } from "@/server/actions/communications/templates";

export function TemplateCreateForm({ submitLabel }: { submitLabel: string }) {
  const router = useRouter();
  return (
    <TemplateForm
      submitLabel={submitLabel}
      onSubmit={createTemplateAction}
      onSuccess={() => router.push("/admin/communications/templates")}
    />
  );
}
