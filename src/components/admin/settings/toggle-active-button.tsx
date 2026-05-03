"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { toggleUserActiveAction } from "@/server/actions/users/toggle-active";

export function ToggleActiveButton({
  id,
  isActive,
  disabled,
}: {
  id: string;
  isActive: boolean;
  disabled?: boolean;
}) {
  const t = useTranslations("settings.users");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await toggleUserActiveAction(id);
      if (result.ok) {
        toast.success(t("toggleSavedToast"));
        router.refresh();
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  const label = isActive ? t("deactivate") : t("activate");

  return (
    <ConfirmDialog
      trigger={
        <Button
          type="button"
          variant={isActive ? "outline" : "default"}
          size="sm"
          disabled={pending || disabled}
        >
          {label}
        </Button>
      }
      title={label}
      description={isActive ? t("confirmDeactivate") : t("confirmActivate")}
      confirmLabel={label}
      cancelLabel={tCommon("cancel")}
      destructive={isActive}
      pending={pending}
      onConfirm={onConfirm}
    />
  );
}
