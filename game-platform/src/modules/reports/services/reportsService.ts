import { api_client } from '../../../infrastructure/api/api-client'
import type {
  MatchResultDetail,
  SessionResultsDetail,
  SessionResultsListItem
} from '../types'

export const reportsService = {
  getSessionsResults: async (): Promise<SessionResultsListItem[]> => {
    const response = await api_client.get<SessionResultsListItem[]>('/sessions/results')
    return response.data
  },

  getSessionResults: async (sessionId: string): Promise<SessionResultsDetail> => {
    const response = await api_client.get<SessionResultsDetail>(
      `/sessions/${sessionId}/results`
    )
    return response.data
  },

  getMatchResult: async (
    sessionId: string,
    matchId: string
  ): Promise<MatchResultDetail> => {
    const response = await api_client.get<MatchResultDetail>(
      `/sessions/${sessionId}/results/${matchId}`
    )
    return response.data
  }
}
