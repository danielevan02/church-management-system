"use client";

import { QrCode } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function QrisImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
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
