/**
 * Reusable M3 Skeleton Components.
 * Modularized into primitives, admin-specific, and member-specific skeletons.
 */

export * from "./primitives";
export * from "./admin-skeletons";
export * from "./member-skeletons";

// Backward-compatibility aliases for generic callers
export {
  AdminDashboardSkeleton as DashboardSkeleton,
  AdminMemberDetailSkeleton as DetailSkeleton,
} from "./admin-skeletons";
