import { NextResponse, type NextRequest } from "next/server";
import * as XLSX from "xlsx";

import { auth } from "@/lib/auth";
import { formatJakarta } from "@/lib/datetime";
import { hasAtLeastRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

import type { Prisma, ServiceType } from "@prisma/client";

const SERVICE_TYPE_VALUES: readonly ServiceType[] = [
  "SUNDAY_MORNING",
  "SUNDAY_EVENING",
  "MIDWEEK",
  "YOUTH",
  "CHILDREN",
  "SPECIAL",
  "OTHER",
];

const HEADERS = [
  "Tanggal Diterima",
  "Ibadah",
  "Jenis Ibadah",
  "Tanggal Ibadah",
  "Pos",
  "Kategori Pos",
  "Jumlah (Rp)",
  "Catatan",
  "Dicatat Oleh",
  "Dicatat Pada",
] as const;

function parseServiceType(v: string | null): ServiceType | undefined {
  return v && (SERVICE_TYPE_VALUES as readonly string[]).includes(v)
    ? (v as ServiceType)
    : undefined;
}

function parseDate(v: string | null): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function escapeCsv(value: string | number | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

type Row = {
  receivedAt: string;
  serviceName: string;
  serviceType: string;
  serviceStartsAt: string;
  fundName: string;
  fundCategory: string;
  amount: number;
  notes: string;
  recordedBy: string;
  recordedAt: string;
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasAtLeastRole(session.user.role, "STAFF")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const format = sp.get("format") === "xlsx" ? "xlsx" : "csv";
  const fundId = sp.get("fundId") ?? undefined;
  const serviceType = parseServiceType(sp.get("serviceType"));
  const from = parseDate(sp.get("from"));
  const to = parseDate(sp.get("to"));

  const where: Prisma.GivingEntryWhereInput = {};
  if (fundId) where.fundId = fundId;
  if (serviceType) where.service = { type: serviceType };
  if (from || to) {
    where.receivedAt = {};
    if (from) where.receivedAt.gte = from;
    if (to) where.receivedAt.lte = to;
  }

  const entries = await prisma.givingEntry.findMany({
    where,
    orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }],
    select: {
      receivedAt: true,
      amount: true,
      notes: true,
      recordedBy: true,
      createdAt: true,
      fund: { select: { name: true, category: true } },
      service: { select: { name: true, type: true, startsAt: true } },
    },
  });

  const rows: Row[] = entries.map((e) => ({
    receivedAt: formatJakarta(e.receivedAt, "yyyy-MM-dd"),
    serviceName: e.service?.name ?? "Tanpa ibadah",
    serviceType: e.service?.type ?? "",
    serviceStartsAt: e.service
      ? formatJakarta(e.service.startsAt, "yyyy-MM-dd HH:mm")
      : "",
    fundName: e.fund.name,
    fundCategory: e.fund.category,
    amount: Number(e.amount.toString()),
    notes: e.notes ?? "",
    recordedBy: e.recordedBy ?? "",
    recordedAt: formatJakarta(e.createdAt, "yyyy-MM-dd HH:mm"),
  }));

  const totalAmount = rows.reduce((sum, r) => sum + r.amount, 0);

  const ymd = (d: Date) => formatJakarta(d, "yyyy-MM-dd");
  const baseFilename =
    from && to
      ? `persembahan_${ymd(from)}_sd_${ymd(to)}`
      : from
        ? `persembahan_sejak_${ymd(from)}`
        : to
          ? `persembahan_sampai_${ymd(to)}`
          : `persembahan_${ymd(new Date())}`;

  if (format === "xlsx") {
    const sheetData: (string | number)[][] = [
      [...HEADERS],
      ...rows.map((r) => [
        r.receivedAt,
        r.serviceName,
        r.serviceType,
        r.serviceStartsAt,
        r.fundName,
        r.fundCategory,
        r.amount,
        r.notes,
        r.recordedBy,
        r.recordedAt,
      ]),
      ["", "", "", "", "", "TOTAL", totalAmount, "", "", ""],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    // Auto-width based on header length + a little padding for amount column.
    ws["!cols"] = [
      { wch: 14 }, // tanggal diterima
      { wch: 28 }, // ibadah
      { wch: 16 }, // jenis ibadah
      { wch: 18 }, // tanggal ibadah
      { wch: 22 }, // pos
      { wch: 14 }, // kategori
      { wch: 16 }, // jumlah
      { wch: 30 }, // catatan
      { wch: 22 }, // dicatat oleh
      { wch: 18 }, // dicatat pada
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Persembahan");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${baseFilename}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // CSV with UTF-8 BOM so Excel opens it correctly.
  const csv =
    "﻿" +
    [
      HEADERS.map(escapeCsv).join(","),
      ...rows.map((r) =>
        [
          r.receivedAt,
          r.serviceName,
          r.serviceType,
          r.serviceStartsAt,
          r.fundName,
          r.fundCategory,
          r.amount,
          r.notes,
          r.recordedBy,
          r.recordedAt,
        ]
          .map(escapeCsv)
          .join(","),
      ),
      ["", "", "", "", "", "TOTAL", totalAmount, "", "", ""]
        .map(escapeCsv)
        .join(","),
    ].join("\r\n") +
    "\r\n";

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${baseFilename}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
