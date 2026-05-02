"use client";

import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setMemberPinAction } from "@/server/actions/auth/set-member-pin";

type Props = {
  memberId: string;
  hasExistingPin: boolean;
  hasPhone: boolean;
};

export function SetPinDialog({ memberId, hasExistingPin, hasPhone }: Props) {
  const t = useTranslations("members.detail.login");
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setPin("");
    setConfirm("");
    setError(null);
    setShow(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^\d{4,6}$/.test(pin)) {
      setError(t("errors.invalidFormat"));
      return;
    }
    if (pin !== confirm) {
      setError(t("errors.mismatch"));
      return;
    }

    startTransition(async () => {
      const result = await setMemberPinAction(memberId, pin);
      if (result.ok) {
        toast.success(t("savedToast"));
        setOpen(false);
        reset();
        return;
      }
      switch (result.error) {
        case "NO_PHONE":
          setError(t("errors.noPhone"));
          break;
        case "PIN_COLLISION":
          setError(t("errors.pinCollision"));
          break;
        case "FORBIDDEN":
        case "UNAUTHORIZED":
          setError(t("errors.forbidden"));
          break;
        default:
          setError(t("errors.internal"));
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!hasPhone}>
          <KeyRound className="h-4 w-4" />
          {hasExistingPin ? t("resetButton") : t("setButton")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hasExistingPin ? t("resetTitle") : t("setTitle")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="pin">{t("pinLabel")}</Label>
            <div className="relative">
              <Input
                id="pin"
                type={show ? "text" : "password"}
                inputMode="numeric"
                pattern="\d{4,6}"
                minLength={4}
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                required
                className="pr-10 tracking-[0.3em]"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm">{t("confirmLabel")}</Label>
            <Input
              id="confirm"
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
            />
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("submit")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
