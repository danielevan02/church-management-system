"use client";

import { addDays, startOfWeek } from "date-fns";
import { Loader2, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { DatePicker } from "@/components/shared/date-picker";
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
import { generateWeekAssignmentsAction } from "@/server/actions/volunteers/defaults";

function nextSunday(): string {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const sunday = addDays(monday, 6);
  return sunday.toISOString().slice(0, 10);
}

export function GenerateWeekButton() {
  const t = useTranslations("volunteers.schedule.generate");
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<string>(nextSunday());
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateWeekAssignmentsAction({
        serviceDate: date,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            disabled={pending || !date}
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
