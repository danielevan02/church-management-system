import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { authConfig } from "@/lib/auth.config";
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH, signInWithPin } from "@/lib/pin";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1),
});

const pinSchema = z.object({
  phone: z.string().min(1),
  pin: z.string().regex(new RegExp(`^\\d{${PIN_MIN_LENGTH},${PIN_MAX_LENGTH}}$`)),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      id: "credentials",
      name: "Username & password",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const username = parsed.data.username.toLowerCase();
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user?.passwordHash || !user.isActive) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          username: user.username,
          role: user.role,
          memberId: user.memberId,
        };
      },
    }),
    Credentials({
      id: "pin",
      name: "Phone & PIN",
      credentials: {
        phone: { label: "Phone", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(raw) {
        const parsed = pinSchema.safeParse(raw);
        if (!parsed.success) return null;

        const result = await signInWithPin(parsed.data.phone, parsed.data.pin);
        if (!result.ok) return null;

        return {
          id: result.user.id,
          username: result.user.username,
          role: result.user.role,
          memberId: result.user.memberId,
        };
      },
    }),
  ],
});
