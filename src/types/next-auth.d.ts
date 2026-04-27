import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    memberId: string | null;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      memberId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    memberId?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
    memberId?: string | null;
  }
}
