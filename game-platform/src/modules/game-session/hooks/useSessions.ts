import { useQuery } from '@tanstack/react-query'
import { sessionService } from '../services/sessionService'

export const useSessions = () => {
  const sessions_query = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const sessions = await sessionService.getAllSessions()
      console.log('[useSessions] GET /sessions:', sessions)
      return sessions
    },
    staleTime: 0, // Força refetch a sempre buscar dados novos
    gcTime: 0 // Não mantém cache (antes era cacheTime)
  })

  return {
    sessions: sessions_query.data ?? [],
    is_loading: sessions_query.isLoading || sessions_query.isFetching,
    is_error: sessions_query.isError,
    refetch: sessions_query.refetch
  }
}
