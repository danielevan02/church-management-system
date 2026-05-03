"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { deleteRsvpAction } from "@/server/actions/events/rsvp";

export function DeleteRsvpButton({ rsvpId }: { rsvpId: string }) {
  const t = useTranslations("events.detail");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteRsvpAction(rsvpId);
      if (result.ok) {
        toast.success(t("rsvpRemovedToast"));
        router.refresh();
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  return (
    <ConfirmDialog
      trigger={
        <Button type="button" variant="ghost" size="icon" disabled={pending}>
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title={tCommon("delete")}
      description={t("confirmRemoveRsvp")}
      confirmLabel={tCommon("delete")}
      cancelLabel={tCommon("cancel")}
      destructive
      pending={pending}
      onConfirm={onConfirm}
    />
  );
}
