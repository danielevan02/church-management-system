"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { checkInMemberAction } from "@/server/actions/attendance/check-in";

export function SelfCheckInButton({
  serviceId,
  memberId,
}: {
  serviceId: string;
  memberId: string;
}) {
  const t = useTranslations("memberPortal.checkIn");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await checkInMemberAction({
        serviceId,
        memberId,
        source: "self",
      });
      if (result.ok) {
        toast.success(t("checkedInToast"));
        router.refresh();
      } else if (result.error === "CHECK_IN_CLOSED") {
        toast.error(t("errors.closed"));
      } else {
        toast.error(t("errors.generic"));
      }
    });
  }

  return (
    <Button onClick={onClick} disabled={pending}>
      {pending ? `${t("button")}…` : t("button")}
    </Button>
  );
}
