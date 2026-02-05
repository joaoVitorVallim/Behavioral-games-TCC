import { useQuery } from '@tanstack/react-query'
import { sessionService } from '../services/sessionService'
import { mock_sessions } from '../mocks/sessions.mock'

export const useSessions = () => {
  const sessions_query = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      // Usando mock durante desenvolvimento com delay para simular loading
      await new Promise(resolve => setTimeout(resolve, 800))
      return mock_sessions
      // Para usar API real, comente as linhas acima e descomente a linha abaixo
      // return sessionService.getAllSessions()
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
