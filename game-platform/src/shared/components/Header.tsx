import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, PlusCircle, FileText, Menu, X, UserCircle, LogOut } from 'lucide-react'
import { useAuth } from '../../modules/auth/hooks/useAuth'
import { LoginModal } from '../../modules/auth/components/LoginModal'
import { useClickOutside } from '../hooks/useClickOutside'

export function Header() {
  const navigate = useNavigate()
  const { is_authenticated, logout } = useAuth()
  const [show_login_modal, setShowLoginModal] = useState(false)
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

  return (
    <>
      <header className="relative w-full px-6 md:px-8 py-4 flex justify-between items-center z-50 bg-background border-b border-border">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 hover:scale-105 transition-transform"
        >
          <Brain className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">BehaviorLab</span>
        </button>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-3" aria-label="Navegação principal">
          {is_authenticated ? (
            <>
              <button
                onClick={() => navigate('/create-session')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:scale-105 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Criar Sessão
              </button>

              <button
                onClick={() => navigate('/reports')}
                className="flex items-center gap-2 px-4 py-2 bg-card text-foreground border border-border rounded-lg text-sm font-semibold hover:scale-105 transition-all"
              >
                <FileText className="w-4 h-4" />
                Relatórios
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdown_ref}>
                <button
                  onClick={() => setShowProfileDropdown(!show_profile_dropdown)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-card border border-transparent hover:border-border transition-all"
                >
                  <UserCircle className="w-6 h-6 text-muted-foreground" />
                </button>

                {show_profile_dropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-1 z-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da conta
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:scale-105 transition-all"
            >
              Entrar
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-card transition-colors"
          onClick={() => setShowMobileMenu(!show_mobile_menu)}
        >
          {show_mobile_menu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile menu dropdown */}
      {show_mobile_menu && (
        <nav className="md:hidden w-full bg-background border-b border-border px-6 py-4 flex flex-col gap-3 z-10" aria-label="Navegação móvel">
          {is_authenticated ? (
            <>
              <button
                onClick={() => { navigate('/create-session'); setShowMobileMenu(false) }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                Criar Sessão
              </button>

              <button
                onClick={() => { navigate('/reports'); setShowMobileMenu(false) }}
                className="flex items-center gap-2 px-4 py-2 bg-card text-foreground border border-border rounded-lg text-sm font-semibold"
              >
                <FileText className="w-4 h-4" />
                Relatórios
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-500 border border-red-500/30 bg-red-500/10 rounded-lg text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </>
          ) : (
            <button
              onClick={() => { setShowLoginModal(true); setShowMobileMenu(false) }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
            >
              Entrar
            </button>
          )}
        </nav>
      )}

      {show_login_modal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  )
}
