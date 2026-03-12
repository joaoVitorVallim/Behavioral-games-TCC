import { useQuery } from '@tanstack/react-query'
import { sessionService } from '../services/sessionService'

export const useSessions = () => {
  const sessions_query = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const sessions = await sessionService.getAllSessions()
      return sessions
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })

  return {
    sessions: sessions_query.data ?? [],
    is_loading: sessions_query.isLoading || sessions_query.isFetching,
    is_error: sessions_query.isError,
    refetch: sessions_query.refetch
  }
}
