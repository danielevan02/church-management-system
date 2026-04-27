"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onScan: (decodedText: string) => void;
  /** ms to ignore subsequent scans of the same code, defaults to 2000. */
  cooldownMs?: number;
  paused?: boolean;
};

export function QrScanner({ onScan, cooldownMs = 2000, paused = false }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<unknown>(null);
  const lastScanRef = useRef<{ text: string; at: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let scanner: { stop: () => Promise<void>; clear: () => void } | null = null;

    async function start() {
      try {
        const mod = await import("html5-qrcode");
        if (cancelled || !containerRef.current) return;
        const Html5Qrcode = mod.Html5Qrcode;
        scanner = new Html5Qrcode("chms-qr-scanner") as unknown as {
          stop: () => Promise<void>;
          clear: () => void;
        };
        scannerRef.current = scanner;

        await (scanner as unknown as {
          start: (
            cam: { facingMode: string },
            config: { fps: number; qrbox: { width: number; height: number } },
            onSuccess: (text: string) => void,
            onError: (err: string) => void,
          ) => Promise<void>;
        }).start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (text) => {
            const now = Date.now();
            const last = lastScanRef.current;
            if (last && last.text === text && now - last.at < cooldownMs) return;
            lastScanRef.current = { text, at: now };
            onScan(text);
          },
          () => {
            // ignore per-frame decode errors
          },
        );
        if (cancelled) return;
        setStarting(false);
      } catch (e) {
        console.error("[QrScanner] start failed", e);
        if (!cancelled) setError(String(e));
      }
    }

    if (!paused) start();

    return () => {
      cancelled = true;
      const s = scannerRef.current as
        | { stop: () => Promise<void>; clear: () => void }
        | null;
      if (s) {
        s.stop()
          .catch(() => undefined)
          .finally(() => s.clear());
      }
    };
  }, [onScan, cooldownMs, paused]);

  if (paused) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md border border-dashed bg-muted text-sm text-muted-foreground">
        Scanner paused
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-destructive/5 px-6 text-center text-sm text-destructive">
        <p className="font-medium">Camera unavailable</p>
        <p className="text-xs opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border bg-black">
      <div id="chms-qr-scanner" ref={containerRef} className="aspect-square w-full" />
      {starting ? (
        <p className="border-t bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
          Starting camera…
        </p>
      ) : null}
    </div>
  );
}
