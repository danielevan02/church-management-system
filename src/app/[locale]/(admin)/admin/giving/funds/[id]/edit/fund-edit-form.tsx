"use client";

import { FundForm } from "@/components/admin/giving/fund-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updateFundAction } from "@/server/actions/funds/update";

import type { ComponentProps } from "react";

type Initial = NonNullable<ComponentProps<typeof FundForm>["initialValues"]>;

export function FundEditForm({
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
    <FundForm
      submitLabel={submitLabel}
      initialValues={initialValues}
      onSubmit={(input) => updateFundAction(id, input)}
      onSuccess={() => router.push("/admin/giving/funds")}
    />
  );
}
