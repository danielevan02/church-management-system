"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { deleteGivingAction } from "@/server/actions/giving/delete";

export function DeleteGivingButton({ id }: { id: string }) {
  const t = useTranslations("giving.detail");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteGivingAction(id);
      if (result.ok) {
        toast.success(t("deletedToast"));
        router.push("/admin/giving");
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
