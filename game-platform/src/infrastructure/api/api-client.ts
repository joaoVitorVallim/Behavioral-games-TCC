import axios from 'axios'
import { validateSecureApi } from '../../shared/utils/security'
import { AUTH_TOKEN_STORAGE_KEY } from '../../shared/constants/storageKeys'

const api_url = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

// Valida HTTPS em produção (ponytail: no-op hoje, ver comentário em shared/utils/security.ts)
validateSecureApi(api_url)

export const api_client = axios.create({
  baseURL: api_url,
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // Será true quando implementar httpOnly cookies
})

api_client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de resposta para tratamento de erros genéricos
api_client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não vazar informações sensíveis
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    }
    
    // Mensagem genérica em produção — mantém a instância de AxiosError (status/code)
    // para os callers que fazem `error instanceof AxiosError`, só oculta o corpo da resposta
    if (import.meta.env.PROD) {
      error.message = 'Ocorreu um erro. Tente novamente.'
      if (error.response) {
        error.response.data = undefined
      }
    }

    return Promise.reject(error)
  }
)
