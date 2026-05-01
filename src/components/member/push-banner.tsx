"use client";

import { Bell, BellOff, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { subscribePushAction } from "@/server/actions/push/subscribe";
import { unsubscribePushAction } from "@/server/actions/push/unsubscribe";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const DISMISSED_KEY = "chms.push.bannerDismissed";

function urlBase64ToUint8Array(base64: string): BufferSource {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = typeof window !== "undefined" ? window.atob(b64) : "";
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
}

function arrayBufferToBase64(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return typeof window !== "undefined" ? window.btoa(bin) : "";
}

type State =
  | "checking"
  | "unsupported"
  | "denied"
  | "subscribed"
  | "unsubscribed";

export function PushBanner() {
  const t = useTranslations("memberPortal.push");
  const [state, setState] = useState<State>("checking");
  const [dismissed, setDismissed] = useState(true);
  const [pending, startTransition] = useTransition();

  const checkState = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!VAPID_PUBLIC_KEY) {
      setState("unsupported");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "subscribed" : "unsubscribed");
    } catch {
      setState("unsupported");
    }
  }, []);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISSED_KEY) === "1");
    void checkState();
  }, [checkState]);

  const onSubscribe = () => {
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setState(permission === "denied" ? "denied" : "unsubscribed");
          return;
        }

        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        const json = sub.toJSON();
        const result = await subscribePushAction({
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh ?? arrayBufferToBase64(sub.getKey("p256dh")),
          auth: json.keys?.auth ?? arrayBufferToBase64(sub.getKey("auth")),
          userAgent: navigator.userAgent.slice(0, 512),
        });

        if (!result.ok) {
          await sub.unsubscribe().catch(() => undefined);
          toast.error(t("toastError"));
          return;
        }
        setState("subscribed");
        toast.success(t("toastEnabled"));
      } catch (err) {
        console.error("[push] subscribe failed", err);
        toast.error(t("toastError"));
      }
    });
  };

  const onDismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  if (state === "checking" || state === "unsupported") return null;
  if (state === "subscribed") return null;
  if (state === "unsubscribed" && dismissed) return null;

  if (state === "denied") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-muted bg-muted/30 px-4 py-3 text-sm">
        <div className="flex flex-col">
          <span className="font-medium">{t("deniedTitle")}</span>
          <span className="text-xs text-muted-foreground">
            {t("deniedDescription")}
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDismiss}
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
      <div className="flex flex-col">
        <span className="font-medium">{t("enableTitle")}</span>
        <span className="text-xs text-muted-foreground">
          {t("enableDescription")}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="sm"
          onClick={onSubscribe}
          disabled={pending}
          className="gap-1.5"
        >
          <Bell className="h-4 w-4" />
          {t("enable")}
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

export function PushUnsubscribeRow() {
  const t = useTranslations("memberPortal.push");
  const [state, setState] = useState<State>("checking");
  const [pending, startTransition] = useTransition();

  const checkState = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!VAPID_PUBLIC_KEY) return setState("unsupported");
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return setState("unsupported");
    }
    if (Notification.permission === "denied") return setState("denied");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "subscribed" : "unsubscribed");
    } catch {
      setState("unsupported");
    }
  }, []);

  useEffect(() => {
    void checkState();
  }, [checkState]);

  const onUnsubscribe = () => {
    startTransition(async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await unsubscribePushAction({ endpoint: sub.endpoint });
          await sub.unsubscribe();
        }
        setState("unsubscribed");
        toast.success(t("toastDisabled"));
      } catch (err) {
        console.error("[push] unsubscribe failed", err);
        toast.error(t("toastError"));
      }
    });
  };

  if (state !== "subscribed") return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm">
      <div className="flex flex-col">
        <span className="font-medium">{t("subscribedTitle")}</span>
        <span className="text-xs text-muted-foreground">
          {t("subscribedDescription")}
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onUnsubscribe}
        disabled={pending}
        className="gap-1.5"
      >
        <BellOff className="h-4 w-4" />
        {t("disable")}
      </Button>
    </div>
  );
}
