import "server-only";

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Normalize page/pageSize to safe values + derive Prisma skip/take. */
export function clampPage(
  opts: PaginationInput,
  defaultSize = DEFAULT_PAGE_SIZE,
) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, opts.pageSize ?? defaultSize),
  );
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/** Build the standard paginated response shape. */
export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Parse an unknown URL search param into a positive integer (1+). */
export function parsePageParam(raw: string | string[] | undefined): number {
  if (!raw) return 1;
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
