"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import {
  deleteRsvpAction,
  memberRsvpAction,
} from "@/server/actions/events/rsvp";

type Status = "GOING" | "MAYBE" | "NOT_GOING" | "WAITLIST";

export function MemberRsvpButtons({
  eventId,
  current,
  rsvpId,
  registrationOpen,
}: {
  eventId: string;
  current: Status | null;
  rsvpId: string | null;
  registrationOpen: boolean;
}) {
  const t = useTranslations("memberPortal.events");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setStatus(status: Status) {
    startTransition(async () => {
      const result = await memberRsvpAction(eventId, { status });
      if (result.ok) {
        toast.success(
          result.data.waitlisted
            ? t("waitlistedToast")
            : t("rsvpSavedToast"),
        );
        router.refresh();
      } else if (result.error === "REGISTRATION_CLOSED") {
        toast.error(t("registrationClosed"));
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  function clear() {
    if (!rsvpId) return;
    startTransition(async () => {
      const result = await deleteRsvpAction(rsvpId);
      if (result.ok) {
        toast.success(t("rsvpRemovedToast"));
        router.refresh();
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  if (!registrationOpen) {
    return (
      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        {t("registrationClosed")}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={current === "GOING" || current === "WAITLIST" ? "default" : "outline"}
        onClick={() => setStatus("GOING")}
        disabled={pending}
      >
        <Check className="h-4 w-4" />
        {current === "WAITLIST" ? t("waitlistLabel") : t("going")}
      </Button>
      <Button
        type="button"
        variant={current === "MAYBE" ? "default" : "outline"}
        onClick={() => setStatus("MAYBE")}
        disabled={pending}
      >
        {t("maybe")}
      </Button>
      <Button
        type="button"
        variant={current === "NOT_GOING" ? "default" : "outline"}
        onClick={() => setStatus("NOT_GOING")}
        disabled={pending}
      >
        <X className="h-4 w-4" />
        {t("notGoing")}
      </Button>
      {current && rsvpId ? (
        <Button
          type="button"
          variant="ghost"
          onClick={clear}
          disabled={pending}
        >
          {t("clearRsvp")}
        </Button>
      ) : null}
    </div>
  );
}
