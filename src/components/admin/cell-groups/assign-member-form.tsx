"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { MemberPicker } from "@/components/admin/giving/member-picker";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { assignMemberAction } from "@/server/actions/cell-groups/members";

export function AssignCellGroupMemberForm({
  cellGroupId,
}: {
  cellGroupId: string;
}) {
  const t = useTranslations("cellGroups.detail.assign");
  const router = useRouter();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId) return;
    startTransition(async () => {
      const result = await assignMemberAction({ cellGroupId, memberId });
      if (result.ok) {
        toast.success(t("addedToast"));
        setMemberId(null);
        router.refresh();
      } else {
        toast.error(
          result.error === "ALREADY_MEMBER"
            ? t("alreadyMember")
            : t("errorToast"),
        );
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <MemberPicker
          value={memberId}
          onChange={(id) => setMemberId(id)}
          placeholder={t("memberPlaceholder")}
        />
      </div>
      <Button type="submit" disabled={!memberId || pending}>
        {pending ? `${t("submit")}…` : t("submit")}
      </Button>
    </form>
  );
}
