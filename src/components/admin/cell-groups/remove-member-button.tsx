"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { removeMemberAction } from "@/server/actions/cell-groups/members";

export function RemoveCellGroupMemberButton({
  cellGroupId,
  memberId,
}: {
  cellGroupId: string;
  memberId: string;
}) {
  const t = useTranslations("cellGroups.detail");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await removeMemberAction({ cellGroupId, memberId });
      if (result.ok) {
        toast.success(t("removedToast"));
        router.refresh();
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  return (
    <ConfirmDialog
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          aria-label={t("remove")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title={t("remove")}
      description={t("confirmRemove")}
      confirmLabel={t("remove")}
      cancelLabel={tCommon("cancel")}
      destructive
      pending={pending}
      onConfirm={onConfirm}
    />
  );
}
