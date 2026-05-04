"use client";

import { AlertCircle, Eye, EyeOff, KeyRound, Loader2, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import { LoadingLink } from "@/components/shared/loading-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signInPinAction,
  type SignInPinState,
} from "@/server/actions/auth/sign-in-pin";

export function MemberSignInForm() {
  const t = useTranslations("auth.pin");
  const [show, setShow] = useState(false);
  const [state, formAction, pending] = useActionState<SignInPinState, FormData>(
    signInPinAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="pin">{t("pinLabel")}</Label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="pin"
            name="pin"
            type={show ? "text" : "password"}
            inputMode="numeric"
            autoComplete="current-password"
            pattern="\d{4,6}"
            minLength={4}
            maxLength={6}
            placeholder={t("pinPlaceholder")}
            required
            className="pl-9 pr-10 tracking-[0.3em]"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={show ? t("hidePin") : t("showPin")}
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{t("pinHint")}</p>
      </div>

      {state?.error ? (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {state.error === "throttled" && state.retryAfterS
              ? t("errors.throttled", { seconds: state.retryAfterS })
              : t(`errors.${state.error}`)}
          </span>
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("submit")}
          </>
        ) : (
          t("submit")
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {t("forgotPin")}
      </p>

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

      <LoadingLink
        href="/auth/sign-in"
        className="justify-center text-center text-sm font-medium text-foreground hover:underline"
      >
        {t("switchToStaff")}
      </LoadingLink>
    </form>
  );
}
