"use client";

import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import { LoadingLink } from "@/components/shared/loading-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">{t("usernameLabel")}</Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder={t("usernamePlaceholder")}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t("passwordLabel")}</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pl-9 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {state?.error ? (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive"
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
          <span className="bg-background px-3 text-xs uppercase tracking-widest text-muted-foreground">
            {t("or")}
          </span>
        </div>
      </div>

      <LoadingLink
        href="/auth/member"
        className="justify-center text-center text-sm font-medium text-foreground hover:underline"
      >
        {t("switchToMember")}
      </LoadingLink>
    </form>
  );
}
