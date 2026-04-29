import { z } from "zod";

import { normalizePhone } from "@/lib/phone";

const empty = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

const optionalPhone = z
  .string()
  .optional()
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
  country: empty,
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
    .nullable()
    .optional()
    .transform((v) => v ?? null),
});

export type OwnProfileInput = z.input<typeof ownProfileSchema>;
