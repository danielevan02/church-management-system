import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    username?: string | null;
    role: Role;
    memberId: string | null;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username: string | null;
      role: Role;
      memberId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string | null;
    role?: Role;
    memberId?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    username?: string | null;
    role?: Role;
    memberId?: string | null;
  }
}
