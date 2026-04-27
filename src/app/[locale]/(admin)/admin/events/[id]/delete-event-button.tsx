"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { softDeleteEventAction } from "@/server/actions/events/update";

export function DeleteEventButton({ id }: { id: string }) {
  const t = useTranslations("events.detail");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(t("confirmDelete"))) return;
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
