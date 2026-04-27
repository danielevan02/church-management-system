"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/lib/i18n/navigation";
import type { PrayerStatusInput } from "@/lib/validation/prayer-requests";
import { updatePrayerStatusAction } from "@/server/actions/prayer-requests";

const STATUSES: PrayerStatusInput[] = ["OPEN", "PRAYING", "ANSWERED", "ARCHIVED"];

export function PrayerStatusSelect({
  id,
  value,
}: {
  id: string;
  value: PrayerStatusInput;
}) {
  const t = useTranslations("prayerRequests.status");
  const tToast = useTranslations("prayerRequests.detail");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    startTransition(async () => {
      const result = await updatePrayerStatusAction(id, {
        status: next as PrayerStatusInput,
      });
      if (result.ok) {
        toast.success(tToast("statusUpdatedToast"));
        router.refresh();
      } else {
        toast.error(tToast("errorToast"));
      }
    });
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="h-8 w-32 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {t(s.toLowerCase() as never)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
