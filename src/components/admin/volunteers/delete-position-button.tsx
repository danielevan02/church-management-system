"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { deletePositionAction } from "@/server/actions/volunteers/teams";

export function DeletePositionButton({ id }: { id: string }) {
  const t = useTranslations("volunteers.team.detail");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deletePositionAction(id);
      if (result.ok) {
        toast.success(t("positionRemovedToast"));
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
      description={t("confirmRemovePosition")}
      confirmLabel={tCommon("delete")}
      cancelLabel={tCommon("cancel")}
      destructive
      pending={pending}
      onConfirm={onConfirm}
    />
  );
}
