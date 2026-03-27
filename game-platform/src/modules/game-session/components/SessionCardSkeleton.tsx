export const SessionCardSkeleton = () => {
  return (
    <div className="surface-panel animate-pulse p-6">
      <div className="flex gap-4 mb-3">
        <div className="shrink-0">
          <div className="h-11 w-11 rounded-lg bg-muted"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="mb-2 h-4 w-3/4 rounded bg-muted"></div>
          <div className="h-3 w-1/2 rounded bg-muted"></div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="h-3 w-full rounded bg-muted"></div>
        <div className="h-3 w-5/6 rounded bg-muted"></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="h-3 w-16 rounded bg-muted"></div>
          <div className="h-3 w-16 rounded bg-muted"></div>
        </div>
        
        <div className="h-10 w-24 rounded-lg bg-muted"></div>
      </div>
    </div>
  )
}
