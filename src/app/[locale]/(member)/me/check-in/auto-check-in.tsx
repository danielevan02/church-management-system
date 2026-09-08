"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Banner } from "@/components/m3/banner";
import { useRouter } from "@/lib/i18n/navigation";
import { checkInMemberAction } from "@/server/actions/attendance/check-in";

type Status = "pending" | "ok" | "alreadyCheckedIn" | "error";

export function AutoCheckIn({
  serviceId,
  memberId,
  serviceName,
}: {
  serviceId: string;
  memberId: string;
  serviceName: string;
}) {
  const t = useTranslations("memberPortal.checkIn");
  const router = useRouter();
  const ranRef = useRef(false);
  const [status, setStatus] = useState<Status>("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      const result = await checkInMemberAction({
        serviceId,
        memberId,
        source: "self",
      });
      if (result.ok) {
        if (result.data.alreadyCheckedIn) {
          setStatus("alreadyCheckedIn");
          toast.info(t("autoAlreadyToast", { name: serviceName }));
        } else {
          setStatus("ok");
          toast.success(t("autoCheckedInToast", { name: serviceName }));
        }
        router.refresh();
        return;
      }
      setStatus("error");
      setErrorMessage(
        result.error === "CHECK_IN_CLOSED"
          ? t("errors.closed")
          : t("errors.generic"),
      );
    })();
  }, [serviceId, memberId, serviceName, router, t]);

  return (
    <Banner
      tone={
        status === "ok" || status === "alreadyCheckedIn"
          ? "success"
          : status === "error"
            ? "error"
            : "neutral"
      }
      icon={
        status === "pending"
          ? Loader2
          : status === "error"
            ? XCircle
            : CheckCircle2
      }
      /* The spinner has to keep spinning, and IconChip renders its glyph
         bare — so the animation class goes on the chip, not the icon. */
      className={status === "pending" ? "[&_svg]:animate-spin" : undefined}
      title={
        status === "pending"
          ? t("autoPendingTitle")
          : status === "ok"
            ? t("autoSuccessTitle")
            : status === "alreadyCheckedIn"
              ? t("autoAlreadyTitle")
              : t("autoErrorTitle")
      }
      description={
        status === "pending"
          ? t("autoPendingDescription", { name: serviceName })
          : status === "error"
            ? (errorMessage ?? t("errors.generic"))
            : t("autoSuccessDescription", { name: serviceName })
      }
    />
  );
}
