import { api_client } from '../../../infrastructure/api/api-client'
import type { LoginRequest, LoginResponse, User } from '../types'

const TOKEN_KEY = 'auth_token'

export const authService = {
  /**
   * Realiza login e retorna access_token
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api_client.post<LoginResponse>('/auth/login', {
      email,
      password
    } as LoginRequest)
    
    return response.data
  },

  /**
   * Obtém token armazenado no localStorage
   */
  getStoredToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Armazena token no localStorage
   */
  storeToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token)
  },

  /**
   * Remove token do localStorage
   */
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY)
  },

  /**
   * Decodifica JWT e extrai payload
   * Valida formato antes de decodificar
   */
  decodeToken: (token: string): User | null => {
    try {
      // Valida formato JWT (3 partes separadas por .)
      const parts = token.split('.')
      if (parts.length !== 3) {
        console.error('Token inválido: formato incorreto')
        return null
      }

      // Decodifica payload (segunda parte)
      const payload = JSON.parse(atob(parts[1]))

      // Valida campos obrigatórios
      if (!payload.sub || !payload.email) {
        console.error('Token inválido: campos obrigatórios ausentes')
        return null
      }

      // Retorna user extraído
      return {
        id: payload.sub,
        email: payload.email
      }
    } catch (error) {
      console.error('Erro ao decodificar token:', error)
      return null
    }
  },

  /**
   * Verifica se token está expirado
   */
  isTokenExpired: (token: string): boolean => {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return true

      const payload = JSON.parse(atob(parts[1]))
      
      // Se não tiver exp, considera não expirado (backend não configurou expiração)
      if (!payload.exp) return false

      // exp está em seconds, Date.now() em milliseconds
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  },

  /**
   * Realiza logout
   */
  logout: (): void => {
    authService.removeToken()
  }
}
