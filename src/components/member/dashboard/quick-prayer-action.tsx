"use client";

import * as React from "react";
import { CheckCircle2, ExternalLink, Heart, Loader2, Send, X } from "lucide-react";

import { ContainerTransform } from "@/components/m3/container-transform";
import {
  QuickActionIcon,
  QuickActionLabel,
  quickActionTileClass,
} from "@/components/m3/quick-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/lib/i18n/navigation";
import { submitMyPrayerRequestAction } from "@/server/actions/prayer-requests/submit-my";

export type QuickPrayerActionProps = {
  label: string;
};

export function QuickPrayerAction({ label }: QuickPrayerActionProps) {
  const [isPending, startTransition] = React.useTransition();
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [isPrivate, setIsPrivate] = React.useState(true);
  const [isAnonymous, setIsAnonymous] = React.useState(false);

  function handleSubmit(e: React.FormEvent, close: () => void) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setError(null);
    startTransition(async () => {
      const res = await submitMyPrayerRequestAction({
        title: title.trim(),
        body: body.trim(),
        isPublic: !isPrivate,
        isAnonymous,
      });

      if (res.ok) {
        setSubmitted(true);
        setTitle("");
        setBody("");
        setTimeout(() => {
          close();
          setTimeout(() => setSubmitted(false), 400);
        }, 1500);
      } else {
        setError(res.error || "Gagal mengirim permohonan doa. Silakan coba lagi.");
      }
    });
  }

  const tileContent = (
    <div className={quickActionTileClass}>
      <QuickActionIcon icon={Heart} />
      <QuickActionLabel>{label}</QuickActionLabel>
    </div>
  );

  return (
    <ContainerTransform
      title="Permohonan Doa"
      maxWidth={520}
      triggerContent={tileContent}
      trigger={({ open, isOpen, ref }) => (
        <div
          ref={ref}
          onClick={open}
          tabIndex={0}
          role="button"
          aria-haspopup="dialog"
          data-m3-origin-hidden={isOpen ? "true" : undefined}
          style={
            isOpen
              ? {
                  visibility: "hidden",
                  opacity: 0,
                  transition: "none",
                  pointerEvents: "none",
                }
              : undefined
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              open();
            }
          }}
          className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary w-full"
        >
          {tileContent}
        </div>
      )}
    >
      {({ close }) => (
        <div className="flex flex-col p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-on-surface">
                Kirim Permohonan Doa
              </h2>
              <p className="text-xs text-on-surface-variant">
                Tim pastoral dan pendoa gereja siap menopang Anda dalam doa.
              </p>
            </div>
            <Button
              variant="text"
              size="icon"
              onClick={close}
              aria-label="Tutup form doa"
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="my-4 h-px bg-outline-variant/30" />

          {/* Form or Success State */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-success" />
              <h3 className="text-lg font-bold text-on-surface">
                Doa Anda Telah Diterima
              </h3>
              <p className="text-xs text-on-surface-variant max-w-xs">
                Terima kasih telah berbagi beban doa. Kami akan terus berdoa bersama Anda.
              </p>
            </div>
          ) : (
            <form onSubmit={(e) => handleSubmit(e, close)} className="flex flex-col gap-4">
              {error ? (
                <div className="rounded-xl bg-error-container/40 p-3 text-xs text-on-error-container">
                  {error}
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label
                  htmlFor="prayer-title"
                  className="text-xs font-semibold text-on-surface"
                >
                  Pokok Doa *
                </label>
                <Input
                  id="prayer-title"
                  placeholder="Misal: Kesembuhan orang tua, persiapan kerja..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={120}
                  className="h-10 text-xs rounded-xl"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="prayer-body"
                  className="text-xs font-semibold text-on-surface"
                >
                  Rincian Permohonan Doa *
                </label>
                <Textarea
                  id="prayer-body"
                  placeholder="Ceritakan pokok doa atau pergumulan Anda secara lebih rinci..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={4}
                  maxLength={2000}
                  className="text-xs rounded-xl resize-none"
                  disabled={isPending}
                />
              </div>

              {/* Privacy toggles */}
              <div className="space-y-2 rounded-xl bg-surface-container p-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary"
                    disabled={isPending}
                  />
                  <span className="font-medium text-on-surface">
                    Rahasia (Hanya dibaca oleh Pendeta / Tim Pastoral)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary"
                    disabled={isPending}
                  />
                  <span className="font-medium text-on-surface">
                    Kirimkan secara Anonim (Sembunyikan nama saya)
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-outline-variant/30">
                <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
                  <Link href="/me/prayer-requests">
                    <ExternalLink className="h-4 w-4" />
                    <span>Lihat Doa Saya</span>
                  </Link>
                </Button>
                <Button
                  type="submit"
                  variant="filled"
                  size="sm"
                  disabled={isPending || !title.trim() || !body.trim()}
                  className="rounded-full px-5 text-xs flex items-center gap-1.5"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Kirim Doa</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </ContainerTransform>
  );
}
