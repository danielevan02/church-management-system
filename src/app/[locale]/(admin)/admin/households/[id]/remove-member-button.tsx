"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { removeMemberFromHouseholdAction } from "@/server/actions/households/remove-member";

export function RemoveMemberButton({
  householdId,
  memberId,
}: {
  householdId: string;
  memberId: string;
}) {
  const t = useTranslations("households.detail.members");
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await removeMemberFromHouseholdAction(
        householdId,
        memberId,
      );
      if (result.ok) toast.success(t("removedToast"));
      else toast.error(t("errorToast"));
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={pending}
      title={t("remove")}
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
