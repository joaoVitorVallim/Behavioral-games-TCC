import { useQuery } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'

export const useMatchResult = (
  sessionId: string | undefined,
  matchId: string | undefined
) => {
  const query = useQuery({
    queryKey: ['reports', 'session', sessionId, 'match', matchId],
    queryFn: () =>
      reportsService.getMatchResult(sessionId as string, matchId as string),
    enabled: !!sessionId && !!matchId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })

  return {
    data: query.data ?? null,
    is_loading: query.isLoading,
    is_fetching: query.isFetching,
    is_error: query.isError,
    refetch: query.refetch
  }
}
