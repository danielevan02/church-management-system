import { z } from "zod";

import { normalizePhone } from "@/lib/phone";

const empty = z
  .string()
  .optional()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

const optionalEmail = z
  .string()
  .optional()
  .transform((v) => {
    if (v == null || v.trim() === "") return null;
    return v.trim();
  })
  .refine(
    (v) => v == null || z.email().safeParse(v).success,
    { message: "Email tidak valid" },
  );

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

const optionalDate = z
  .union([z.string(), z.date(), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === "") return null;
    if (v instanceof Date) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  })
  .refine(
    (v) => v == null || (v.getFullYear() >= 1900 && v <= new Date()),
    { message: "Tanggal tidak valid" },
  );

export const memberInputSchema = z.object({
  firstName: z.string().min(1, "Wajib").max(80),
  lastName: empty,
  nickname: empty,
  email: optionalEmail,
  phone: optionalPhone,
  gender: z.enum(["MALE", "FEMALE"]),
  birthDate: optionalDate,
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  status: z
    .enum(["ACTIVE", "INACTIVE", "TRANSFERRED", "DECEASED", "VISITOR"])
    .default("ACTIVE"),
  address: empty,
  city: empty,
  province: empty,
  postalCode: empty,
  country: empty,
  baptismDate: optionalDate,
  baptismChurch: empty,
  joinedAt: optionalDate,
  notes: empty,
});

export type MemberInput = z.input<typeof memberInputSchema>;
export type MemberData = z.output<typeof memberInputSchema>;

export function buildFullName(firstName: string, lastName: string | null): string {
  return [firstName.trim(), lastName?.trim() ?? null]
    .filter((s): s is string => Boolean(s))
    .join(" ");
}
