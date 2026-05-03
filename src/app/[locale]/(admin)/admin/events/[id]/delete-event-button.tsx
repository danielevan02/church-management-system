"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { softDeleteEventAction } from "@/server/actions/events/update";

export function DeleteEventButton({ id }: { id: string }) {
  const t = useTranslations("events.detail");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await softDeleteEventAction(id);
      if (result.ok) {
        toast.success(t("deletedToast"));
        router.push("/admin/events");
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  return (
    <ConfirmDialog
      trigger={
        <Button type="button" variant="destructive" disabled={pending}>
          <Trash2 className="h-4 w-4" />
          {t("delete")}
        </Button>
      }
      title={t("delete")}
      description={t("confirmDelete")}
      confirmLabel={t("delete")}
      cancelLabel={tCommon("cancel")}
      destructive
      pending={pending}
      onConfirm={onConfirm}
    />
  );
}
