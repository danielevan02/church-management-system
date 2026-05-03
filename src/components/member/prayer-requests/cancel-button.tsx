"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { cancelMyPrayerRequestAction } from "@/server/actions/prayer-requests/cancel-my";

export function CancelMyPrayerButton({ id }: { id: string }) {
  const t = useTranslations("memberPortal.prayerRequests");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onConfirm() {
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
    <ConfirmDialog
      trigger={
        <Button type="button" variant="ghost" size="sm" disabled={pending}>
          {t("cancel")}
        </Button>
      }
      title={t("cancel")}
      description={t("confirmCancel")}
      confirmLabel={t("cancel")}
      cancelLabel={tCommon("back")}
      destructive
      pending={pending}
      onConfirm={onConfirm}
    />
  );
}
