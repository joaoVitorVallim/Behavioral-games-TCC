import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, PlusCircle, FileText, Menu, X, UserCircle, LogOut } from 'lucide-react'
import { useAuth } from '../../modules/auth/hooks/useAuth'
import { useClickOutside } from '../hooks/useClickOutside'

interface HeaderProps {
  hide_auth_cta?: boolean
}

export function Header({ hide_auth_cta = false }: HeaderProps) {
  const navigate = useNavigate()
  const { is_authenticated, logout } = useAuth()
  const [show_profile_dropdown, setShowProfileDropdown] = useState(false)
  const [show_mobile_menu, setShowMobileMenu] = useState(false)
  const dropdown_ref = useRef<HTMLDivElement>(null)

  useClickOutside(
    dropdown_ref,
    useCallback(() => setShowProfileDropdown(false), []),
    show_profile_dropdown
  )

  const handleLogout = () => {
    logout()
    setShowProfileDropdown(false)
    setShowMobileMenu(false)
    navigate('/')
  }

  const show_login_cta = !hide_auth_cta
  const show_mobile_menu_button = is_authenticated || show_login_cta

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <button
          onClick={() => navigate('/')}
            className="group flex items-center gap-3"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/35 bg-primary/12 text-primary shadow-[0_0_0_1px_rgba(154,190,255,0.18)_inset] transition-transform duration-300 group-hover:-translate-y-0.5">
              <Brain className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="heading-kicker leading-none">Laboratório Digital</p>
              <span className="text-lg font-semibold tracking-tight text-foreground">BehaviorLab</span>
            </div>
        </button>

          <nav className="hidden items-center gap-3 md:flex" aria-label="Navegacao principal">
          {is_authenticated ? (
            <>
              <button
                onClick={() => navigate('/create-session')}
                  className="btn-primary"
              >
                <PlusCircle className="w-4 h-4" />
                Criar Sessão
              </button>

              <button
                onClick={() => navigate('/reports')}
                  className="btn-secondary"
              >
                <FileText className="w-4 h-4" />
                Relatórios
              </button>

              <div className="relative" ref={dropdown_ref}>
                <button
                  onClick={() => setShowProfileDropdown(!show_profile_dropdown)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-card/65 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                    <UserCircle className="h-6 w-6" />
                </button>

                {show_profile_dropdown && (
                    <div className="surface-panel absolute right-0 z-50 mt-2 w-52 p-1.5">
                    <button
                      onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da conta
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : show_login_cta ? (
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Entrar
            </button>
          ) : null}
        </nav>

        {show_mobile_menu_button && (
          <button
            className="rounded-xl border border-border/80 bg-card/65 p-2.5 text-foreground transition-colors hover:border-primary/35 md:hidden"
            onClick={() => setShowMobileMenu(!show_mobile_menu)}
          >
            {show_mobile_menu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
        </div>
      </header>

      {show_mobile_menu && show_mobile_menu_button && (
        <nav className="border-b border-border/70 bg-background/95 px-5 py-4 backdrop-blur-md md:hidden" aria-label="Navegacao movel">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
          {is_authenticated ? (
            <>
              <button
                onClick={() => { navigate('/create-session'); setShowMobileMenu(false) }}
                  className="btn-primary w-full"
              >
                <PlusCircle className="w-4 h-4" />
                Criar Sessão
              </button>

              <button
                onClick={() => { navigate('/reports'); setShowMobileMenu(false) }}
                  className="btn-secondary w-full"
              >
                <FileText className="w-4 h-4" />
                Relatórios
              </button>

              <button
                onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </>
          ) : show_login_cta ? (
            <button
              onClick={() => { navigate('/login'); setShowMobileMenu(false) }}
              className="btn-primary w-full"
            >
              Entrar
            </button>
          ) : null}
          </div>
        </nav>
      )}
    </>
  )
}
