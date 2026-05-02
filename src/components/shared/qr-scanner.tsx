"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

type Props = {
  onScan: (decodedText: string) => void;
  /** ms to ignore subsequent scans of the same code, defaults to 2000. */
  cooldownMs?: number;
  paused?: boolean;
};

type Html5QrcodeInstance = {
  start: (
    cam: { facingMode: string },
    config: { fps: number; qrbox: { width: number; height: number } },
    onSuccess: (text: string) => void,
    onError: (err: string) => void,
  ) => Promise<void>;
  stop: () => Promise<void>;
  clear: () => void;
  getState: () => number;
};

// html5-qrcode internal state codes (lib does not export them).
const STATE_SCANNING = 2;
const STATE_PAUSED = 3;

export function QrScanner({ onScan, cooldownMs = 2000, paused = false }: Props) {
  const t = useTranslations("attendance.scanner");
  const reactId = useId();
  // html5-qrcode requires a CSS-id-safe string (no colons that React adds).
  const elementId = `qr-scanner-${reactId.replace(/[^a-z0-9_-]/gi, "")}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const lastScanRef = useRef<{ text: string; at: number } | null>(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  // Keep latest onScan reachable from inside the effect without retriggering it.
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let cancelled = false;
    let scanner: Html5QrcodeInstance | null = null;

    async function start() {
      try {
        const mod = await import("html5-qrcode");
        if (cancelled || !containerRef.current) return;
        scanner = new mod.Html5Qrcode(elementId) as unknown as Html5QrcodeInstance;
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (text) => {
            const now = Date.now();
            const last = lastScanRef.current;
            if (last && last.text === text && now - last.at < cooldownMs) return;
            lastScanRef.current = { text, at: now };
            onScanRef.current(text);
          },
          () => {
            // ignore per-frame decode errors
          },
        );
        if (cancelled) {
          // The user navigated away while start() was awaiting. Tear down now.
          await safeStop(scanner);
          return;
        }
        setStarting(false);
      } catch (e) {
        console.error("[QrScanner] start failed", e);
        if (!cancelled) setError(String(e));
      }
    }

    if (!paused) start();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) void safeStop(s);
    };
  }, [cooldownMs, paused, elementId]);

  if (paused) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md border border-dashed bg-muted text-sm text-muted-foreground">
        {t("paused")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-destructive/5 px-6 text-center text-sm text-destructive">
        <p className="font-medium">{t("cameraUnavailable")}</p>
        <p className="text-xs opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border bg-black">
      {/* Force the video preview to render unmirrored. We use the rear
          ("environment") camera — mirroring is correct only for selfie/front
          cameras. The !important beats any inline transform html5-qrcode
          applies on its own. */}
      <style>{`#${elementId} video { transform: none !important; }`}</style>
      <div
        id={elementId}
        ref={containerRef}
        className="aspect-square w-full"
      />
      {starting ? (
        <p className="border-t bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
          {t("startingCamera")}
        </p>
      ) : null}
    </div>
  );
}

// html5-qrcode throws synchronously if you call stop() while it is not in
// SCANNING/PAUSED state. Promise .catch() does not cover sync throws — guard
// with a state check + try/catch and always run clear() to release the DOM.
async function safeStop(scanner: Html5QrcodeInstance): Promise<void> {
  try {
    const state = scanner.getState();
    if (state === STATE_SCANNING || state === STATE_PAUSED) {
      await scanner.stop();
    }
  } catch {
    // already stopped or never started — ignore
  } finally {
    try {
      scanner.clear();
    } catch {
      // ignore
    }
  }
}
