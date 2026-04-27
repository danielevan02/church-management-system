import "server-only";

import { SignJWT, jwtVerify } from "jose";
import QRCode from "qrcode";

const QR_ISSUER = "chms";
const QR_AUDIENCE = "member-qr";
const QR_TTL_SECONDS = 365 * 24 * 60 * 60;

function secret(): Uint8Array {
  const key = process.env.AUTH_SECRET;
  if (!key) throw new Error("AUTH_SECRET is required to sign member QR codes");
  return new TextEncoder().encode(key);
}

export async function signMemberQrToken(memberId: string): Promise<string> {
  return new SignJWT({ kind: "member" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(memberId)
    .setIssuer(QR_ISSUER)
    .setAudience(QR_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${QR_TTL_SECONDS}s`)
    .sign(secret());
}

export async function verifyMemberQrToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, secret(), {
    issuer: QR_ISSUER,
    audience: QR_AUDIENCE,
  });
  if (typeof payload.sub !== "string" || payload.sub.length === 0) {
    throw new Error("INVALID_QR_TOKEN");
  }
  return payload.sub;
}

export async function renderMemberQrDataUrl(memberId: string): Promise<{
  token: string;
  dataUrl: string;
}> {
  const token = await signMemberQrToken(memberId);
  const dataUrl = await QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: { dark: "#000000", light: "#ffffff" },
  });
  return { token, dataUrl };
}
