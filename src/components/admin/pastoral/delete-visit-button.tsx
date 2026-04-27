"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { deletePastoralVisitAction } from "@/server/actions/pastoral/visits";

export function DeleteVisitButton({
  id,
  variant = "icon",
}: {
  id: string;
  variant?: "icon" | "destructive";
}) {
  const t = useTranslations("pastoral.detail");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      const result = await deletePastoralVisitAction(id);
      if (result.ok) {
        toast.success(t("deletedToast"));
        if (variant === "destructive") {
          router.push("/admin/pastoral");
        } else {
          router.refresh();
        }
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        disabled={pending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }
  return (
    <Button
      type="button"
      variant="destructive"
      onClick={onClick}
      disabled={pending}
    >
      <Trash2 className="h-4 w-4" />
      {t("delete")}
    </Button>
  );
}
