import { api_client } from './../../../infrastructure/api/api-client'
import type { Session, ValidateCodeResponse, JoinSessionPayload } from '../types'

export const sessionService = {
  getAllSessions: async (): Promise<Session[]> => {
    const response = await api_client.get('/sessions')
    return response.data
  },

  validateCode: async (session_id: string, code: string): Promise<ValidateCodeResponse> => {
    const response = await api_client.post(`/sessions/${session_id}/validate-code`, { code })
    return response.data
  },

  joinSession: async (session_id: string, payload: JoinSessionPayload): Promise<void> => {
    await api_client.post(`/sessions/${session_id}/join`, payload)
  }
}
