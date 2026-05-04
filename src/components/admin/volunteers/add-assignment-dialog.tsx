"use client";

import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
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

type Position = { id: string; name: string };

export function AddAssignmentDialog({
  teamId,
  teamName,
  positions,
  serviceDate,
}: {
  teamId: string;
  teamName: string;
  positions: Position[];
  serviceDate: Date;
}) {
  const t = useTranslations("volunteers.schedule.addAssignment");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [positionId, setPositionId] = useState<string>("");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setPositionId("");
    setMemberId(null);
    setMemberName(null);
  }

  function onSubmit() {
    if (!memberId) {
      toast.error(t("missingMember"));
      return;
    }
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
          <DialogTitle>{t("title", { team: teamName })}</DialogTitle>
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
          {positions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="add-position">{t("positionLabel")}</Label>
              <Select value={positionId} onValueChange={setPositionId}>
                <SelectTrigger id="add-position">
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
            disabled={pending || !memberId}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
