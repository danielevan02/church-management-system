"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/lib/i18n/navigation";
import { requestOtpAction } from "@/server/actions/auth/request-otp";
import { verifyOtpAction } from "@/server/actions/auth/verify-otp";

type Step = "request" | "verify";

export function OtpFlow() {
  const t = useTranslations("auth.otp");
  const [step, setStep] = useState<Step>("request");
  const [activePhone, setActivePhone] = useState<string | null>(null);

  const [requestState, requestAction, requestPending] = useActionState(
    requestOtpAction,
    null,
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyOtpAction,
    null,
  );

  useEffect(() => {
    if (requestState?.ok) {
      setActivePhone(requestState.phone);
      setStep("verify");
    }
  }, [requestState]);

  if (step === "request" || !activePhone) {
    return (
      <form action={requestAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">{t("phoneLabel")}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            required
          />
        </div>

        {requestState && !requestState.ok ? (
          <p className="text-sm text-destructive">
            {t(`errors.${requestState.error}`)}
          </p>
        ) : null}

        <Button type="submit" disabled={requestPending} className="w-full">
          {requestPending ? `${t("requestSubmit")}…` : t("requestSubmit")}
        </Button>

        <Link
          href="/auth/sign-in"
          className="text-center text-sm text-muted-foreground hover:underline"
        >
          {t("switchToStaff")}
        </Link>
      </form>
    );
  }

  return (
    <form action={verifyAction} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {t("verifySubtitle", { phone: activePhone })}
      </p>

      <input type="hidden" name="phone" value={activePhone} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="code">{t("codeLabel")}</Label>
        <Input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          autoComplete="one-time-code"
          required
          autoFocus
        />
      </div>

      {verifyState?.error ? (
        <p className="text-sm text-destructive">
          {t(`errors.${verifyState.error}`)}
        </p>
      ) : null}

      <Button type="submit" disabled={verifyPending} className="w-full">
        {verifyPending ? `${t("verifySubmit")}…` : t("verifySubmit")}
      </Button>

      <button
        type="button"
        onClick={() => setStep("request")}
        className="text-center text-sm text-muted-foreground hover:underline"
      >
        {t("resend")}
      </button>
    </form>
  );
}
