"use client";

import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { MemberPicker } from "@/components/admin/giving/member-picker";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/lib/i18n/navigation";
import { createAssignmentAction } from "@/server/actions/volunteers/assignments";

import type { ActiveTeam } from "@/server/queries/volunteers";

export function AddTeamForWeekDialog({
  teams,
  serviceDate,
}: {
  teams: ActiveTeam[];
  serviceDate: Date;
}) {
  const t = useTranslations("volunteers.schedule.addTeamForWeek");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [teamId, setTeamId] = useState<string>("");
  const [positionId, setPositionId] = useState<string>("");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const positions = useMemo(
    () => teams.find((tm) => tm.id === teamId)?.positions ?? [],
    [teams, teamId],
  );

  function reset() {
    setTeamId("");
    setPositionId("");
    setMemberId(null);
    setMemberName(null);
  }

  function onSubmit() {
    if (!teamId || !memberId) return;
    startTransition(async () => {
      const result = await createAssignmentAction({
        teamId,
        positionId: positionId || null,
        memberId,
        serviceDate: serviceDate.toISOString(),
        status: "PENDING",
        notes: "",
      });
      if (result.ok) {
        toast.success(t("savedToast"));
        reset();
        setOpen(false);
        router.refresh();
      } else if (result.error === "WEEK_CONFLICT") {
        toast.error(t("weekConflictToast"));
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  if (teams.length === 0) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="h-3.5 w-3.5" />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", {
              date: serviceDate.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="add-team-team">{t("teamLabel")}</Label>
            <Select
              value={teamId}
              onValueChange={(v) => {
                setTeamId(v);
                setPositionId("");
              }}
            >
              <SelectTrigger id="add-team-team">
                <SelectValue placeholder={t("teamPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {teams.map((tm) => (
                  <SelectItem key={tm.id} value={tm.id}>
                    {tm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {teamId && positions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-team-position">{t("positionLabel")}</Label>
              <Select value={positionId} onValueChange={setPositionId}>
                <SelectTrigger id="add-team-position">
                  <SelectValue placeholder={t("positionPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {teamId ? (
            <div className="flex flex-col gap-2">
              <Label>{t("memberLabel")}</Label>
              <MemberPicker
                value={memberId}
                initialName={memberName}
                onChange={(id, name) => {
                  setMemberId(id);
                  setMemberName(name);
                }}
                placeholder={t("memberPlaceholder")}
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={pending || !teamId || !memberId}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
