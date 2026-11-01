interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

// Komponen dasar skeleton loading
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded-md ${className}`}
      {...props}
    />
  );
}

// Skeleton untuk kartu statistik metrik
export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton untuk tabel daftar data
export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full">
      {/* Header Tabel */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>

      {/* Baris Tabel */}
      <div className="p-4 space-y-3">
        {[...Array(rows)].map((_, r) => (
          <div key={r} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
            {[...Array(cols)].map((_, c) => (
              <Skeleton
                key={c}
                className={`h-4 ${c === 0 ? "w-1/4" : c === cols - 1 ? "w-16 ml-auto" : "flex-1"}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Footer Pagination Skeleton */}
      <div className="p-3.5 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Skeleton halaman penuh (Header + Konten)
export function SkeletonPage() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <SkeletonTable rows={7} cols={5} />
    </div>
  );
}

