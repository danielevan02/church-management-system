import {
  CardSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
