"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { toggleChildClassActiveAction } from "@/server/actions/children/classes";

export function ToggleClassActiveButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const t = useTranslations("children.classes");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await toggleChildClassActiveAction(id);
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
      disabled={pending}
    >
      {isActive ? t("deactivate") : t("activate")}
    </Button>
  );
}
