"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteAttendanceAction } from "@/server/actions/attendance/delete";

export function ServiceDeleteRecordButton({ recordId }: { recordId: string }) {
  const t = useTranslations("services.detail");
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(t("confirmDeleteRecord"))) return;
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
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={pending}
      aria-label={t("colActions")}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
