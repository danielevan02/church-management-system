"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { cancelMyPrayerRequestAction } from "@/server/actions/prayer-requests";

export function CancelMyPrayerButton({ id }: { id: string }) {
  const t = useTranslations("memberPortal.prayerRequests");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(t("confirmCancel"))) return;
    startTransition(async () => {
      const result = await cancelMyPrayerRequestAction(id);
      if (result.ok) {
        toast.success(t("cancelledToast"));
        router.refresh();
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={pending}
    >
      {t("cancel")}
    </Button>
  );
}
