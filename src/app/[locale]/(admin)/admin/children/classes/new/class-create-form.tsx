"use client";

import { ChildClassForm } from "@/components/admin/children/class-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createChildClassAction } from "@/server/actions/children/classes";

export function ClassCreateForm({ submitLabel }: { submitLabel: string }) {
  const router = useRouter();
  return (
    <ChildClassForm
      submitLabel={submitLabel}
      onSubmit={createChildClassAction}
      onSuccess={() => router.push("/admin/children/classes")}
    />
  );
}
