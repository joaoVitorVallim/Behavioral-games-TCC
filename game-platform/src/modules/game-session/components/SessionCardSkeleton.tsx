export const SessionCardSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
      <div className="flex gap-4 mb-3">
        <div className="shrink-0">
          <div className="w-11 h-11 bg-muted rounded-lg"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>

        <div className="shrink-0">
          <div className="h-5 w-20 bg-muted rounded-full"></div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="h-3 bg-muted rounded w-full"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="h-3 w-16 bg-muted rounded"></div>
          <div className="h-3 w-16 bg-muted rounded"></div>
        </div>
        
        <div className="h-10 w-24 bg-muted rounded-lg"></div>
      </div>
    </div>
  )
}
