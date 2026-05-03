"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { deletePrayerRequestAction } from "@/server/actions/prayer-requests/delete";

export function DeletePrayerButton({
  id,
  variant = "icon",
}: {
  id: string;
  variant?: "icon" | "destructive";
}) {
  const t = useTranslations("prayerRequests.detail");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deletePrayerRequestAction(id);
      if (result.ok) {
        toast.success(t("deletedToast"));
        if (variant === "destructive") {
          router.push("/admin/prayer-requests");
        } else {
          router.refresh();
        }
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  const trigger =
    variant === "icon" ? (
      <Button type="button" variant="ghost" size="icon" disabled={pending}>
        <Trash2 className="h-4 w-4" />
      </Button>
    ) : (
      <Button type="button" variant="destructive" disabled={pending}>
        <Trash2 className="h-4 w-4" />
        {t("delete")}
      </Button>
    );

  return (
    <ConfirmDialog
      trigger={trigger}
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
