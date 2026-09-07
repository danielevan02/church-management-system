import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      // surface-container-highest is the M3 "empty content" tone — the same
      // role a filled text field uses at rest, so placeholders read as
      // unfilled containers rather than grey blocks.
      className={cn("animate-pulse rounded-sm bg-surface-container-highest", className)}
      {...props}
    />
  )
}

export { Skeleton }
