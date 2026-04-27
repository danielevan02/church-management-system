"use client";

import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { sendCampaignAction } from "@/server/actions/communications/campaigns";

export function SendCampaignButton({
  id,
  totalCount,
}: {
  id: string;
  totalCount: number;
}) {
  const t = useTranslations("communications.campaign.detail");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (
      !confirm(
        t("confirmSend", { count: totalCount }),
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await sendCampaignAction(id);
      if (result.ok) {
        toast.success(
          t("sentToast", {
            sent: result.data.sent,
            failed: result.data.failed,
            total: result.data.total,
          }),
        );
        router.refresh();
      } else if (result.error === "ALREADY_SENT") {
        toast.error(t("alreadySent"));
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  return (
    <Button onClick={onClick} disabled={pending}>
      <Send className="h-4 w-4" />
      {pending ? `${t("send")}…` : t("send")}
    </Button>
  );
}
