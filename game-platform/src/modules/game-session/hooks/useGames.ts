import { useQuery } from '@tanstack/react-query'
import { sessionService } from '../services/sessionService'

export const useGames = () => {
  const games_query = useQuery({
    queryKey: ['games'],
    queryFn: () => sessionService.getGames(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })

  return {
    games: games_query.data ?? [],
    is_loading: games_query.isLoading || games_query.isFetching,
    is_error: games_query.isError,
    refetch: games_query.refetch
  }
}
