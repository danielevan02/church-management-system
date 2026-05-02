import { z } from "zod";

import { normalizePhone } from "@/lib/phone";
import { optionalEnum } from "@/lib/validation/_enum";

const empty = z
  .string()
  .nullish()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

const optionalPhone = z
  .string()
  .nullish()
  .transform((v) => {
    if (v == null || v.trim() === "") return null;
    return normalizePhone(v);
  })
  .refine(
    (v) => v == null || /^\+[1-9]\d{6,14}$/.test(v),
    { message: "Nomor telepon tidak valid" },
  );

export const ownProfileSchema = z.object({
  phone: optionalPhone,
  address: empty,
  city: empty,
  province: empty,
  postalCode: empty,
  maritalStatus: optionalEnum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
});

export type OwnProfileInput = z.input<typeof ownProfileSchema>;
