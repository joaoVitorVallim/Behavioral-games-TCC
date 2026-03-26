import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SessionCard } from '../components/SessionCard'
import { SessionCardSkeleton } from '../components/SessionCardSkeleton'
import { JoinSessionModal } from '../components/JoinSessionModal'
import { Header } from '../../../shared/components/Header'
import { useSessions } from '../hooks/useSessions'
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-350 mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-4xl font-bold text-foreground">Sessões Disponíveis</h2>
            <button
              onClick={handleReload}
              disabled={is_loading}
              className="p-2 rounded-lg text-muted-foreground hover:scale-110 hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Recarregar sessões"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="text-muted-foreground text-base">Escolha uma sessão para participar</p>
        </div>

        {is_loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <SessionCardSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg">Nenhuma sessão disponível no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
