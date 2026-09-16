import { useQuery } from '@tanstack/react-query'
import { sessionService } from '../../game-session/services/sessionService'

/**
 * Same query as game-session's useSessions (same queryKey, shares its
 * TanStack Query cache) — this module only needs the read, not the
 * delete/finish mutations useSessions also carries.
 */
export function usePlayableSessions() {
  const query = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionService.getAllSessions(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })

  return {
    sessions: query.data ?? [],
    is_loading: query.isLoading || query.isFetching,
    is_error: query.isError
  }
}
