import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Reusable page-level skeleton primitives matching the M3 Design System.
 * Ensures consistent geometry, padding, and elevation tokens to eliminate CLS.
 */

export function PageHeaderSkeleton({
  withSubtitle = true,
  withAction = false,
  withLeading = false,
  actionCount = 1,
}: {
  withSubtitle?: boolean;
  withAction?: boolean;
  withLeading?: boolean;
  actionCount?: number;
}) {
  return (
    <header className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <div className="flex items-start gap-3">
        {withLeading ? (
          <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
        ) : null}
        <div className="flex flex-col gap-2">
          {/* Eyebrow */}
          <Skeleton className="h-3 w-28 rounded-full" />
          {/* Page title */}
          <Skeleton className="h-8 w-56 sm:w-72 rounded-lg" />
          {withSubtitle ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-48 sm:w-80 rounded-md" />
            </div>
          ) : null}
        </div>
      </div>
      {withAction ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {Array.from({ length: actionCount }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-10 w-28 sm:w-32 shrink-0 rounded-full"
            />
          ))}
        </div>
      ) : null}
    </header>
  );
}

export function FilterBarSkeleton({
  hasSearch = true,
  selectCount = 3,
}: {
  hasSearch?: boolean;
  selectCount?: number;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-surface-container-high p-3 lg:flex-row lg:items-center">
      {hasSearch ? (
        <div className="flex flex-1 items-center gap-2">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-20 shrink-0 rounded-md" />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: selectCount }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-9 w-28 sm:w-36 shrink-0 rounded-md"
          />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 8,
  cols = 5,
  withAvatar = true,
}: {
  rows?: number;
  cols?: number;
  withAvatar?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface-container-low overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">
              <Skeleton className="h-4 w-24" />
            </TableHead>
            {Array.from({ length: Math.max(1, cols - 2) }).map((_, i) => (
              <TableHead key={i} className="hidden sm:table-cell">
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
            <TableHead className="text-right">
              <Skeleton className="ml-auto h-4 w-16" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {withAvatar ? (
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  ) : null}
                  <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                    <Skeleton className="h-4 w-32 sm:w-44" />
                    <Skeleton className="h-3 w-20 sm:w-28" />
                  </div>
                </div>
              </TableCell>
              {Array.from({ length: Math.max(1, cols - 2) }).map((_, c) => (
                <TableCell key={c} className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              ))}
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-6 w-16 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-2xl p-3 bg-surface-container-high"
        >
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-7 w-16 rounded-full" />
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
    <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6">
      {title ? <Skeleton className="h-5 w-36 rounded-md" /> : null}
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4 rounded"
            style={{ width: `${Math.max(40, 100 - i * 12)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-surface-container-low p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Skeleton className="h-10 w-32 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-surface-container-low p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded" />
        <Skeleton className="h-5 w-5 rounded-md" />
      </div>
      <Skeleton className="h-8 w-28 rounded" />
      <Skeleton className="h-3 w-36 rounded" />
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

export function ListPageSkeleton({
  rows = 8,
  cols = 5,
  filters = 3,
  withAction = true,
}: {
  rows?: number;
  cols?: number;
  filters?: number;
  withAction?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withAction={withAction} />
      <FilterBarSkeleton selectCount={filters} />
      <TableSkeleton rows={rows} cols={cols} />
    </div>
  );
}

export function FormPageSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton withSubtitle={false} />
      <FormSkeleton fields={fields} />
    </div>
  );
}
