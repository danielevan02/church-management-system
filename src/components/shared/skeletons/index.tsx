import { Skeleton } from "@/components/ui/skeleton";

/**
 * Reusable page-level skeleton primitives. Composed in route-level
 * loading.tsx files to give users immediate visual feedback during
 * navigation while server data is fetched.
 */

export function PageHeaderSkeleton({
  withSubtitle = true,
  withAction = false,
}: {
  withSubtitle?: boolean;
  withAction?: boolean;
}) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          {withSubtitle ? <Skeleton className="h-4 w-64" /> : null}
        </div>
        {withAction ? <Skeleton className="h-9 w-32 shrink-0" /> : null}
      </div>
    </header>
  );
}

export function FilterBarSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-9 flex-1 min-w-[200px]" />
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-32" />
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 8,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex gap-3 border-b pb-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-3 py-1.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-md border p-3"
        >
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({
  lines = 4,
  title = true,
}: {
  lines?: number;
  title?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      {title ? <Skeleton className="h-5 w-32" /> : null}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${100 - i * 8}%` }}
        />
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-md border p-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <div className="mt-2 flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function KpiGridSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: cols }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <KpiGridSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardSkeleton lines={5} />
        <CardSkeleton lines={5} />
      </div>
      <CardSkeleton lines={3} />
    </div>
  );
}

export function DetailSkeleton({ tabs = 4 }: { tabs?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CardSkeleton lines={6} />
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex gap-2 border-b pb-2">
            {Array.from({ length: tabs }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>
          <CardSkeleton lines={5} />
        </div>
      </div>
    </div>
  );
}

export function ListPageSkeleton({
  rows = 8,
  cols = 4,
  filters = 3,
}: {
  rows?: number;
  cols?: number;
  filters?: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction />
      <FilterBarSkeleton items={filters} />
      <TableSkeleton rows={rows} cols={cols} />
    </div>
  );
}

export function FormPageSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <FormSkeleton fields={fields} />
    </div>
  );
}
