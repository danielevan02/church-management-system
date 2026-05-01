"use client";

import { PrayerRequestForm } from "@/components/member/prayer-requests/prayer-request-form";
import { useRouter } from "@/lib/i18n/navigation";
import { submitMyPrayerRequestAction } from "@/server/actions/prayer-requests/submit-my";

export function PrayerCreateForm({ submitLabel }: { submitLabel: string }) {
  const router = useRouter();
  return (
    <PrayerRequestForm
      submitLabel={submitLabel}
      onSubmit={submitMyPrayerRequestAction}
      onSuccess={() => router.push("/me/prayer-requests")}
    />
  );
}
