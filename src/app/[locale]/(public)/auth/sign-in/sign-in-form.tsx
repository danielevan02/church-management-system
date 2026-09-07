"use client";

import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import { LoadingLink } from "@/components/shared/loading-link";
import { TextField } from "@/components/m3/text-field";
import { Button } from "@/components/ui/button";
import { signInCredentialsAction } from "@/server/actions/auth/sign-in-credentials";

export function SignInForm() {
  const t = useTranslations("auth.signIn");
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(
    signInCredentialsAction,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <TextField
        id="username"
        name="username"
        type="text"
        label={t("usernameLabel")}
        autoComplete="username"
        required
        leadingIcon={<User className="size-5" />}
        disabled={pending}
        error={Boolean(state?.error)}
      />

      <TextField
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        label={t("passwordLabel")}
        autoComplete="current-password"
        required
        leadingIcon={<Lock className="size-5" />}
        trailingIcon={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            className="flex size-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {showPassword ? (
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
          <span>{t(`errors.${state.error}`)}</span>
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
        href="/auth/member"
        className="justify-center text-center text-sm font-medium text-on-surface hover:underline"
      >
        {t("switchToMember")}
      </LoadingLink>
    </form>
  );
}
