/**
 * Skeleton loader para WorkoutSessionTracker
 *
 * Muestra un estado de carga mientras se obtienen los datos
 * de la sesión o del día de rutina.
 */

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function WorkoutSessionTrackerSkeleton() {
  return (
    <div className="min-h-screen py-6 px-4 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Progress Card Skeleton */}
        <Card className="p-4 sm:p-6 mb-6 bg-card border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </Card>

        {/* Exercise Cards Skeleton */}
        <div className="space-y-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border">
              <div className="p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <Skeleton className="w-5 h-5 rounded" />
              </div>
            </Card>
          ))}
        </div>

        {/* Button Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
