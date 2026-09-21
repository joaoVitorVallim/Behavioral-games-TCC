import { api_client } from '../../../infrastructure/api/api-client'

interface AwaitingMatch {
  id: string
  player1_id: string
  player2_id: string
}

/**
 * The one REST call the match screens make: useMatchRoom polls it to find the
 * player's match, since whoever joins first may not have one yet.
 */
export const matchService = {
  getAwaitingMatches: async (session_id: string, player_id: string): Promise<AwaitingMatch[]> => {
    const response = await api_client.get<AwaitingMatch[]>('/matches', {
      params: { sessionId: session_id, playerId: player_id, status: 'aguardando' }
    })
    return response.data
  }
}
