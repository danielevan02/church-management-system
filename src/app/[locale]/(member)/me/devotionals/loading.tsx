import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="flex items-stretch gap-0 p-0">
              <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 border-r bg-primary/5 p-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-7 w-10" />
                <Skeleton className="h-3 w-8" />
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-3 p-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
