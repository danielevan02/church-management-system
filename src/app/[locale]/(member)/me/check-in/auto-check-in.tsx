"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card
      className={
        status === "ok" || status === "alreadyCheckedIn"
          ? "border-emerald-500/40 bg-emerald-500/5"
          : status === "error"
            ? "border-destructive/40 bg-destructive/5"
            : ""
      }
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {status === "pending" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : null}
          {status === "ok" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : null}
          {status === "alreadyCheckedIn" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : null}
          {status === "error" ? (
            <XCircle className="h-5 w-5 text-destructive" />
          ) : null}
          {status === "pending"
            ? t("autoPendingTitle")
            : status === "ok"
              ? t("autoSuccessTitle")
              : status === "alreadyCheckedIn"
                ? t("autoAlreadyTitle")
                : t("autoErrorTitle")}
        </CardTitle>
        <CardDescription>
          {status === "pending"
            ? t("autoPendingDescription", { name: serviceName })
            : status === "error"
              ? (errorMessage ?? t("errors.generic"))
              : t("autoSuccessDescription", { name: serviceName })}
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
