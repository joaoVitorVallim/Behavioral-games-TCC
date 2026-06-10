import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../services/sessionService'

export const useSessions = () => {
  const query_client = useQueryClient()

  const sessions_query = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const sessions = await sessionService.getAllSessions()
      return sessions
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })

  const delete_mutation = useMutation({
    mutationFn: (id: string) => sessionService.deleteSession(id),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ['sessions'] })
      query_client.invalidateQueries({ queryKey: ['reports', 'sessions'] })
    }
  })

  const finish_mutation = useMutation({
    mutationFn: (id: string) => sessionService.finishSession(id),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ['sessions'] })
      query_client.invalidateQueries({ queryKey: ['reports', 'sessions'] })
    }
  })

  return {
    sessions: sessions_query.data ?? [],
    is_loading: sessions_query.isLoading || sessions_query.isFetching,
    is_error: sessions_query.isError,
    refetch: sessions_query.refetch,
    deleteSession: delete_mutation.mutateAsync,
    is_deleting: delete_mutation.isPending,
    deleting_id: delete_mutation.variables ?? null,
    finishSession: finish_mutation.mutateAsync,
    is_finishing: finish_mutation.isPending,
    finishing_id: finish_mutation.variables ?? null
  }
}
