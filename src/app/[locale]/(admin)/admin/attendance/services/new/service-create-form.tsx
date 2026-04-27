"use client";

import { ServiceForm } from "@/components/admin/attendance/service-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createServiceAction } from "@/server/actions/services/create";

export function ServiceCreateForm({ submitLabel }: { submitLabel: string }) {
  const router = useRouter();
  return (
    <ServiceForm
      submitLabel={submitLabel}
      onSubmit={createServiceAction}
      onSuccess={(result) => {
        if (result.id) router.push(`/admin/attendance/services/${result.id}`);
      }}
    />
  );
}
