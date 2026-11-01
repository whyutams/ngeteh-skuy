import { Skeleton, SkeletonStats } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      {/* Banner Skeleton */}
      <div className="p-6 bg-slate-200 animate-pulse rounded-xl h-32 w-full" />

      {/* Grid Statistik Skeleton */}
      <SkeletonStats />

      {/* Quick Access Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-44" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2"
            >
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

