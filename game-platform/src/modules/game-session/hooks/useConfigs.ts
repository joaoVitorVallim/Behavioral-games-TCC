import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../services/sessionService'
import type { CreateConfigPayload } from '../types'

export const useConfigs = (game: string) => {
  const query_client = useQueryClient()

  const configs_query = useQuery({
    queryKey: ['configs', game],
    queryFn: async () => {
      const configs = await sessionService.getConfigsByGame(game)
      return configs
    },
    enabled: !!game,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })

  const create_mutation = useMutation({
    mutationFn: (payload: CreateConfigPayload) => sessionService.createConfig(payload),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ['configs', game] })
    }
  })

  return {
    configs: configs_query.data ?? [],
    is_loading: configs_query.isLoading || configs_query.isFetching,
    is_error: configs_query.isError,
    refetch: configs_query.refetch,
    createConfig: create_mutation.mutateAsync,
    is_creating: create_mutation.isPending,
    create_error: create_mutation.error
  }
}
