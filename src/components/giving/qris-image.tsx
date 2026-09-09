"use client";

import { QrCode } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import * as React from "react";

import { cn } from "@/lib/utils";

export function QrisImage({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  /**
   * What to show when the file is missing. The default is styled in M3 roles,
   * which is right on `/give` and wrong on the landing page — that page is
   * theme-independent and would get a dark tonal box on a paper ground for any
   * visitor whose OS is in dark mode. Callers outside the themed app pass
   * their own.
   */
  fallback?: React.ReactNode;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-outline-variant bg-surface-container-high p-4 text-center text-xs text-on-surface-variant",
          className || "h-64 w-64"
        )}
      >
        <QrCode className="h-8 w-8 text-on-surface-variant/70" />
        <div className="font-medium">QRIS belum dikonfigurasi</div>
        <div className="text-[10px] text-on-surface-variant/60">
          Letakkan file di public/qris.png
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={256}
      height={256}
      className={className || "h-64 w-64 object-contain"}
      unoptimized
      onError={() => setErrored(true)}
    />
  );
}
