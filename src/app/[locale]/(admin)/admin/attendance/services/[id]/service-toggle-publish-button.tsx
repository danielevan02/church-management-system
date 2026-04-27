"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { setServiceActiveAction } from "@/server/actions/services/update";

export function ServiceTogglePublishButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const t = useTranslations("services.detail");
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await setServiceActiveAction(id, !isActive);
      if (result.ok) {
        toast.success(isActive ? t("deactivatedToast") : t("activatedToast"));
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={pending}
    >
      {isActive ? t("deactivate") : t("activate")}
    </Button>
  );
}
