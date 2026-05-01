"use client";

import { PrayerRequestForm } from "@/components/member/prayer-requests/prayer-request-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updateMyPrayerRequestAction } from "@/server/actions/prayer-requests/update-my";

import type { ComponentProps } from "react";

type Initial = NonNullable<ComponentProps<typeof PrayerRequestForm>["initialValues"]>;

export function PrayerEditForm({
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
    <PrayerRequestForm
      submitLabel={submitLabel}
      initialValues={initialValues}
      onSubmit={(input) => updateMyPrayerRequestAction(id, input)}
      onSuccess={() => router.push("/me/prayer-requests")}
    />
  );
}
