import { useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { validateEmail } from '../../../shared/utils/validation'
import { RateLimiter } from '../../../shared/utils/security'
import { AxiosError } from 'axios'

interface LoginModalProps {
  onClose: () => void
}

const rate_limiter = new RateLimiter(5, 60000) // 5 tentativas por minuto

export const LoginModal = ({ onClose }: LoginModalProps) => {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [erro, setErro] = useState("")
  const [is_submitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    // Validação básica
    if (!email || !password) {
      setErro("Preencha todos os campos")
      return
    }

    // Validação de email
    if (!validateEmail(email)) {
      setErro("Email inválido")
      return
    }

    // Rate limiting
    if (!rate_limiter.canAttempt('login')) {
      setErro("Muitas tentativas. Aguarde um momento.")
      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password)
      rate_limiter.reset('login') // Reset após sucesso
      onClose() // Fecha modal após login bem-sucedido
    } catch (error) {
      // Tratamento de erros específicos
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          setErro("Email ou senha inválidos")
        } else if (error.response && error.response.status >= 500) {
          setErro("Erro no servidor. Tente novamente mais tarde.")
        } else if (error.code === 'ERR_NETWORK') {
          setErro("Erro de conexão. Verifique se o servidor está rodando.")
        } else {
          setErro("Erro ao fazer login. Tente novamente.")
        }
      } else {
        setErro("Erro inesperado. Tente novamente.")
      }
      console.error('Erro no login:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [email, password, login, onClose])

  return (
    <div 
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card border border-border rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground hover:scale-125 transition-all text-xl w-8 h-8 flex items-center justify-center leading-none"
          aria-label="Fechar"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Login Docente</h2>
            <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1 font-semibold">
              Área Restrita
            </p>
          </div>

          <input
            type="email"
            placeholder="docente@fho.edu.br"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErro('')
            }}
            disabled={is_submitting}
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErro('')
            }}
            disabled={is_submitting}
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {erro && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs text-center">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={is_submitting}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-105 hover:text-background disabled:opacity-50 disabled:hover:scale-100 disabled:hover:text-primary-foreground disabled:cursor-not-allowed transition-all"
          >
            {is_submitting ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}
