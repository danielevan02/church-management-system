"use client";

import { Check, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import {
  deleteRsvpAction,
  memberRsvpAction,
} from "@/server/actions/events/rsvp";

type Status = "GOING" | "MAYBE" | "NOT_GOING" | "WAITLIST";
type Action = Status | "CLEAR";

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
  const [active, setActive] = useState<Action | null>(null);

  function setStatus(status: Status) {
    setActive(status);
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
      setActive(null);
    });
  }

  function clear() {
    if (!rsvpId) return;
    setActive("CLEAR");
    startTransition(async () => {
      const result = await deleteRsvpAction(rsvpId);
      if (result.ok) {
        toast.success(t("rsvpRemovedToast"));
        router.refresh();
      } else {
        toast.error(t("errorToast"));
      }
      setActive(null);
    });
  }

  if (!registrationOpen) {
    return (
      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        {t("registrationClosed")}
      </div>
    );
  }

  const isLoading = (a: Action) => pending && active === a;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={current === "GOING" || current === "WAITLIST" ? "default" : "outline"}
        onClick={() => setStatus("GOING")}
        disabled={pending}
      >
        {isLoading("GOING") ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {current === "WAITLIST" ? t("waitlistLabel") : t("going")}
      </Button>
      <Button
        type="button"
        variant={current === "MAYBE" ? "default" : "outline"}
        onClick={() => setStatus("MAYBE")}
        disabled={pending}
      >
        {isLoading("MAYBE") ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : null}
        {t("maybe")}
      </Button>
      <Button
        type="button"
        variant={current === "NOT_GOING" ? "default" : "outline"}
        onClick={() => setStatus("NOT_GOING")}
        disabled={pending}
      >
        {isLoading("NOT_GOING") ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
        {t("notGoing")}
      </Button>
      {current && rsvpId ? (
        <Button
          type="button"
          variant="ghost"
          onClick={clear}
          disabled={pending}
        >
          {isLoading("CLEAR") ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {t("clearRsvp")}
        </Button>
      ) : null}
    </div>
  );
}
