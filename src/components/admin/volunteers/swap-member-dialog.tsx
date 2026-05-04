"use client";

import { ArrowLeftRight, Loader2 } from "lucide-react";
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
import { useRouter } from "@/lib/i18n/navigation";
import { updateAssignmentMemberAction } from "@/server/actions/volunteers/assignments";

export function SwapMemberDialog({
  assignmentId,
  currentMemberName,
}: {
  assignmentId: string;
  currentMemberName: string;
}) {
  const t = useTranslations("volunteers.schedule.swap");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setMemberId(null);
    setMemberName(null);
  }

  function onSubmit() {
    if (!memberId) return;
    startTransition(async () => {
      const result = await updateAssignmentMemberAction({
        id: assignmentId,
        memberId,
      });
      if (result.ok) {
        toast.success(t("savedToast"));
        reset();
        setOpen(false);
        router.refresh();
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("button")}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { current: currentMemberName })}
          </DialogDescription>
        </DialogHeader>

        <MemberPicker
          value={memberId}
          initialName={memberName}
          onChange={(id, name) => {
            setMemberId(id);
            setMemberName(name);
          }}
          placeholder={t("placeholder")}
        />

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
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
