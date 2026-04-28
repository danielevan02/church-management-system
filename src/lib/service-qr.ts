import "server-only";

import QRCode from "qrcode";

import { church } from "@/config/church";

/**
 * URL embedded in the printable service QR. Member scans → opens
 * /me/check-in?service=<id> → auto-checkin runs if logged in & service open.
 */
export function buildServiceCheckInUrl(serviceId: string, locale = "id"): string {
  const origin = (
    process.env.AUTH_URL ??
    (church.domain ? `https://${church.domain}` : "http://localhost:3000")
  ).replace(/\/$/, "");
  const path = locale === "id" ? "/me/check-in" : `/${locale}/me/check-in`;
  return `${origin}${path}?service=${serviceId}`;
}

export async function renderServiceQrDataUrl(
  serviceId: string,
  locale = "id",
): Promise<{ url: string; dataUrl: string }> {
  const url = buildServiceCheckInUrl(serviceId, locale);
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 1024,
    color: { dark: "#000000", light: "#ffffff" },
  });
  return { url, dataUrl };
}
