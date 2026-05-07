"use client";

import { addDays, startOfWeek } from "date-fns";
import { Loader2, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { DatePicker } from "@/components/shared/date-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { generateWeekAssignmentsAction } from "@/server/actions/volunteers/defaults";

function nextSunday(): string {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const sunday = addDays(monday, 6);
  return sunday.toISOString().slice(0, 10);
}

type TeamOption = { id: string; name: string; defaultCount: number };

export function GenerateWeekButton({ teams }: { teams: TeamOption[] }) {
  const t = useTranslations("volunteers.schedule.generate");
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<string>(nextSunday());
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(
    () => new Set(teams.map((t) => t.id)),
  );
  const [pending, startTransition] = useTransition();

  function toggleTeam(teamId: string) {
    setSelectedTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  }

  function handleGenerate() {
    if (selectedTeamIds.size === 0) {
      toast.error(t("selectAtLeastOne"));
      return;
    }
    startTransition(async () => {
      const result = await generateWeekAssignmentsAction({
        serviceDate: date,
        teamIds: [...selectedTeamIds],
      });
      if (result.ok) {
        if (result.data.created === 0 && result.data.skippedExisting === 0) {
          toast.info(t("noDefaultsToast"));
        } else if (result.data.created === 0) {
          toast.info(t("allExistToast"));
        } else {
          toast.success(
            t("generatedToast", {
              created: result.data.created,
              skipped: result.data.skippedExisting,
            }),
          );
        }
        setOpen(false);
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      // Reset selection to "all" each time the dialog opens, so a previous
      // week's deselection doesn't quietly carry over.
      setSelectedTeamIds(new Set(teams.map((tm) => tm.id)));
      setDate(nextSunday());
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Wand2 className="h-4 w-4" />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="generate-date">{t("dateLabel")}</Label>
          <DatePicker
            value={date}
            onChange={(v) => setDate(v)}
            ariaLabel={t("dateLabel")}
          />
        </div>

        {teams.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>{t("teamsLabel")}</Label>
              <button
                type="button"
                onClick={() => {
                  if (selectedTeamIds.size === teams.length) {
                    setSelectedTeamIds(new Set());
                  } else {
                    setSelectedTeamIds(new Set(teams.map((tm) => tm.id)));
                  }
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {selectedTeamIds.size === teams.length
                  ? t("unselectAll")
                  : t("selectAll")}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{t("teamsHint")}</p>
            <ul className="flex max-h-60 flex-col gap-1 overflow-y-auto rounded-md border p-2">
              {teams.map((team) => {
                const checked = selectedTeamIds.has(team.id);
                return (
                  <li key={team.id}>
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-sm px-2 py-1.5 hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleTeam(team.id)}
                        />
                        <span className="text-sm font-medium">{team.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t("positionsCount", { count: team.defaultCount })}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
            {t("noTeamsAvailable")}
          </p>
        )}

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
            onClick={handleGenerate}
            disabled={pending || !date || teams.length === 0 || selectedTeamIds.size === 0}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
