import { useState, useRef, useEffect } from 'react'
import { Brain, User, LogOut, FileText, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../modules/auth/hooks/useAuth'
import { LoginModal } from '../../modules/auth/components/LoginModal'

export function Header() {
  const navigate = useNavigate()
  const { user, is_authenticated, logout } = useAuth()
  const [show_login_modal, setShowLoginModal] = useState(false)
  const [show_profile_dropdown, setShowProfileDropdown] = useState(false)
  const dropdown_ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdown_ref.current && !dropdown_ref.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }

    if (show_profile_dropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [show_profile_dropdown])

  const handleLogout = () => {
    logout()
    setShowProfileDropdown(false)
    navigate('/')
  }

  return (
    <>
      <header className="w-full max-w-6xl mx-auto p-6 flex justify-between items-center z-10 bg-background border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 hover:scale-105 transition-transform"
        >
          <Brain className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">BehaviorLab</span>
        </button>

        <div className="flex items-center gap-3">
          {is_authenticated ? (
            <>
              {/* Create Session Button */}
              <button
                onClick={() => navigate('/create-session')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:scale-105 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Criar Sessão
              </button>

              {/* Reports Button */}
              <button
                onClick={() => navigate('/reports')}
                className="flex items-center gap-2 px-4 py-2 bg-card text-foreground border border-border rounded-lg text-sm font-semibold hover:scale-105 transition-all"
              >
                <FileText className="w-4 h-4" />
                Relatórios
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdown_ref}>
                <button
                  onClick={() => setShowProfileDropdown(!show_profile_dropdown)}
                  className="p-2 bg-card text-foreground border border-border rounded-full hover:scale-105 transition-all"
                  aria-label="Profile menu"
                >
                  <User className="w-5 h-5" />
                </button>

                {show_profile_dropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-xs text-muted-foreground">Conectado como</p>
                      <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:scale-105 hover:text-background transition-all"
            >
              Sou Docente
            </button>
          )}
        </div>
      </header>

      {show_login_modal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  )
}
