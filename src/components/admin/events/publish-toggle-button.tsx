"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { setEventPublishedAction } from "@/server/actions/events/update";

export function PublishToggleButton({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const t = useTranslations("events.detail");
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await setEventPublishedAction(id, !isPublished);
      if (result.ok) {
        toast.success(
          isPublished ? t("unpublishedToast") : t("publishedToast"),
        );
      } else {
        toast.error(t("errorToast"));
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={pending}
    >
      {isPublished ? t("unpublish") : t("publish")}
    </Button>
  );
}
