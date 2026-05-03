"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/lib/i18n/navigation";
import {
  deleteAssignmentAction,
  setAssignmentStatusAction,
} from "@/server/actions/volunteers/assignments";

type Status = "PENDING" | "CONFIRMED" | "DECLINED" | "COMPLETED";

export function AssignmentRowActions({
  id,
  status,
}: {
  id: string;
  status: Status;
}) {
  const t = useTranslations("volunteers.schedule");
  const tStatus = useTranslations("volunteers.assignmentStatus");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onStatusChange(next: Status) {
    if (next === status) return;
    startTransition(async () => {
      const result = await setAssignmentStatusAction({ id, status: next });
      if (result.ok) {
        toast.success(t("statusUpdatedToast"));
        router.refresh();
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  function onDelete() {
    startTransition(async () => {
      const result = await deleteAssignmentAction(id);
      if (result.ok) {
        toast.success(t("deletedToast"));
        router.refresh();
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Select
        value={status}
        onValueChange={(v) => onStatusChange(v as Status)}
        disabled={pending}
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">{tStatus("pending")}</SelectItem>
          <SelectItem value="CONFIRMED">{tStatus("confirmed")}</SelectItem>
          <SelectItem value="DECLINED">{tStatus("declined")}</SelectItem>
          <SelectItem value="COMPLETED">{tStatus("completed")}</SelectItem>
        </SelectContent>
      </Select>
      <ConfirmDialog
        trigger={
          <Button type="button" variant="ghost" size="icon" disabled={pending}>
            <Trash2 className="h-4 w-4" />
          </Button>
        }
        title={tCommon("delete")}
        description={t("confirmDelete")}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        destructive
        pending={pending}
        onConfirm={onDelete}
      />
    </div>
  );
}
