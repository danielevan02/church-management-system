import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { normalizePhone, whatsapp } from "@/lib/whatsapp";

const OTP_TTL_MIN = 5;
const OTP_REQUEST_WINDOW_MIN = 15;
const OTP_REQUEST_LIMIT = 3;
const OTP_MAX_ATTEMPTS = 5;

export type RequestOtpResult =
  | { ok: true }
  | {
      ok: false;
      reason: "PHONE_NOT_FOUND" | "RATE_LIMITED" | "INTERNAL";
    };

export type VerifyOtpResult =
  | {
      ok: true;
      user: {
        id: string;
        email: string | null;
        role: "MEMBER";
        memberId: string;
      };
    }
  | {
      ok: false;
      reason:
        | "INVALID_CODE"
        | "CODE_EXPIRED"
        | "TOO_MANY_ATTEMPTS"
        | "INTERNAL";
    };

function generateNumericCode(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += Math.floor(Math.random() * 10).toString();
  }
  return out;
}

export async function requestOtp(rawPhone: string): Promise<RequestOtpResult> {
  const phone = normalizePhone(rawPhone);

  const member = await prisma.member.findFirst({
    where: { phone, deletedAt: null },
    select: { id: true },
  });
  if (!member) return { ok: false, reason: "PHONE_NOT_FOUND" };

  const since = new Date(Date.now() - OTP_REQUEST_WINDOW_MIN * 60_000);
  const recentCount = await prisma.otpCode.count({
    where: { phone, createdAt: { gte: since } },
  });
  if (recentCount >= OTP_REQUEST_LIMIT) {
    return { ok: false, reason: "RATE_LIMITED" };
  }

  const code = generateNumericCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60_000);

  await prisma.otpCode.create({
    data: { phone, codeHash, purpose: "LOGIN", expiresAt },
  });

  await whatsapp().sendMessage({
    to: phone,
    body: `[ChMS] Kode login Anda: ${code}. Berlaku ${OTP_TTL_MIN} menit. Jangan bagikan kode ini ke siapa pun.`,
  });

  return { ok: true };
}

export async function verifyOtp(
  rawPhone: string,
  code: string,
): Promise<VerifyOtpResult> {
  const phone = normalizePhone(rawPhone);

  const otp = await prisma.otpCode.findFirst({
    where: {
      phone,
      purpose: "LOGIN",
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return { ok: false, reason: "INVALID_CODE" };
  if (otp.expiresAt < new Date()) return { ok: false, reason: "CODE_EXPIRED" };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, reason: "TOO_MANY_ATTEMPTS" };
  }

  const match = await bcrypt.compare(code, otp.codeHash);
  if (!match) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "INVALID_CODE" };
  }

  const member = await prisma.member.findFirst({
    where: { phone, deletedAt: null },
    select: { id: true, email: true },
  });
  if (!member) return { ok: false, reason: "INTERNAL" };

  const user = await prisma.user.upsert({
    where: { phone },
    update: {
      phoneVerified: new Date(),
      lastLoginAt: new Date(),
      memberId: member.id,
    },
    create: {
      phone,
      phoneVerified: new Date(),
      lastLoginAt: new Date(),
      role: "MEMBER",
      memberId: member.id,
      email: member.email,
    },
    select: { id: true, email: true, memberId: true },
  });

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: "MEMBER",
      memberId: user.memberId!,
    },
  };
}
