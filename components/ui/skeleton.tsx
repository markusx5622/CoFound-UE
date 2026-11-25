export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-800/60 ${className}`}
      {...props}
    />
  );
}

export function ProjectSkeleton() {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-zinc-800 flex flex-col min-h-[348px]">
      <div className="flex-grow">
        <div className="flex items-center justify-between gap-2 mb-4">
          <Skeleton className="h-6 w-28 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="h-7 w-4/5 mb-2.5 rounded-md" />
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-16 rounded-md" />
        </div>
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
        </div>
        <div className="mb-4">
          <Skeleton className="h-3 w-28 mb-2.5 rounded-md" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-zinc-800/50">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
