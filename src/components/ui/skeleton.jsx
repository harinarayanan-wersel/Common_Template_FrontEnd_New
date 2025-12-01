import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10 dark:bg-white/5", className)}
      {...props} />
  );
}

export { Skeleton }
