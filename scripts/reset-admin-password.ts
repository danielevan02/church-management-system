/**
 * Emergency admin password reset.
 *
 * Use case: ADMIN forgot password and you (the developer/operator) need to
 * reset it from the command line. Requires direct DATABASE_URL access.
 *
 * Usage:
 *   tsx scripts/reset-admin-password.ts --email admin@gereja.id --password "newSecret123"
 *   pnpm admin:reset-password --email admin@gereja.id --password "newSecret123"
 *
 * Will refuse to set a password under 8 chars. Will refuse to act on a user
 * that isn't ADMIN unless --force is passed (so you don't accidentally hijack
 * a member account by typo).
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const HASH_ROUNDS = 10;

type Args = {
  email: string | null;
  password: string | null;
  force: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = { email: null, password: null, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--email" || a === "-e") args.email = argv[++i] ?? null;
    else if (a === "--password" || a === "-p")
      args.password = argv[++i] ?? null;
    else if (a === "--force") args.force = true;
  }
  return args;
}

function usage(message?: string): never {
  if (message) console.error(`Error: ${message}\n`);
  console.error(
    "Usage: tsx scripts/reset-admin-password.ts --email <email> --password <new-password> [--force]\n",
  );
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.email) usage("--email is required");
  if (!args.password) usage("--password is required");
  if (args.password!.length < 8) usage("password must be at least 8 chars");

  const prisma = new PrismaClient();
  try {
    const email = args.email!.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) usage(`No user found with email ${email}`);
    if (user!.role !== "ADMIN" && !args.force) {
      usage(
        `User ${email} has role ${user!.role}, not ADMIN. Pass --force to override.`,
      );
    }

    const passwordHash = await bcrypt.hash(args.password!, HASH_ROUNDS);
    await prisma.user.update({
      where: { id: user!.id },
      data: { passwordHash, isActive: true },
    });

    console.log(
      `✓ Password reset for ${email} (role=${user!.role}). Account also reactivated if previously disabled.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
