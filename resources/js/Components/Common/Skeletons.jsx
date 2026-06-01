import { Skeleton } from '@/Components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/Components/ui/card'

export function StatCardSkeleton() {
  return (
    <Card className="border-gray-100">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-gray-100">
          <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
          <CardContent><Skeleton className="h-52 w-full rounded-lg" /></CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-40 w-full rounded-full mx-auto" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function LeadsTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
        <div className="bg-gray-50/80 px-4 py-3 flex gap-4">
          {[140, 120, 90, 80, 90, 80].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-t border-gray-50">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LeadDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-gray-100">
            <CardContent className="pt-5 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-4 w-24 shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="border-gray-100">
            <CardHeader><Skeleton className="h-4 w-20" /></CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
