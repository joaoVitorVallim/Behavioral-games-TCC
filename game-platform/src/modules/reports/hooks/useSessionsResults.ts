import { useResourceQuery } from '../../../shared/hooks/useResourceQuery'
import { reportsService } from '../services/reportsService'

export const useSessionsResults = () => {
  const query = useResourceQuery({
    queryKey: ['reports', 'sessions'],
    queryFn: () => reportsService.getSessionsResults()
  })

  return {
    sessions: query.data ?? [],
    is_loading: query.is_loading,
    is_fetching: query.is_fetching,
    is_error: query.is_error,
    refetch: query.refetch
  }
}
