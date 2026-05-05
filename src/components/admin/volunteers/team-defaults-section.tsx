"use client";

import { Loader2, Pencil, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { MemberPicker } from "@/components/admin/giving/member-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  removeTeamDefaultAction,
  setTeamDefaultAction,
} from "@/server/actions/volunteers/defaults";

type Position = {
  id: string;
  name: string;
  isActive: boolean;
};

type DefaultEntry = {
  id: string;
  positionId: string;
  member: {
    id: string;
    fullName: string;
    photoUrl: string | null;
  };
};

export function TeamDefaultsSection({
  teamId,
  positions,
  defaults,
}: {
  teamId: string;
  positions: Position[];
  defaults: DefaultEntry[];
}) {
  const t = useTranslations("volunteers.team.defaults");
  const tCommon = useTranslations("common");
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null);
  const [savingPositionId, setSavingPositionId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const defaultByPosition = new Map(defaults.map((d) => [d.positionId, d]));
  const activePositions = positions.filter((p) => p.isActive);

  function handlePick(positionId: string, memberId: string | null) {
    if (!memberId) return;
    setSavingPositionId(positionId);
    setRemovingId(null);
    startTransition(async () => {
      const result = await setTeamDefaultAction({
        teamId,
        positionId,
        memberId,
      });
      if (result.ok) {
        toast.success(t("savedToast"));
        setEditingPositionId(null);
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  function handleRemove(id: string) {
    setRemovingId(id);
    setSavingPositionId(null);
    startTransition(async () => {
      const result = await removeTeamDefaultAction(id);
      if (result.ok) {
        toast.success(t("removedToast"));
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  if (activePositions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("emptyPositions")}</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {activePositions.map((p) => {
        const current = defaultByPosition.get(p.id);
        const isEditing = editingPositionId === p.id;
        const isSaving = pending && savingPositionId === p.id;
        const isRemoving = pending && current ? removingId === current.id : false;

        return (
          <li
            key={p.id}
            className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="min-w-[120px] text-sm font-medium">
                {p.name}
              </span>
              {isSaving ? (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("saving")}
                </span>
              ) : isRemoving ? (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("removing")}
                </span>
              ) : isEditing ? (
                <div className="flex-1">
                  <MemberPicker
                    value={null}
                    onChange={(memberId) => handlePick(p.id, memberId)}
                    placeholder={t("pickerPlaceholder")}
                  />
                </div>
              ) : current ? (
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar className="h-7 w-7">
                    {current.member.photoUrl ? (
                      <AvatarImage
                        src={current.member.photoUrl}
                        alt={current.member.fullName}
                      />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {current.member.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">
                    {current.member.fullName}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {t("noDefault")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {isSaving || isRemoving ? null : isEditing ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPositionId(null)}
                  disabled={pending}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : current ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPositionId(p.id)}
                    disabled={pending}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t("change")}
                  </Button>
                  <ConfirmDialog
                    title={t("removeConfirmTitle")}
                    description={t("removeConfirmDescription", {
                      member: current.member.fullName,
                      position: p.name,
                    })}
                    confirmLabel={t("remove")}
                    cancelLabel={tCommon("cancel")}
                    destructive
                    pending={pending}
                    onConfirm={() => handleRemove(current.id)}
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPositionId(p.id)}
                  disabled={pending}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("add")}
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
