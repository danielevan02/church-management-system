import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "./primitives";

/**
 * High-fidelity skeletons for Member Portal (/me/*) routes.
 * Mirrors actual member UI geometry: Smart Worship Pass, QuickActionGrid,
 * vertical timeline rails, QR cards, and Bento containers.
 */

export function MemberDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      {/* 1. Header with greeting and circular profile avatar button */}
      <header className="flex items-start justify-between gap-3 pt-1">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-36 rounded-full" />
          <Skeleton className="h-8 w-56 sm:w-72 rounded-lg" />
        </div>
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
      </header>

      {/* 2. Smart Worship Pass Ticket Centerpiece */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-low border border-outline-variant/30 p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-7 w-60 sm:w-80 rounded-lg" />
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          </div>
          {/* QR Ticket Box */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-container-high/60 p-3">
              <Skeleton className="h-28 w-28 rounded-xl" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-outline-variant/30 pt-4">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>

      {/* 3. Quick Action Grid (6 circular action tiles) */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center gap-2.5 rounded-3xl bg-surface-container-low p-4 py-5"
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-3 w-14 rounded-full" />
          </div>
        ))}
      </div>

      {/* 4. Devotional Hero Card (M3 Journal Style) */}
      <div className="overflow-hidden rounded-3xl bg-surface-container-low border border-outline-variant/20 p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-3.5 w-32 rounded" />
        </div>
        <div className="my-4 rounded-2xl bg-surface-container-high/50 p-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="mt-2 h-4 w-3/4 rounded" />
        </div>
        <Skeleton className="h-6 w-2/3 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-1/3 rounded" />
        <div className="mt-5 flex items-center justify-between">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </div>

      {/* 5. Asymmetric Bento: Komunitas Sel & Acara/Pemuridan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-surface-container-low p-5 sm:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-3.5 w-56 rounded" />
          </div>
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>

        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-surface-container-low p-5 sm:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-3.5 w-52 rounded" />
          </div>
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function MemberQrSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeaderSkeleton />
      <div className="flex flex-col items-center gap-5 rounded-3xl bg-surface-container-low p-6 sm:p-8">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-3.5 w-64 rounded" />
        </div>
        {/* White QR Quiet Zone Box */}
        <div className="rounded-3xl bg-surface-container-high/60 p-4 shadow-level-1">
          <Skeleton className="h-60 w-60 sm:h-64 sm:w-64 rounded-2xl" />
        </div>
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="h-10 w-44 rounded-full" />
      </div>
    </div>
  );
}

export function MemberGivingSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeaderSkeleton />

      {/* GiveInfoCard: QRIS column + Bank transfer column */}
      <div className="rounded-3xl bg-surface-container-low p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-44 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-72 rounded" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* QRIS Container */}
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-container-high/50 p-6">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-52 w-52 sm:h-60 sm:w-60 rounded-2xl" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>

          {/* Bank Transfer Details */}
          <div className="flex flex-col justify-center gap-4 rounded-2xl bg-surface-container-high/50 p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-24 rounded" />
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-7 w-48 rounded" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-5 w-40 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Note Block */}
      <div className="rounded-3xl bg-surface-container-low p-6 sm:p-8 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-36 rounded" />
        </div>
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
      </div>
    </div>
  );
}

export function MemberCheckInSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeaderSkeleton withAction />

      {/* 1. Buka Sekarang Section */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-3 w-56 rounded" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-2xl bg-surface-container-high p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-3.5 w-64 rounded" />
              </div>
              <Skeleton className="h-9 w-32 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Mendatang Section */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3 w-60 rounded" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl bg-surface-container-high p-4"
            >
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-5 w-44 rounded" />
                <Skeleton className="h-3.5 w-56 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MemberCellGroupSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeaderSkeleton />

      <div className="flex flex-col gap-5 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-72 rounded" />
          </div>
        </div>

        {/* Next Meeting Highlight Card */}
        <div className="rounded-2xl bg-surface-container-high p-4 flex flex-col gap-2 border-l-4 border-primary/40">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-5 w-64 rounded" />
          <Skeleton className="h-3.5 w-48 rounded" />
        </div>

        {/* Leader Profile Card */}
        <div className="flex items-center gap-3 rounded-2xl bg-surface-container-high p-3.5">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>

        {/* Member list preview */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28 rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-surface-container-high/60 p-3"
            >
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-36 rounded" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MemberChildrenSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeaderSkeleton />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6"
          >
            <div className="flex items-center gap-3.5">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-40 rounded" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-48 rounded" />
              </div>
            </div>
            {/* Recent check-in row */}
            <div className="rounded-2xl bg-surface-container-high p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-44 rounded" />
              </div>
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MemberVolunteerSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeaderSkeleton />

      {/* 1. Tugas Mendatang */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3 w-56 rounded" />
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-2xl bg-surface-container-high p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-5 w-48 rounded" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3.5 w-32 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Riwayat Pelayanan */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-5 w-44 rounded" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl bg-surface-container-high p-3.5"
            >
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MemberDiscipleshipSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeaderSkeleton />
      <div className="flex flex-col gap-5 rounded-3xl bg-surface-container-low p-6 sm:p-8">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-3.5 w-64 rounded" />
          </div>
        </div>

        {/* Vertical Journey Timeline Rail */}
        <div className="relative ml-2 flex flex-col gap-6 border-l border-outline-variant/50 pl-6 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative flex flex-col gap-1.5">
              <span className="absolute top-0.5 -left-[31px] flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-highest">
                <Skeleton className="h-3 w-3 rounded-full" />
              </span>
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-3.5 w-72 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MemberEventsSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3.5 w-48 rounded" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MemberPrayerRequestsSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeaderSkeleton withAction />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-3xl bg-surface-container-low p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3">
              <Skeleton className="h-3 w-32 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-16 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MemberProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeaderSkeleton />

      {/* 1. Read-only Member Information Card */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-40 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-5 w-36 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Contact Edit Form */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-36 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
        <Skeleton className="mt-2 h-9 w-32 rounded-full" />
      </div>

      {/* 3. Security PIN Form */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-36 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
        <Skeleton className="mt-2 h-9 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function MemberEventDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeaderSkeleton withAction />

      {/* Details Card */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full shrink-0" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-4 w-44 sm:w-64 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-outline-variant/30 pt-3 flex flex-col gap-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
      </div>

      {/* RSVP Section Card */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-36 rounded" />
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
