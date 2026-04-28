"use client";

import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "chms.pwa.installDismissed";

export function InstallPrompt() {
  const t = useTranslations("dashboard.member.install");
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setDismissed(window.localStorage.getItem(DISMISSED_KEY) === "1");

    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setEvent(null));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!event || dismissed) return null;

  const onInstall = async () => {
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      setEvent(null);
    }
  };

  const onDismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
      <div className="flex flex-col">
        <span className="font-medium">{t("title")}</span>
        <span className="text-xs text-muted-foreground">{t("description")}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button size="sm" onClick={onInstall} className="gap-1.5">
          <Download className="h-4 w-4" />
          {t("install")}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDismiss}
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
