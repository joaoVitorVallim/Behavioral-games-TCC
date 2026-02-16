import axios from 'axios'
import { validateSecureApi } from '../../shared/utils/security'

const api_url = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

// Valida HTTPS em produção
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
    const token = localStorage.getItem('auth_token')
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
      localStorage.removeItem('auth_token')
    }
    
    // Mensagem genérica em produção
    if (import.meta.env.PROD) {
      const generic_message = 'Ocorreu um erro. Tente novamente.'
      return Promise.reject(new Error(generic_message))
    }
    
    return Promise.reject(error)
  }
)
