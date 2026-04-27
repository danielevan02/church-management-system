"use client";

import { ArrowLeft, Loader2, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/lib/i18n/navigation";
import { requestOtpAction } from "@/server/actions/auth/request-otp";
import { verifyOtpAction } from "@/server/actions/auth/verify-otp";

type Step = "request" | "verify";

const RESEND_SECONDS = 60;

export function OtpFlow() {
  const t = useTranslations("auth.otp");
  const [step, setStep] = useState<Step>("request");
  const [activePhone, setActivePhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);

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
      setResendIn(RESEND_SECONDS);
    }
  }, [requestState]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  if (step === "request" || !activePhone) {
    return (
      <form action={requestAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">{t("phoneLabel")}</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={t("phonePlaceholder")}
              required
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">{t("phoneHint")}</p>
        </div>

        {requestState && !requestState.ok ? (
          <Alert variant="destructive">
            <AlertDescription>
              {t(`errors.${requestState.error}`)}
            </AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" disabled={requestPending} className="w-full">
          {requestPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("requestSubmit")}
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4" />
              {t("requestSubmit")}
            </>
          )}
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs uppercase tracking-widest text-muted-foreground">
              {t("or")}
            </span>
          </div>
        </div>

        <Link
          href="/auth/sign-in"
          className="text-center text-sm font-medium text-foreground hover:underline"
        >
          {t("switchToStaff")}
        </Link>
      </form>
    );
  }

  return (
    <form action={verifyAction} className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => {
          setStep("request");
          setCode("");
        }}
        className="-ml-1 inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("changeNumber")}
      </button>

      <p className="text-sm text-muted-foreground">
        {t("verifySubtitle", { phone: activePhone })}
      </p>

      <input type="hidden" name="phone" value={activePhone} />
      <input type="hidden" name="code" value={code} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="code-0">{t("codeLabel")}</Label>
        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          autoFocus
          containerClassName="justify-center"
        >
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                id={i === 0 ? "code-0" : undefined}
                className="h-12 w-11 text-lg"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {verifyState?.error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {t(`errors.${verifyState.error}`)}
          </AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        disabled={verifyPending || code.length !== 6}
        className="w-full"
      >
        {verifyPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("verifySubmit")}
          </>
        ) : (
          t("verifySubmit")
        )}
      </Button>

      {resendIn > 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {t("resendIn", { seconds: resendIn })}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => {
            setStep("request");
            setCode("");
          }}
          className="text-center text-sm font-medium text-foreground hover:underline"
        >
          {t("resend")}
        </button>
      )}
    </form>
  );
}
