/**
 * Verifica se está em ambiente de produção
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD
}

/**
 * Verifica se a URL usa HTTPS
 */
export const isSecureConnection = (): boolean => {
  return window.location.protocol === 'https:'
}

/**
 * Valida se a API deve usar HTTPS em produção
 */
export const validateSecureApi = (api_url: string): void => {
  if (isProduction() && !api_url.startsWith('https://')) {
    console.warn('⚠️ API não está usando HTTPS em produção!')
  }
}

/**
 * Implementa rate limiting simples
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private max_attempts: number
  private window_ms: number

  constructor(max_attempts: number = 5, window_ms: number = 60000) {
    this.max_attempts = max_attempts
    this.window_ms = window_ms
  }

  canAttempt(key: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    
    // Remove tentativas antigas
    const recent_attempts = attempts.filter(time => now - time < this.window_ms)
    
    if (recent_attempts.length >= this.max_attempts) {
      return false
    }
    
    recent_attempts.push(now)
    this.attempts.set(key, recent_attempts)
    return true
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }
}

/**
 * Implementa debounce para prevenir spam
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait) as unknown as number
  }
}
