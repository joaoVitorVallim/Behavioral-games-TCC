import { api_client } from './../../../infrastructure/api/api-client'
import type {
  Session,
  JoinSessionPayload,
  JoinSessionResponse,
  GameConfig,
  GameCatalogItem,
  GameConfigFieldsResponse,
  ValidPlayerFieldsResponse,
  CreateConfigPayload,
  CreateSessionPayload,
  CreateSessionResponse
} from '../types'

export const sessionService = {
  // Game catalog endpoints
  getGames: async (): Promise<GameCatalogItem[]> => {
    const response = await api_client.get('/games')
    return response.data
  },

  getGameConfigFields: async (game: string): Promise<GameConfigFieldsResponse> => {
    const response = await api_client.get('/settings/game-config/fields', {
      params: { game }
    })
    return response.data
  },

  getValidPlayerFields: async (): Promise<ValidPlayerFieldsResponse> => {
    const response = await api_client.get('/settings/player-fields/valid')
    return response.data
  },

  // Session endpoints
  getAllSessions: async (): Promise<Session[]> => {
    const response = await api_client.get('/sessions')
    return response.data
  },

  createSession: async (payload: CreateSessionPayload): Promise<CreateSessionResponse> => {
    const response = await api_client.post('/sessions', payload)
    return response.data
  },

  joinSession: async (payload: JoinSessionPayload): Promise<JoinSessionResponse> => {
    const response = await api_client.post('/sessions/join', payload)
    return response.data
  },

  deleteSession: async (id: string): Promise<void> => {
    await api_client.delete(`/sessions/${id}`)
  },

  finishSession: async (id: string): Promise<void> => {
    await api_client.post(`/sessions/${id}/finish`)
  },

  // Config endpoints
  getConfigsByGame: async (game: string): Promise<GameConfig[]> => {
    const response = await api_client.get(`/settings/game/${game}`)
    return response.data
  },

  createConfig: async (payload: CreateConfigPayload): Promise<GameConfig> => {
    const response = await api_client.post('/settings', payload)
    return response.data
  },

  deleteConfig: async (id: string): Promise<void> => {
    await api_client.delete(`/settings/${id}`)
  }
}
