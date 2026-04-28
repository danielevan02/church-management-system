"use client";

import { ScanLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { QrScanner } from "@/components/shared/qr-scanner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "@/lib/i18n/navigation";
import { checkInMemberAction } from "@/server/actions/attendance/check-in";

export function ScanBannerButton({ memberId }: { memberId: string }) {
  const t = useTranslations("memberPortal.checkIn.scan");
  const tErr = useTranslations("memberPortal.checkIn.errors");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDecoded(text: string) {
    if (pending) return;
    const serviceId = extractServiceId(text);
    if (!serviceId) {
      toast.error(t("invalid"));
      return;
    }
    startTransition(async () => {
      const result = await checkInMemberAction({
        serviceId,
        memberId,
        source: "self",
      });
      setOpen(false);
      if (result.ok) {
        if (result.data.alreadyCheckedIn) {
          toast.info(t("alreadyToast"));
        } else {
          toast.success(t("successToast"));
        }
        router.refresh();
        return;
      }
      if (result.error === "CHECK_IN_CLOSED") {
        toast.error(tErr("closed"));
      } else if (result.error === "SERVICE_NOT_FOUND") {
        toast.error(t("notFound"));
      } else {
        toast.error(tErr("generic"));
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        size="lg"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <ScanLine className="h-5 w-5" />
        {t("button")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dialogTitle")}</DialogTitle>
            <DialogDescription>{t("dialogDescription")}</DialogDescription>
          </DialogHeader>
          {open ? (
            <QrScanner onScan={handleDecoded} paused={pending} />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Banner QR encodes the full check-in URL. Accept either:
 *   https://<domain>/me/check-in?service=<id>
 *   https://<domain>/<locale>/me/check-in?service=<id>
 *   /me/check-in?service=<id>
 *   <id>            (raw fallback)
 */
function extractServiceId(decoded: string): string | null {
  const trimmed = decoded.trim();
  // Try as URL first
  try {
    const u = new URL(trimmed);
    const fromQuery = u.searchParams.get("service");
    if (fromQuery) return fromQuery;
  } catch {
    // not a URL
  }
  // Treat as path / id fallback
  const queryMatch = trimmed.match(/[?&]service=([^&#]+)/);
  if (queryMatch) return decodeURIComponent(queryMatch[1]);
  // Raw cuid (alphanumeric only, reasonable length)
  if (/^[a-z0-9]{20,30}$/.test(trimmed)) return trimmed;
  return null;
}
