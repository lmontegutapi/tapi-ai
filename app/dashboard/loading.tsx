import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="p-4 space-y-4">
      {/* Header loading state */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-6 w-[200px]" />
      </div>

      {/* Content loading state */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({length: 6}).map((_, i) => (
          <div key={`skeleton-${i}`} className="space-y-3">
            <Skeleton className="h-[125px] w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[160px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
