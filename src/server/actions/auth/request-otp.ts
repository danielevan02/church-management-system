"use server";

import { z } from "zod";

import { requestOtp } from "@/lib/otp";
import { normalizePhone } from "@/lib/whatsapp";

const schema = z.object({
  phone: z.string().min(6).max(20),
});

export type RequestOtpState =
  | null
  | {
      ok: true;
      phone: string;
    }
  | {
      ok: false;
      error: "phoneNotFound" | "rateLimited" | "internal";
    };

export async function requestOtpAction(
  _prev: RequestOtpState,
  formData: FormData,
): Promise<RequestOtpState> {
  const parsed = schema.safeParse({ phone: formData.get("phone") });
  if (!parsed.success) return { ok: false, error: "internal" };

  const result = await requestOtp(parsed.data.phone);
  if (!result.ok) {
    switch (result.reason) {
      case "PHONE_NOT_FOUND":
        return { ok: false, error: "phoneNotFound" };
      case "RATE_LIMITED":
        return { ok: false, error: "rateLimited" };
      default:
        return { ok: false, error: "internal" };
    }
  }

  return { ok: true, phone: normalizePhone(parsed.data.phone) };
}
