"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { toggleUserActiveAction } from "@/server/actions/users";

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
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (
      !confirm(isActive ? t("confirmDeactivate") : t("confirmActivate"))
    )
      return;
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

  return (
    <Button
      type="button"
      variant={isActive ? "outline" : "default"}
      size="sm"
      onClick={onClick}
      disabled={pending || disabled}
    >
      {isActive ? t("deactivate") : t("activate")}
    </Button>
  );
}
