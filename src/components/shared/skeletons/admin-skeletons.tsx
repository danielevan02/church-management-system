import { Skeleton } from "@/components/ui/skeleton";
import {
  CardSkeleton,
  KpiGridSkeleton,
  PageHeaderSkeleton,
  StatCardSkeleton,
  TableSkeleton,
} from "./primitives";

/**
 * High-fidelity skeletons for Admin Portal (/admin/*) routes.
 * Accurately mirrors real admin pages: KPI strips, BlockSections,
 * analytical charts, check-in kiosk console, and tabbed detail layouts.
 */

/* ==========================================================================
   Admin Hub Skeletons
   ========================================================================== */

export function AdminDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />

      {/* 4 KPI Metric Tiles */}
      <KpiGridSkeleton cols={4} />

      {/* Today + Attention (2 large BlockSection columns) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Column: Hari Ini & Mendatang */}
        <div className="flex flex-col gap-5 rounded-3xl bg-surface-container-low p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-44 rounded" />
              <Skeleton className="h-3 w-60 rounded" />
            </div>
          </div>
          {/* Services Subsection */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl bg-surface-container-high p-3.5"
              >
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            ))}
          </div>
          {/* Events Subsection */}
          <div className="flex flex-col gap-2.5 pt-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl bg-surface-container-high p-3.5"
              >
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-3 w-36 rounded" />
                </div>
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Perlu Perhatian */}
        <div className="flex flex-col gap-5 rounded-3xl bg-surface-container-low p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-3 w-52 rounded" />
            </div>
          </div>
          {/* Follow-ups */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl bg-surface-container-high p-3.5"
              >
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-44 rounded" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
          {/* Prayer Requests */}
          <div className="flex flex-col gap-2.5 pt-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl bg-surface-container-high p-3.5"
              >
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-44 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-container-low p-4"
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAttendanceHubSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction actionCount={3} />

      {/* 2 column grid: Buka Sekarang & Ibadah Mendatang */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Buka Sekarang */}
        <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-3.5 w-60 rounded" />
          </div>
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl bg-surface-container-high p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-5 w-44 rounded" />
                  <Skeleton className="h-3.5 w-56 rounded" />
                </div>
                <Skeleton className="h-9 w-32 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Ibadah Mendatang */}
        <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3.5 w-64 rounded" />
          </div>
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl bg-surface-container-high p-4"
              >
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-5 w-48 rounded" />
                  <Skeleton className="h-3.5 w-60 rounded" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminCheckInConsoleSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction />

      {/* 1. Kiosk Scanner & Search Container */}
      <div className="flex flex-col gap-5 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
        {/* Camera Scanner Viewport */}
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-container-high p-8 sm:p-12">
          <Skeleton className="h-48 w-48 sm:h-56 sm:w-56 rounded-2xl" />
          <Skeleton className="h-3.5 w-64 rounded" />
        </div>
      </div>

      {/* 2. Catatan Baru Ini List */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-36 rounded" />
          <Skeleton className="h-3.5 w-56 rounded" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl bg-surface-container-high p-3"
            >
              <Skeleton className="h-5 w-5 rounded-full shrink-0" />
              <div className="flex flex-1 flex-col gap-1">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-48 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminAttendanceReportsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />

      {/* Weekly Trend Chart Card */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-44 rounded" />
          <Skeleton className="h-3.5 w-64 rounded" />
        </div>
        <div className="h-56 w-full rounded-2xl bg-surface-container-high/60 flex items-end justify-between p-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full rounded-t"
              style={{ height: `${20 + ((i * 17) % 70)}%` }}
            />
          ))}
        </div>
      </div>

      {/* 2 Column: Recent Services + Inactive Members */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
          <Skeleton className="h-5 w-36 rounded" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl bg-surface-container-high p-3"
              >
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
                <Skeleton className="h-6 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
          <Skeleton className="h-5 w-44 rounded" />
          <TableSkeleton rows={4} cols={3} withAvatar={false} />
        </div>
      </div>
    </div>
  );
}

export function AdminGivingHubSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction actionCount={4} />

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-lg bg-surface-container-high p-3 sm:flex-row sm:items-center">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Week BlockSections */}
      <div className="flex flex-col gap-5">
        {Array.from({ length: 2 }).map((_, w) => (
          <div
            key={w}
            className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-48 rounded" />
              </div>
              <Skeleton className="h-6 w-32 rounded" />
            </div>
            {/* Service groups */}
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, s) => (
                <div
                  key={s}
                  className="flex flex-col gap-2 rounded-2xl bg-surface-container-high p-3.5"
                >
                  <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                    <Skeleton className="h-4 w-36 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminGivingReportsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />

      {/* Monthly Chart Card */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <Skeleton className="h-5 w-48 rounded" />
        <div className="h-56 w-full rounded-2xl bg-surface-container-high/60 flex items-end justify-between p-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full rounded-t"
              style={{ height: `${30 + ((i * 23) % 60)}%` }}
            />
          ))}
        </div>
      </div>

      {/* Fund Breakdowns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function AdminVolunteersHubSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction actionCount={2} />

      {/* Quarter Navigation Bar */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Weekly Scheduling Cards */}
      <div className="flex flex-col gap-6">
        {Array.from({ length: 2 }).map((_, w) => (
          <div
            key={w}
            className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-56 rounded" />
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            {/* Team Roles & Slots */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, t) => (
                <div
                  key={t}
                  className="flex flex-col gap-2 rounded-2xl bg-surface-container-high p-3.5"
                >
                  <Skeleton className="h-4 w-28 rounded" />
                  <div className="flex items-center gap-2 pt-1">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminChildrenHubSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />

      {/* 2 Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-2xl bg-secondary-container/60 p-3.5">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
        <div className="flex flex-col gap-1 rounded-2xl bg-surface-container-high p-3.5">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </div>

      {/* 3 Navigation Section Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6"
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-3.5 w-full rounded" />
            </div>
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminReportsHubSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />

      {/* 1. Membership Section */}
      <div className="flex flex-col gap-5 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-44 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-1 rounded-2xl bg-surface-container-high p-3"
            >
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-16 rounded" />
            </div>
          ))}
        </div>
        <div className="h-44 w-full rounded-2xl bg-surface-container-high/60" />
      </div>

      {/* 2. Attendance & Giving Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
          <Skeleton className="h-5 w-36 rounded" />
          <div className="h-40 w-full rounded-2xl bg-surface-container-high/60" />
        </div>
        <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
          <Skeleton className="h-5 w-36 rounded" />
          <div className="h-40 w-full rounded-2xl bg-surface-container-high/60" />
        </div>
      </div>
    </div>
  );
}

export function AdminSettingsHubSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />

      {/* Sub-section Links */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-3xl bg-surface-container-low p-5"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
            </div>
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        ))}
      </div>

      {/* Church Identity Block */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-36 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-4 w-44 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Operational Settings Form */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-44 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
        <Skeleton className="mt-2 h-9 w-32 rounded-full" />
      </div>
    </div>
  );
}

export function AdminHelpSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />

      {/* Quick Start Steps */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <Skeleton className="h-5 w-36 rounded" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-2xl bg-surface-container-high p-3"
            >
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 13 Module Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-4"
          >
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   Admin Detail Skeletons
   ========================================================================== */

export function AdminMemberDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header with Avatar Leading + Badges + Edit/Delete Actions */}
      <PageHeaderSkeleton withLeading withAction actionCount={2} />

      {/* 6 Tabs Triggers */}
      <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/30 pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 sm:w-28 rounded-full" />
        ))}
      </div>

      {/* 2-column Fieldset Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, c) => (
          <div
            key={c}
            className="flex flex-col gap-3 rounded-3xl bg-surface-container-low p-5 sm:p-6"
          >
            <Skeleton className="h-5 w-32 rounded" />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, f) => (
                <div key={f} className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminHouseholdDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction actionCount={2} />

      {/* Members Table Card */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
        <TableSkeleton rows={4} cols={4} withAvatar={false} />
      </div>
    </div>
  );
}

export function AdminServiceDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction actionCount={3} />

      {/* 3 Stat Cards (Total, Members, Visitors) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Attendance Roster Table Card */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <Skeleton className="h-5 w-44 rounded" />
        <TableSkeleton rows={6} cols={4} />
      </div>
    </div>
  );
}

export function AdminEventDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction actionCount={3} />

      {/* Description Card */}
      <CardSkeleton lines={2} title={false} />

      {/* 4 RSVP Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* RSVP Table Card */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <Skeleton className="h-5 w-36 rounded" />
        <TableSkeleton rows={5} cols={4} />
      </div>
    </div>
  );
}

export function AdminCellGroupDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction actionCount={2} />

      {/* 2-col top: Next Meeting card (col-span-2) + Leader card (col-span-1) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-3xl bg-surface-container-low p-5 sm:p-6 lg:col-span-2">
          <Skeleton className="h-5 w-44 rounded" />
          <div className="rounded-2xl bg-surface-container-high p-4 flex flex-col gap-1.5">
            <Skeleton className="h-5 w-56 rounded" />
            <Skeleton className="h-3.5 w-40 rounded" />
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-3xl bg-surface-container-low p-5 sm:p-6">
          <Skeleton className="h-5 w-28 rounded" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list + table */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <TableSkeleton rows={5} cols={4} />
    </div>
  );
}

export function AdminGivingDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction actionCount={2} />

      {/* Detail Fields Card */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <Skeleton className="h-5 w-28 rounded" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-4 w-44 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminVolunteerTeamDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction actionCount={2} />

      {/* Positions Section */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <Skeleton className="h-5 w-36 rounded" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-32 rounded-full" />
          ))}
        </div>
      </div>

      {/* Assignments Section */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <Skeleton className="h-5 w-44 rounded" />
        <TableSkeleton rows={4} cols={4} />
      </div>
    </div>
  );
}

export function AdminPrayerRequestDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Request Body */}
        <div className="flex flex-col gap-3 rounded-3xl bg-surface-container-low p-5 sm:p-6 lg:col-span-2">
          <Skeleton className="h-5 w-36 rounded" />
          <div className="flex flex-col gap-2 pt-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </div>

        {/* Right: Meta & Actions */}
        <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
          <Skeleton className="h-5 w-24 rounded" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}
