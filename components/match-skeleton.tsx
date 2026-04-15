import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function MatchSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-7 w-8" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-7 w-8" />
          </div>
        </div>
        <div className="mt-3">
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export function MatchSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <MatchSkeleton key={i} />
      ))}
    </div>
  )
}
