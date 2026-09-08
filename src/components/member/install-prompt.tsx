"use client";

import { Download, Smartphone, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Banner } from "@/components/m3/banner";
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
    <Banner
      icon={Smartphone}
      title={t("title")}
      description={t("description")}
      actions={
        <>
          <Button size="sm" onClick={onInstall} className="rounded-full">
            <Download className="h-4 w-4" />
            {t("install")}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDismiss}
            aria-label={t("dismiss")}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      }
    />
  );
}
