import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Mail, User, Lock } from 'lucide-react'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../../shared/components/Header'
import { useAuth } from '../hooks/useAuth'
import { validateEmail } from '../../../shared/utils/validation'

export function RegisterPage() {
  const navigate = useNavigate()
  const root_ref = useRef<HTMLDivElement | null>(null)
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm_password, setConfirmPassword] = useState('')
  const [error_message, setErrorMessage] = useState('')
  const [is_submitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!root_ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-auth="intro"]',
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out'
        }
      )

      gsap.fromTo(
        '[data-auth="form"]',
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          delay: 0.08
        }
      )
    }, root_ref)

    return () => ctx.revert()
  }, [])

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMessage('')

    if (!name.trim() || !email.trim() || !password.trim() || !confirm_password.trim()) {
      setErrorMessage('Preencha todos os campos')
      return
    }

    if (!validateEmail(email)) {
      setErrorMessage('E-mail inválido')
      return
    }

    if (password.length < 8) {
      setErrorMessage('A senha deve ter no mínimo 8 caracteres')
      return
    }

    if (password !== confirm_password) {
      setErrorMessage('As senhas não coincidem')
      return
    }

    setIsSubmitting(true)

    try {
      await register({ name: name.trim(), login: email.trim(), password })
      navigate('/login', { state: { registered: true } })
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          setErrorMessage('Este e-mail já está cadastrado')
        } else if (error.response && error.response.status >= 500) {
          setErrorMessage('Erro no servidor. Tente novamente mais tarde.')
        } else if (error.code === 'ERR_NETWORK') {
          setErrorMessage('Erro de conexão. Verifique se o servidor está rodando.')
        } else {
          setErrorMessage('Erro ao criar conta. Tente novamente.')
        }
      } else {
        setErrorMessage('Erro inesperado. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [name, email, password, confirm_password, register, navigate])

  return (
    <div ref={root_ref} className="app-shell flex flex-col text-foreground">
      <Header hide_auth_cta />

      <main className="relative z-10 flex flex-1 items-center px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.85fr] lg:items-center">
          <section data-auth="intro" className="surface-panel p-7 md:p-10">
            <p className="heading-kicker mb-4">Cadastro institucional</p>
            <h1 className="text-4xl leading-tight text-foreground md:text-5xl">Criar conta</h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Crie sua conta para acessar sessões e relatórios da plataforma.
            </p>
          </section>

          <aside data-auth="form" className="surface-panel p-7 md:p-9">
            <div className="mb-6">
              <p className="heading-kicker mb-2">Dados pessoais</p>
              <h2 className="text-2xl text-foreground">Nova conta</h2>
              <p className="mt-2 text-sm text-muted-foreground">Informe os dados para criar sua conta.</p>
            </div>

            {error_message && (
              <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error_message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Nome completo
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nome e sobrenome"
                    className="input-shell pl-9 text-sm"
                    autoComplete="name"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                E-mail
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nome@instituicao.edu.br"
                    className="input-shell pl-9 text-sm"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Senha
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="input-shell pl-9 text-sm"
                    autoComplete="new-password"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Confirmar senha
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirm_password}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="••••••••"
                    className="input-shell pl-9 text-sm"
                    autoComplete="new-password"
                  />
                </div>
              </label>

              <p className="text-xs text-muted-foreground">Minimo de 8 caracteres.</p>

              <button
                type="submit"
                disabled={is_submitting}
                className="btn-primary w-full disabled:opacity-50"
              >
                {is_submitting ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <p className="mt-6 text-sm text-muted-foreground">
              Já possui acesso?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-semibold text-foreground transition-colors hover:text-primary"
              >
                Entrar
              </button>
            </p>
          </aside>
        </div>
      </main>

      <footer className="border-t border-border/70 bg-background/65 px-4 py-5 text-center backdrop-blur-sm">
        <p className="text-[11px] tracking-[0.13em] text-muted-foreground">© 2025 BehaviorLab - Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
