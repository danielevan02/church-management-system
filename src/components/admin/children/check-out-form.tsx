"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { MemberPicker } from "@/components/admin/giving/member-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/lib/i18n/navigation";
import { checkOutChildAction } from "@/server/actions/children/check-in";

export function CheckOutForm() {
  const t = useTranslations("children.checkOut.form");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [code, setCode] = useState("");
  const [pickupId, setPickupId] = useState<string | null>(null);
  const [pickupName, setPickupName] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !pickupId) {
      toast.error(t("missingFields"));
      return;
    }
    startTransition(async () => {
      const result = await checkOutChildAction({
        securityCode: code,
        pickupGuardianId: pickupId,
      });
      if (result.ok) {
        toast.success(t("savedToast"));
        setCode("");
        setPickupId(null);
        setPickupName(null);
        router.refresh();
        return;
      }
      if (result.error === "CODE_NOT_FOUND") {
        toast.error(t("codeNotFound"));
        return;
      }
      toast.error(t("errorToast"));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="securityCode" className="mb-2 block">
            {t("fields.code")} *
          </Label>
          <Input
            id="securityCode"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t("fields.codePlaceholder")}
            className="font-mono text-2xl uppercase tracking-widest tabular-nums"
            maxLength={8}
            autoComplete="off"
          />
        </div>
        <div>
          <Label className="mb-2 block">{t("fields.pickupGuardian")} *</Label>
          <MemberPicker
            value={pickupId}
            onChange={(id, name) => {
              setPickupId(id);
              setPickupName(name);
            }}
            placeholder={t("fields.pickupGuardianPlaceholder")}
            initialName={pickupName}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending || !code.trim() || !pickupId}>
          {pending ? `${t("submit")}…` : t("submit")}
        </Button>
      </div>
    </form>
  );
}
