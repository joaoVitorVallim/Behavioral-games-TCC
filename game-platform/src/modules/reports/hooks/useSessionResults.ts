import { useResourceQuery } from '../../../shared/hooks/useResourceQuery'
import { reportsService } from '../services/reportsService'

export const useSessionResults = (sessionId: string | undefined) => {
  const query = useResourceQuery({
    queryKey: ['reports', 'session', sessionId],
    queryFn: () => reportsService.getSessionResults(sessionId as string),
    enabled: !!sessionId
  })

  return {
    data: query.data ?? null,
    is_loading: query.is_loading,
    is_fetching: query.is_fetching,
    is_error: query.is_error,
    refetch: query.refetch
  }
}
