import { Skeleton } from "@/components/ui/skeleton";

export function BlogsViewSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading blogs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36 rounded-full bg-black/[0.06]" />
          <Skeleton className="h-8 w-56 bg-black/[0.07] sm:h-9 sm:w-72" />
          <Skeleton className="h-4 w-full max-w-md bg-black/[0.05]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-full bg-black/[0.06]" />
          <Skeleton className="h-10 w-24 rounded-full bg-black/[0.06]" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.35)]"
          >
            <Skeleton className="h-3 w-20 bg-black/[0.05]" />
            <Skeleton className="mt-2 h-8 w-12 bg-black/[0.07]" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-8 rounded-full bg-black/[0.06]"
            style={{ width: `${4.5 + i * 1.25}rem` }}
          />
        ))}
      </div>

      <BlogsTableSkeleton rows={6} />
    </div>
  );
}

export function BlogsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="rounded-3xl border border-[#E5E5E5] bg-white p-4 shadow-[0_16px_48px_-32px_rgba(0,0,0,0.4)] sm:p-5"
      aria-busy="true"
      aria-label="Loading blog list"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-20 bg-black/[0.07]" />
          <Skeleton className="h-4 w-56 max-w-full bg-black/[0.05]" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-full bg-black/[0.06]" />
          <Skeleton className="h-10 w-full rounded-full bg-black/[0.06] sm:w-72" />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-20 bg-black/[0.05]" />
        <Skeleton className="h-4 w-4 rounded-full bg-black/[0.05]" />
      </div>

      <div className="overflow-hidden">
        <div className="mb-3 hidden grid-cols-[2fr_1fr_1fr_0.8fr_0.7fr_0.8fr_0.9fr] gap-3 border-b border-[#E5E5E5] pb-2 md:grid">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-3 bg-black/[0.05]" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-2 border-b border-[#F0F0F0] py-3 last:border-0 md:grid-cols-[2fr_1fr_1fr_0.8fr_0.7fr_0.8fr_0.9fr] md:items-center md:gap-3"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-[88%] bg-black/[0.07]" />
                <Skeleton className="h-3 w-[55%] bg-black/[0.05]" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full bg-black/[0.06]" />
              <Skeleton className="hidden h-4 w-20 bg-black/[0.05] md:block" />
              <Skeleton className="hidden h-4 w-16 bg-black/[0.05] md:block" />
              <Skeleton className="hidden h-4 w-10 bg-black/[0.05] md:block" />
              <Skeleton className="hidden h-4 w-16 bg-black/[0.05] md:block" />
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded-full bg-black/[0.06]" />
                <Skeleton className="h-8 w-8 rounded-full bg-black/[0.06]" />
                <Skeleton className="h-8 w-8 rounded-full bg-black/[0.06]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogEditorSkeleton() {
  return (
    <div
      className="mx-auto max-w-3xl space-y-6 pb-16"
      aria-busy="true"
      aria-label="Loading blog editor"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32 rounded-full bg-black/[0.06]" />
          <Skeleton className="h-7 w-36 bg-black/[0.07]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-full bg-black/[0.06]" />
          <Skeleton className="h-10 w-32 rounded-full bg-black/[0.06]" />
        </div>
      </div>

      <Skeleton className="h-28 w-full rounded-2xl bg-black/[0.05]" />

      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="space-y-4 rounded-3xl border border-[#E5E5E5] bg-white p-5"
        >
          <Skeleton className="h-6 w-32 bg-black/[0.07]" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 bg-black/[0.05]" />
            <Skeleton className="h-10 w-full rounded-xl bg-black/[0.06]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 bg-black/[0.05]" />
            <Skeleton className="h-10 w-full rounded-xl bg-black/[0.06]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 bg-black/[0.05]" />
            <Skeleton className="h-24 w-full rounded-xl bg-black/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  );
}
