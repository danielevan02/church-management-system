"use client";

import { GivingForm } from "@/components/admin/giving/giving-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createGivingAction } from "@/server/actions/giving/create";

export function GivingCreateForm({
  funds,
  services,
  defaultServiceId,
  defaultReceivedAt,
  submitLabel,
}: {
  funds: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string; startsAt: Date }>;
  defaultServiceId?: string;
  defaultReceivedAt: string;
  submitLabel: string;
}) {
  const router = useRouter();
  return (
    <GivingForm
      funds={funds}
      services={services}
      initialValues={{
        serviceId: defaultServiceId ?? "_none",
        receivedAt: defaultReceivedAt,
      }}
      submitLabel={submitLabel}
      onSubmit={createGivingAction}
      onSuccess={() => {
        router.push("/admin/giving");
      }}
    />
  );
}
