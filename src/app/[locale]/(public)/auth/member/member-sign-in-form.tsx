"use client";

import { AlertCircle, Eye, EyeOff, KeyRound, Loader2, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import { LoadingLink } from "@/components/shared/loading-link";
import { TextField } from "@/components/m3/text-field";
import { Button } from "@/components/ui/button";
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
      <TextField
        id="phone"
        name="phone"
        type="tel"
        label={t("phoneLabel")}
        supportingText={t("phoneHint")}
        autoComplete="tel"
        required
        leadingIcon={<Phone className="size-5" />}
        disabled={pending}
        error={Boolean(state?.error)}
      />

      <TextField
        id="pin"
        name="pin"
        type={show ? "text" : "password"}
        label={t("pinLabel")}
        supportingText={t("pinHint")}
        inputMode="numeric"
        autoComplete="current-password"
        pattern="\d{4,6}"
        minLength={4}
        maxLength={6}
        required
        leadingIcon={<KeyRound className="size-5" />}
        className="tracking-[0.3em]"
        trailingIcon={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="flex size-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={show ? t("hidePin") : t("showPin")}
          >
            {show ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        }
        disabled={pending}
        error={Boolean(state?.error)}
      />

      {state?.error ? (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-error"
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

      <p className="text-center text-xs text-on-surface-variant">
        {t("forgotPin")}
      </p>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-3 text-xs uppercase tracking-widest text-on-surface-variant">
            {t("or")}
          </span>
        </div>
      </div>

      <LoadingLink
        href="/auth/sign-in"
        className="justify-center text-center text-sm font-medium text-on-surface hover:underline"
      >
        {t("switchToStaff")}
      </LoadingLink>
    </form>
  );
}
