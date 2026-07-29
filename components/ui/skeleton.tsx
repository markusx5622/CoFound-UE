export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-800/50 ${className}`}
      {...props}
    />
  );
}

export function ProjectSkeleton() {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-zinc-800 flex flex-col h-[280px]">
      <div className="flex-grow">
        <div className="mb-4">
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <Skeleton className="h-7 w-3/4 mb-4 rounded-md" />
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-zinc-800/50">
        <Skeleton className="h-4 w-full mb-2 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
