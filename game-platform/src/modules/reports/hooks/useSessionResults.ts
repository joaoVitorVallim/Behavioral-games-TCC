import { useQuery } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'

export const useSessionResults = (sessionId: string | undefined) => {
  const query = useQuery({
    queryKey: ['reports', 'session', sessionId],
    queryFn: () => reportsService.getSessionResults(sessionId as string),
    enabled: !!sessionId,
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
