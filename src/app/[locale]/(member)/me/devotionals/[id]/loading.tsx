import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-20" />
      <Card className="overflow-hidden">
        <div className="border-b bg-linear-to-br from-primary/10 via-primary/5 to-transparent px-6 py-8 sm:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="mt-3 h-9 w-3/4" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <div className="space-y-6 px-6 py-8 sm:px-8">
          <div className="rounded-md border-l-4 border-primary/40 bg-primary/5 p-4 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </Card>
    </div>
  );
}
