"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { deleteTemplateAction } from "@/server/actions/communications/templates";

export function DeleteTemplateButton({ id }: { id: string }) {
  const t = useTranslations("communications.template");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      const result = await deleteTemplateAction(id);
      if (result.ok) {
        toast.success(t("deletedToast"));
        router.refresh();
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

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
