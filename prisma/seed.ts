import { PrismaClient, ServiceType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function nextSundayMorning(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntilSunday = (7 - day) % 7 || 7;
  const sunday = new Date(now);
  sunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
  sunday.setUTCHours(2, 0, 0, 0); // 09:00 Asia/Jakarta = 02:00 UTC
  return sunday;
}

async function main() {
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL ?? "admin@example.church";
  const adminPassword =
    process.env.INITIAL_ADMIN_PASSWORD ?? "ChangeMe!123";

  const adminHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      emailVerified: new Date(),
      role: "ADMIN",
      isActive: true,
    },
  });

  // Sample member with phone + PIN — for testing member sign-in.
  const samplePhone = "+628123456789";
  const samplePin = "123456";
  const samplePinHash = await bcrypt.hash(samplePin, 10);
  const sampleMember = await prisma.member.upsert({
    where: { id: "seed-member-budi" },
    update: {},
    create: {
      id: "seed-member-budi",
      firstName: "Budi",
      lastName: "Santoso",
      fullName: "Budi Santoso",
      gender: "MALE",
      phone: samplePhone,
      status: "ACTIVE",
      joinedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { phone: samplePhone },
    update: { pinHash: samplePinHash },
    create: {
      phone: samplePhone,
      pinHash: samplePinHash,
      role: "MEMBER",
      memberId: sampleMember.id,
      isActive: true,
    },
  });

  // Funds
  const funds = [
    { name: "Persembahan Umum", category: "GENERAL" as const },
    { name: "Perpuluhan", category: "TITHE" as const },
    { name: "Misi", category: "MISSIONS" as const },
    { name: "Pembangunan", category: "BUILDING" as const },
    { name: "Diakonia", category: "CHARITY" as const },
    { name: "Syukur", category: "THANKSGIVING" as const },
  ];

  for (const fund of funds) {
    await prisma.fund.upsert({
      where: { id: `seed-fund-${fund.category.toLowerCase()}` },
      update: {},
      create: { id: `seed-fund-${fund.category.toLowerCase()}`, ...fund },
    });
  }

  // Sample upcoming service
  await prisma.service.upsert({
    where: { id: "seed-service-sunday-morning" },
    update: {},
    create: {
      id: "seed-service-sunday-morning",
      name: "Ibadah Minggu Pagi",
      type: ServiceType.SUNDAY_MORNING,
      startsAt: nextSundayMorning(),
      durationMin: 90,
      location: "Gedung Utama",
      isActive: true,
    },
  });

  // Sample child class
  await prisma.childClass.upsert({
    where: { id: "seed-child-class-kecil" },
    update: {},
    create: {
      id: "seed-child-class-kecil",
      name: "Sekolah Minggu Kelas Kecil",
      ageMin: 4,
      ageMax: 7,
      isActive: true,
    },
  });

  console.log("Seed complete:");
  console.log(`  ADMIN:       ${admin.email} / ${adminPassword}`);
  console.log(`  MEMBER:      phone=${samplePhone} (Budi Santoso) / PIN=${samplePin}`);
  console.log(`  Funds:       ${funds.length} entries`);
  console.log(`  Service:     1 upcoming Sunday morning`);
  console.log(`  Child class: 1 (Kelas Kecil)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
