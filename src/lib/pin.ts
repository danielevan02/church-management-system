import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";

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

/**
 * Format check only — digits only, length 4–6. Doesn't compare against any
 * stored PIN. Use to guard inputs before calling `hashPin` or `signInWithPin`.
 */
export function isValidPinFormat(pin: string): boolean {
  return /^\d+$/.test(pin) && pin.length >= PIN_MIN_LENGTH && pin.length <= PIN_MAX_LENGTH;
}

/** bcrypt-hash a PIN at cost 10. Stored on User.pinHash. */
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

/**
 * Find any other user on the same phone whose PIN matches `pin`. Used to
 * prevent two accounts on the same phone from sharing a PIN — sign-in
 * relies on (phone + PIN) uniquely identifying an account.
 *
 * `excludeUserId` skips the user being updated (so reusing your own PIN
 * isn't flagged as a collision).
 */
async function findPinCollision(
  phone: string,
  pin: string,
  excludeUserId?: string,
): Promise<boolean> {
  const others = await prisma.user.findMany({
    where: {
      phone,
      pinHash: { not: null },
      ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
    },
    select: { pinHash: true },
  });
  for (const other of others) {
    if (other.pinHash && (await bcrypt.compare(pin, other.pinHash))) {
      return true;
    }
  }
  return false;
}

/**
 * Verify phone + PIN and produce a session-ready user payload.
 *
 * Multiple users may share a phone (e.g. elderly member uses their child's
 * HP). The PIN disambiguates: we iterate users at this phone and pick the
 * one whose stored hash matches.
 *
 * Throttling (lenient — designed for elderly users): after 10 failed attempts
 * within 15 minutes for the same phone, the next failed verify returns
 * THROTTLED with a 30-second `retryAfterS`. There is NO permanent lockout.
 *
 * Possible failure reasons:
 * - INVALID_CREDENTIALS: phone unknown, no user matches the PIN, or
 *   the matching member is soft-deleted.
 * - NO_PIN_SET: at least one user exists at this phone but none has a
 *   PIN configured yet.
 * - ACCOUNT_INACTIVE: the matched user has `isActive = false`.
 * - THROTTLED: too many recent failures, see retryAfterS.
 */
export async function signInWithPin(
  rawPhone: string,
  pin: string,
): Promise<SignInPinResult> {
  const phone = normalizePhone(rawPhone);

  const throttle = await checkThrottle(phone);
  if (throttle.throttled) {
    return { ok: false, reason: "THROTTLED", retryAfterS: throttle.retryAfterS };
  }

  const users = await prisma.user.findMany({
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

  if (users.length === 0) {
    await recordFailure(phone);
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }

  const usersWithPin = users.filter((u) => u.pinHash != null);
  if (usersWithPin.length === 0) {
    return { ok: false, reason: "NO_PIN_SET" };
  }

  let matched: (typeof users)[number] | null = null;
  for (const u of usersWithPin) {
    if (!u.member || u.member.deletedAt || !u.memberId || !u.pinHash) continue;
    if (await bcrypt.compare(pin, u.pinHash)) {
      matched = u;
      break;
    }
  }

  if (!matched || !matched.memberId) {
    await recordFailure(phone);
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }
  if (!matched.isActive) {
    return { ok: false, reason: "ACCOUNT_INACTIVE" };
  }

  await prisma.user.update({
    where: { id: matched.id },
    data: { lastLoginAt: new Date(), phoneVerified: new Date() },
  });

  return {
    ok: true,
    user: {
      id: matched.id,
      email: matched.email,
      role: "MEMBER",
      memberId: matched.memberId,
    },
  };
}

/**
 * Set or replace a member's login PIN. If the User account doesn't exist yet,
 * create it linked to the given member. Caller must enforce authorization.
 *
 * Returns PIN_COLLISION when another user on the same phone already has
 * the chosen PIN — would create ambiguous sign-in. Caller should ask the
 * admin to pick a different PIN for this member.
 */
export async function setMemberPin(
  memberId: string,
  pin: string,
): Promise<
  | { ok: true }
  | { ok: false; reason: "NO_PHONE" | "PIN_COLLISION" | "INTERNAL" }
> {
  if (!isValidPinFormat(pin)) return { ok: false, reason: "INTERNAL" };

  const member = await prisma.member.findFirst({
    where: { id: memberId, deletedAt: null },
    select: { id: true, phone: true, email: true },
  });
  if (!member) return { ok: false, reason: "INTERNAL" };
  if (!member.phone) return { ok: false, reason: "NO_PHONE" };

  const phone = normalizePhone(member.phone);

  const existing = await prisma.user.findUnique({
    where: { memberId: member.id },
    select: { id: true },
  });

  if (await findPinCollision(phone, pin, existing?.id)) {
    return { ok: false, reason: "PIN_COLLISION" };
  }

  const pinHash = await hashPin(pin);

  await prisma.user.upsert({
    where: { memberId: member.id },
    update: { pinHash, phone },
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
 *
 * Returns PIN_COLLISION when another user on the same phone already uses
 * the new PIN.
 */
export async function changeOwnPin(
  userId: string,
  currentPin: string,
  newPin: string,
): Promise<
  | { ok: true }
  | { ok: false; reason: "INVALID_CURRENT" | "PIN_COLLISION" | "INTERNAL" }
> {
  if (!isValidPinFormat(newPin)) return { ok: false, reason: "INTERNAL" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pinHash: true, phone: true },
  });
  if (!user?.pinHash) return { ok: false, reason: "INVALID_CURRENT" };

  const match = await bcrypt.compare(currentPin, user.pinHash);
  if (!match) return { ok: false, reason: "INVALID_CURRENT" };

  if (user.phone && (await findPinCollision(user.phone, newPin, userId))) {
    return { ok: false, reason: "PIN_COLLISION" };
  }

  const pinHash = await hashPin(newPin);
  await prisma.user.update({
    where: { id: userId },
    data: { pinHash },
  });
  return { ok: true };
}
