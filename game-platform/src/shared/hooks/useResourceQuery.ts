import { useQuery, type QueryKey } from '@tanstack/react-query'

interface ResourceQueryOptions<T> {
  queryKey: QueryKey
  queryFn: () => Promise<T>
  enabled?: boolean
  staleTime?: number
  gcTime?: number
}

const DEFAULT_STALE_TIME = 5 * 60 * 1000
const DEFAULT_GC_TIME = 10 * 60 * 1000

/**
 * Wraps useQuery with the is_loading/is_fetching/is_error/refetch return shape
 * duplicated across reports' three query hooks (useSessionsResults,
 * useSessionResults, useMatchResult), all with the same staleTime/gcTime.
 *
 * ponytail: on closer look (Part 2), ALL FIVE of game-session's query hooks
 * (useSessions, useGames, useConfigs, useGameConfigFields, usePlayerFields)
 * consistently merge isLoading/isFetching into one is_loading — that's their
 * module's own settled convention, not an outlier needing a fix. Forcing them
 * onto this factory's separate is_loading/is_fetching shape would be a real (if
 * small) UX behavior change — spinners would stop covering background refetches
 * — for zero user-visible benefit, just to shave lines. Not doing that. This
 * factory is reserved for reports' three hooks (Part 4), which already match its
 * shape exactly.
 */
export function useResourceQuery<T>(options: ResourceQueryOptions<T>) {
  const query = useQuery({
    queryKey: options.queryKey,
    queryFn: options.queryFn,
    enabled: options.enabled,
    staleTime: options.staleTime ?? DEFAULT_STALE_TIME,
    gcTime: options.gcTime ?? DEFAULT_GC_TIME
  })

  return {
    data: query.data,
    is_loading: query.isLoading,
    is_fetching: query.isFetching,
    is_error: query.isError,
    refetch: query.refetch
  }
}
