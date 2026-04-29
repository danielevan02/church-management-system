"use client";

import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePinAction } from "@/server/actions/auth/change-pin";

export function ChangePinForm() {
  const t = useTranslations("memberPortal.profile.pin");
  const [show, setShow] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setCurrentPin("");
    setNewPin("");
    setConfirm("");
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^\d{4,6}$/.test(currentPin) || !/^\d{4,6}$/.test(newPin)) {
      setError(t("errors.invalidFormat"));
      return;
    }
    if (newPin !== confirm) {
      setError(t("errors.mismatch"));
      return;
    }
    if (currentPin === newPin) {
      setError(t("errors.sameAsCurrent"));
      return;
    }

    startTransition(async () => {
      const result = await changePinAction(currentPin, newPin);
      if (result.ok) {
        toast.success(t("savedToast"));
        reset();
        return;
      }
      switch (result.error) {
        case "INVALID_CURRENT":
          setError(t("errors.invalidCurrent"));
          break;
        case "VALIDATION_FAILED":
          setError(t("errors.invalidFormat"));
          break;
        default:
          setError(t("errors.internal"));
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPin">{t("currentLabel")}</Label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="currentPin"
            type={show ? "text" : "password"}
            inputMode="numeric"
            pattern="\d{4,6}"
            minLength={4}
            maxLength={6}
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            required
            className="pl-9 pr-10 tracking-[0.3em]"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="newPin">{t("newLabel")}</Label>
        <Input
          id="newPin"
          type={show ? "text" : "password"}
          inputMode="numeric"
          pattern="\d{4,6}"
          minLength={4}
          maxLength={6}
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          required
          className="tracking-[0.3em]"
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">{t("hint")}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPin">{t("confirmLabel")}</Label>
        <Input
          id="confirmPin"
          type={show ? "text" : "password"}
          inputMode="numeric"
          pattern="\d{4,6}"
          minLength={4}
          maxLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          required
          className="tracking-[0.3em]"
          autoComplete="new-password"
        />
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("submit")}
          </>
        ) : (
          t("submit")
        )}
      </Button>
    </form>
  );
}
