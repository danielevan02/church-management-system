import { z } from "zod";

const empty = z
  .string()
  .nullish()
  .transform((v) => (v == null || v.trim() === "" ? null : v.trim()));

export const roleEnum = z.enum([
  "ADMIN",
  "STAFF",
  "LEADER",
  "MEMBER",
]);

export type RoleInput = z.infer<typeof roleEnum>;

export const userCreateSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Minimal 3 karakter")
    .max(60, "Maksimal 60 karakter")
    .regex(/^[a-z0-9._-]+$/i, "Hanya huruf, angka, titik, garis bawah, atau strip")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(8, "Minimal 8 karakter"),
  role: roleEnum,
  memberId: empty,
});

export type UserCreateInput = z.input<typeof userCreateSchema>;

export const userEditSchema = z.object({
  role: roleEnum,
  isActive: z.boolean(),
  memberId: empty,
});

export type UserEditInput = z.input<typeof userEditSchema>;

export const passwordResetSchema = z.object({
  password: z.string().min(8, "Minimal 8 karakter"),
});

export type PasswordResetInput = z.input<typeof passwordResetSchema>;
