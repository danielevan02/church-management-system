import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/whatsapp";

export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 6;

const FAILS_BEFORE_THROTTLE = 10;
const THROTTLE_DELAY_S = 30;
const ATTEMPT_WINDOW_MIN = 15;

export type SignInPinResult =
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
        | "INVALID_CREDENTIALS"
        | "NO_PIN_SET"
        | "ACCOUNT_INACTIVE"
        | "THROTTLED"
        | "INTERNAL";
      retryAfterS?: number;
    };

export function isValidPinFormat(pin: string): boolean {
  return /^\d+$/.test(pin) && pin.length >= PIN_MIN_LENGTH && pin.length <= PIN_MAX_LENGTH;
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

async function checkThrottle(
  phone: string,
): Promise<{ throttled: false } | { throttled: true; retryAfterS: number }> {
  const since = new Date(Date.now() - ATTEMPT_WINDOW_MIN * 60_000);
  const fails = await prisma.pinAttempt.findMany({
    where: { phone, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: FAILS_BEFORE_THROTTLE,
    select: { createdAt: true },
  });

  if (fails.length < FAILS_BEFORE_THROTTLE) return { throttled: false };

  const sinceLastFailMs = Date.now() - fails[0].createdAt.getTime();
  const sinceLastFailS = sinceLastFailMs / 1000;
  if (sinceLastFailS < THROTTLE_DELAY_S) {
    return {
      throttled: true,
      retryAfterS: Math.ceil(THROTTLE_DELAY_S - sinceLastFailS),
    };
  }
  return { throttled: false };
}

async function recordFailure(phone: string): Promise<void> {
  await prisma.pinAttempt.create({ data: { phone } });
}

export async function signInWithPin(
  rawPhone: string,
  pin: string,
): Promise<SignInPinResult> {
  const phone = normalizePhone(rawPhone);

  const throttle = await checkThrottle(phone);
  if (throttle.throttled) {
    return { ok: false, reason: "THROTTLED", retryAfterS: throttle.retryAfterS };
  }

  const user = await prisma.user.findUnique({
    where: { phone },
    select: {
      id: true,
      email: true,
      pinHash: true,
      isActive: true,
      memberId: true,
      role: true,
      member: { select: { deletedAt: true } },
    },
  });

  if (!user || !user.member || user.member.deletedAt || !user.memberId) {
    await recordFailure(phone);
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }
  if (!user.isActive) {
    return { ok: false, reason: "ACCOUNT_INACTIVE" };
  }
  if (!user.pinHash) {
    return { ok: false, reason: "NO_PIN_SET" };
  }

  const match = await bcrypt.compare(pin, user.pinHash);
  if (!match) {
    await recordFailure(phone);
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), phoneVerified: new Date() },
  });

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: "MEMBER",
      memberId: user.memberId,
    },
  };
}

/**
 * Set or replace a member's login PIN. If the User account doesn't exist yet,
 * create it linked to the given member. Caller must enforce authorization.
 */
export async function setMemberPin(
  memberId: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; reason: "NO_PHONE" | "INTERNAL" }> {
  if (!isValidPinFormat(pin)) return { ok: false, reason: "INTERNAL" };

  const member = await prisma.member.findFirst({
    where: { id: memberId, deletedAt: null },
    select: { id: true, phone: true, email: true },
  });
  if (!member) return { ok: false, reason: "INTERNAL" };
  if (!member.phone) return { ok: false, reason: "NO_PHONE" };

  const phone = normalizePhone(member.phone);
  const pinHash = await hashPin(pin);

  await prisma.user.upsert({
    where: { phone },
    update: { pinHash, memberId: member.id },
    create: {
      phone,
      pinHash,
      role: "MEMBER",
      memberId: member.id,
      email: member.email,
    },
  });

  return { ok: true };
}

/**
 * Verify a current PIN and replace it with a new one. Used when a logged-in
 * member changes their own PIN.
 */
export async function changeOwnPin(
  userId: string,
  currentPin: string,
  newPin: string,
): Promise<{ ok: true } | { ok: false; reason: "INVALID_CURRENT" | "INTERNAL" }> {
  if (!isValidPinFormat(newPin)) return { ok: false, reason: "INTERNAL" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pinHash: true },
  });
  if (!user?.pinHash) return { ok: false, reason: "INVALID_CURRENT" };

  const match = await bcrypt.compare(currentPin, user.pinHash);
  if (!match) return { ok: false, reason: "INVALID_CURRENT" };

  const pinHash = await hashPin(newPin);
  await prisma.user.update({
    where: { id: userId },
    data: { pinHash },
  });
  return { ok: true };
}
