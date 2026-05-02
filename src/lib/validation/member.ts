import { z } from "zod";

import { normalizePhone } from "@/lib/phone";
import { optionalEnum } from "@/lib/validation/_enum";

const empty = z
  .string()
  .nullish()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

const optionalEmail = z
  .string()
  .nullish()
  .transform((v) => {
    if (v == null || v.trim() === "") return null;
    return v.trim();
  })
  .refine(
    (v) => v == null || z.email().safeParse(v).success,
    { message: "Email tidak valid" },
  );

const requiredPhone = z
  .string()
  .nullish()
  .transform((v) => {
    if (v == null || v.trim() === "") return null;
    return normalizePhone(v);
  })
  .refine((v): v is string => v != null, { message: "Wajib diisi" })
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

const requiredDate = z
  .union([z.string(), z.date()])
  .transform((v) => {
    if (v instanceof Date) return v;
    if (v == null || v === "") return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  })
  .refine((v): v is Date => v instanceof Date, { message: "Wajib diisi" })
  .refine(
    (v) => v == null || (v.getFullYear() >= 1900 && v <= new Date()),
    { message: "Tanggal tidak valid" },
  );

export const memberInputSchema = z.object({
  firstName: z.string().min(1, "Wajib").max(80),
  lastName: empty,
  nickname: empty,
  email: optionalEmail,
  phone: requiredPhone,
  gender: z.enum(["MALE", "FEMALE"]),
  birthDate: requiredDate,
  maritalStatus: optionalEnum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
  status: z
    .enum(["ACTIVE", "INACTIVE", "TRANSFERRED", "DECEASED", "VISITOR"])
    .default("ACTIVE"),
  address: empty,
  city: empty,
  province: empty,
  postalCode: empty,
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
