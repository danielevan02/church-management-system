"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HOUSEHOLD_ROLES,
  type HouseholdRole,
} from "@/lib/validation/household";
import { assignMemberToHouseholdAction } from "@/server/actions/households";

type Candidate = { id: string; fullName: string; phone: string | null };

export function AssignMemberForm({
  householdId,
  candidates,
}: {
  householdId: string;
  candidates: Candidate[];
}) {
  const t = useTranslations("households.detail.assign");
  const [memberId, setMemberId] = useState<string>("");
  const [role, setRole] = useState<HouseholdRole | "_none">("_none");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    if (!memberId) return;
    startTransition(async () => {
      const result = await assignMemberToHouseholdAction(householdId, {
        memberId,
        householdRole: role === "_none" ? null : role,
      });
      if (result.ok) {
        toast.success(t("addedToast"));
        setMemberId("");
        setRole("_none");
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  if (candidates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("noCandidates")}</p>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-muted/30 p-4">
      <p className="text-sm font-medium">{t("title")}</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label>{t("memberLabel")}</Label>
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger>
              <SelectValue placeholder={t("memberPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.fullName}
                  {c.phone ? ` · ${c.phone}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t("roleLabel")}</Label>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as HouseholdRole | "_none")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">—</SelectItem>
              {HOUSEHOLD_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {t(`roles.${r}` as never)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            onClick={handleSubmit}
            disabled={!memberId || pending}
            className="w-full md:w-auto"
          >
            {pending ? `${t("submit")}…` : t("submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
