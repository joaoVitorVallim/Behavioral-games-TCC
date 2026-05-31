import { useQuery } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'

export const useSessionsResults = () => {
  const query = useQuery({
    queryKey: ['reports', 'sessions'],
    queryFn: () => reportsService.getSessionsResults(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })

  return {
    sessions: query.data ?? [],
    is_loading: query.isLoading,
    is_fetching: query.isFetching,
    is_error: query.isError,
    refetch: query.refetch
  }
}
