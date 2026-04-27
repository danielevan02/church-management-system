"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/lib/i18n/navigation";
import { signInCredentialsAction } from "@/server/actions/auth/sign-in-credentials";

export function SignInForm() {
  const t = useTranslations("auth.signIn");
  const [state, action, pending] = useActionState(
    signInCredentialsAction,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t("passwordLabel")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("submit") + "…" : t("submit")}
      </Button>

      <Link
        href="/auth/verify-otp"
        className="text-center text-sm text-muted-foreground hover:underline"
      >
        {t("switchToOtp")}
      </Link>
    </form>
  );
}
