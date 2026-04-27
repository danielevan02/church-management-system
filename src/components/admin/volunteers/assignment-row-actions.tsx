"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

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
    if (!confirm(t("confirmDelete"))) return;
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
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={pending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
