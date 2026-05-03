"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteAttendanceAction } from "@/server/actions/attendance/delete";

export function ServiceDeleteRecordButton({ recordId }: { recordId: string }) {
  const t = useTranslations("services.detail");
  const tCommon = useTranslations("common");
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteAttendanceAction(recordId);
      if (result.ok) {
        toast.success(t("deletedToast"));
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
          aria-label={t("colActions")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title={tCommon("delete")}
      description={t("confirmDeleteRecord")}
      confirmLabel={tCommon("delete")}
      cancelLabel={tCommon("cancel")}
      destructive
      pending={pending}
      onConfirm={onConfirm}
    />
  );
}
