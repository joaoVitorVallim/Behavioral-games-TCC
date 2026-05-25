import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { useLocation, useNavigate } from 'react-router-dom'
import { SessionCard } from '../components/SessionCard'
import { SessionCardSkeleton } from '../components/SessionCardSkeleton'
import { JoinSessionModal } from '../components/JoinSessionModal'
import { Header } from '../../../shared/components/Header'
import { useSessions } from '../hooks/useSessions'
import { RefreshCw } from 'lucide-react'
import type { Session } from '../types'

export const SessionsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { sessions, is_loading, refetch } = useSessions()
  const [selected_session, setSelectedSession] = useState<Session | null>(null)

  useEffect(() => {
    if (!location.state || typeof location.state !== 'object') return

    const refresh_sessions = (location.state as { refresh_sessions?: boolean }).refresh_sessions

    if (!refresh_sessions) return

    void refetch()
    navigate('/sessions', { replace: true })
  }, [location.state, refetch, navigate])

  useEffect(() => {
    if (is_loading || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const cards = document.querySelectorAll('[data-session-card="true"]')
    if (cards.length === 0) {
      return
    }

    gsap.fromTo(
      cards,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.55,
        ease: 'power2.out',
        stagger: 0.08
      }
    )
  }, [is_loading, sessions])

  const handleEnterSession = (session: Session) => {
    setSelectedSession(session)
  }

  const handleCloseModal = () => {
    setSelectedSession(null)
  }

  const handleJoinSuccess = () => {
    refetch()
  }

  const handleReload = () => {
    refetch()
  }

  return (
    <div className="app-shell">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <section className="surface-panel mb-8 px-6 py-7 md:px-10 md:py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="heading-kicker mb-2">Catalogo ativo</p>
              <h2 className="text-4xl text-foreground md:text-5xl">Sessões Disponíveis</h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">Escolha uma sessão para participar. A lista abaixo reflete as turmas e configurações publicadas pelos docentes.</p>
            </div>
            <button
              onClick={handleReload}
              disabled={is_loading}
              className="btn-secondary w-full md:w-auto"
              title="Recarregar sessões"
            >
              <RefreshCw className={`h-4 w-4 ${is_loading ? 'animate-spin' : ''}`} />
              Recarregar
            </button>
          </div>
        </section>

        {is_loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SessionCardSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="surface-panel py-14 text-center text-muted-foreground">
            <p className="text-lg">Nenhuma sessão disponível no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onEnter={() => handleEnterSession(session)}
              />
            ))}
          </div>
        )}
      </main>

      {selected_session && (
        <JoinSessionModal
          session={selected_session}
          onClose={handleCloseModal}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  )
}
