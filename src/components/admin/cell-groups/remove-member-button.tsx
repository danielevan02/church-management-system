"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { removeMemberAction } from "@/server/actions/cell-groups/members";

export function RemoveCellGroupMemberButton({
  cellGroupId,
  memberId,
}: {
  cellGroupId: string;
  memberId: string;
}) {
  const t = useTranslations("cellGroups.detail");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(t("confirmRemove"))) return;
    startTransition(async () => {
      const result = await removeMemberAction({ cellGroupId, memberId });
      if (result.ok) {
        toast.success(t("removedToast"));
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
      aria-label={t("remove")}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
