"use client";

import { ScanLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Ripple } from "@/components/m3/ripple";
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

/**
 * Scan action for the member portal. Opens the QR scanner dialog directly —
 * no navigation to /me/check-in first. Mirrors the scanner flow from
 * check-in/scan-banner-button.tsx.
 *
 * Rendered as an M3 FAB (56dp, `primary-container`, level 3) sitting above the
 * navigation bar, rather than the old centre-of-the-tab-bar circle. It gets a
 * real ripple: it is the portal's primary action and already a client
 * component, so the press feedback is worth the island.
 */
export function BottomNavScanButton({
  memberId,
  ariaLabel,
}: {
  memberId: string;
  ariaLabel: string;
}) {
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
        variant="fab"
        size="fab"
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        className="ripple-host"
      >
        <Ripple />
        <ScanLine aria-hidden />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dialogTitle")}</DialogTitle>
            <DialogDescription>{t("dialogDescription")}</DialogDescription>
          </DialogHeader>
          {open ? <QrScanner onScan={handleDecoded} paused={pending} /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function extractServiceId(decoded: string): string | null {
  const trimmed = decoded.trim();
  try {
    const u = new URL(trimmed);
    const fromQuery = u.searchParams.get("service");
    if (fromQuery) return fromQuery;
  } catch {
    // not a URL
  }
  const queryMatch = trimmed.match(/[?&]service=([^&#]+)/);
  if (queryMatch) return decodeURIComponent(queryMatch[1]);
  if (/^[a-z0-9]{20,30}$/.test(trimmed)) return trimmed;
  return null;
}
