"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { setAssignmentStatusAction } from "@/server/actions/volunteers/assignments";

type Status = "PENDING" | "CONFIRMED" | "DECLINED" | "COMPLETED";

export function MemberAssignmentActions({
  id,
  status,
}: {
  id: string;
  status: Status;
}) {
  const t = useTranslations("memberPortal.volunteer");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function set(next: "CONFIRMED" | "DECLINED") {
    startTransition(async () => {
      const result = await setAssignmentStatusAction({
        id,
        status: next,
        selfAction: true,
      });
      if (result.ok) {
        toast.success(
          next === "CONFIRMED" ? t("acceptedToast") : t("declinedToast"),
        );
        router.refresh();
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  if (status === "CONFIRMED" || status === "DECLINED" || status === "COMPLETED") {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        onClick={() => set("CONFIRMED")}
        disabled={pending}
      >
        <Check className="h-4 w-4" />
        {t("accept")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => set("DECLINED")}
        disabled={pending}
      >
        <X className="h-4 w-4" />
        {t("decline")}
      </Button>
    </div>
  );
}
