"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "@/lib/i18n/navigation";
import { deleteServiceAction } from "@/server/actions/services/delete";

export function DeleteServiceButton({
  id,
  attendanceCount,
}: {
  id: string;
  attendanceCount: number;
}) {
  const t = useTranslations("services.delete");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const blocked = attendanceCount > 0;

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteServiceAction(id);
      if (result.ok) {
        toast.success(t("deletedToast"));
        setOpen(false);
        router.push("/admin/attendance/services");
        return;
      }
      if (result.error === "HAS_ATTENDANCE") {
        toast.error(t("hasAttendanceToast"));
        return;
      }
      toast.error(t("errorToast"));
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("confirmTitle")}</DialogTitle>
          <DialogDescription>
            {blocked
              ? t("confirmDescriptionBlocked", { count: attendanceCount })
              : t("confirmDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending || blocked}
          >
            {pending ? `${t("button")}…` : t("button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
