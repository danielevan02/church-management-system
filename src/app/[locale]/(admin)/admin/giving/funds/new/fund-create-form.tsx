"use client";

import { FundForm } from "@/components/admin/giving/fund-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createFundAction } from "@/server/actions/funds/create";

export function FundCreateForm({ submitLabel }: { submitLabel: string }) {
  const router = useRouter();
  return (
    <FundForm
      submitLabel={submitLabel}
      onSubmit={createFundAction}
      onSuccess={() => router.push("/admin/giving/funds")}
    />
  );
}
