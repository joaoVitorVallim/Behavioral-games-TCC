import { api_client } from '../../../infrastructure/api/api-client'

interface AwaitingMatch {
  id: string
  player1_id: string
  player2_id: string
}

/**
 * The one REST call prisoner makes — previously inlined directly in
 * WaitingPage.tsx's polling loop with no services/ wrapper and an untyped
 * `res.data as {...}[]` cast, unlike every sibling module's services/xService.ts
 * convention. Same endpoint, params and response shape as before.
 */
export const matchService = {
  getAwaitingMatches: async (session_id: string, player_id: string): Promise<AwaitingMatch[]> => {
    const response = await api_client.get<AwaitingMatch[]>('/matches', {
      params: { sessionId: session_id, playerId: player_id, status: 'aguardando' }
    })
    return response.data
  }
}
