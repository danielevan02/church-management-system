"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/lib/i18n/navigation";
import { createPositionAction } from "@/server/actions/volunteers/teams";

export function AddPositionForm({ teamId }: { teamId: string }) {
  const t = useTranslations("volunteers.team.detail");
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createPositionAction(teamId, {
        name,
        isActive: true,
      });
      if (result.ok) {
        toast.success(t("positionAddedToast"));
        setName("");
        router.refresh();
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("positionPlaceholder")}
        maxLength={120}
      />
      <Button type="submit" disabled={!name.trim() || pending}>
        <Plus className="h-4 w-4" />
        {t("positionAdd")}
      </Button>
    </form>
  );
}
