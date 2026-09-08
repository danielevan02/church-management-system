"use client";

import { useState } from "react";
import {
  AdminAttendanceHubSkeleton,
  AdminAttendanceReportsSkeleton,
  AdminCheckInConsoleSkeleton,
  AdminDashboardSkeleton,
  AdminGivingHubSkeleton,
  AdminMemberDetailSkeleton,
  AdminReportsHubSkeleton,
  AdminSettingsHubSkeleton,
  MemberCheckInSkeleton,
  MemberDashboardSkeleton,
  MemberDiscipleshipSkeleton,
  MemberEventsSkeleton,
  MemberGivingSkeleton,
  MemberQrSkeleton,
} from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";

const PREVIEWS = [
  { id: "member-dash", label: "Member Dashboard", component: MemberDashboardSkeleton },
  { id: "member-qr", label: "Member QR Pass", component: MemberQrSkeleton },
  { id: "member-giving", label: "Member Giving (QRIS)", component: MemberGivingSkeleton },
  { id: "member-checkin", label: "Member Check-in", component: MemberCheckInSkeleton },
  { id: "member-discipleship", label: "Member Discipleship", component: MemberDiscipleshipSkeleton },
  { id: "member-events", label: "Member Events", component: MemberEventsSkeleton },
  { id: "admin-dash", label: "Admin Dashboard", component: AdminDashboardSkeleton },
  { id: "admin-attendance", label: "Admin Attendance Hub", component: AdminAttendanceHubSkeleton },
  { id: "admin-att-rep", label: "Admin Attendance Reports", component: AdminAttendanceReportsSkeleton },
  { id: "admin-checkin", label: "Admin Check-in Console", component: AdminCheckInConsoleSkeleton },
  { id: "admin-giving", label: "Admin Giving Hub", component: AdminGivingHubSkeleton },
  { id: "admin-member-detail", label: "Admin Member Detail", component: AdminMemberDetailSkeleton },
  { id: "admin-reports", label: "Admin Reports Hub", component: AdminReportsHubSkeleton },
  { id: "admin-settings", label: "Admin Settings Hub", component: AdminSettingsHubSkeleton },
] as const;

export function SkeletonPreview() {
  const [selected, setSelected] = useState<string>("member-dash");

  const active = PREVIEWS.find((p) => p.id === selected) ?? PREVIEWS[0];
  const Component = active.component;

  return (
    <section className="flex flex-col gap-6 rounded-3xl bg-surface-container-low p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          1-to-1 Skeleton Parity Inspector
        </span>
        <h2 className="text-2xl font-bold text-on-surface">
          Visual Audit & Preview Skeletons
        </h2>
        <p className="text-sm text-on-surface-variant">
          Pilih skeleton di bawah ini untuk melihat pratinjau langsung dari skeleton loading yang
          identik 1-to-1 dengan tata letak halaman aslinya.
        </p>
      </div>

      {/* Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/30 pb-4">
        {PREVIEWS.map((item) => (
          <Button
            key={item.id}
            variant={selected === item.id ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs"
            onClick={() => setSelected(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Rendered Live Skeleton Container */}
      <div className="rounded-2xl border border-outline-variant/40 bg-surface p-4 sm:p-6 shadow-inner">
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant/20 pb-2 text-xs font-medium text-on-surface-variant">
          <span>Pratinjau: {active.label}</span>
          <span className="inline-flex items-center gap-1 text-primary">
            <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
            Live M3 Pulse Simulation
          </span>
        </div>
        <Component />
      </div>
    </section>
  );
}
