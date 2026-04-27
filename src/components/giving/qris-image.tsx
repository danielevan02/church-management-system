"use client";

import { QrCode } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function QrisImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="flex h-64 w-64 flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted text-center text-xs text-muted-foreground">
        <QrCode className="h-10 w-10" />
        <div>QRIS belum dikonfigurasi</div>
        <div className="opacity-70">Letakkan file di public/qris.png</div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={256}
      height={256}
      className="h-64 w-64 object-contain"
      unoptimized
      onError={() => setErrored(true)}
    />
  );
}
