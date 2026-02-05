import { useState } from 'react'
import { SessionCard } from '../components/SessionCard'
import { SessionCardSkeleton } from '../components/SessionCardSkeleton'
import { JoinSessionModal } from '../components/JoinSessionModal'
import { useSessions } from '../hooks/useSessions'
import type { Session } from '../types'

export const SessionsPage = () => {
  const { sessions, is_loading, refetch } = useSessions()
  const [selected_session, setSelectedSession] = useState<Session | null>(null)

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
      <header className="bg-card border-b border-border">
        <div className="max-w-350 mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
            <h1 className="text-foreground text-lg font-semibold">BehaviorLab</h1>
          </div>
          
          <button className="px-5 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-lg text-sm font-medium transition-opacity">
            Sou Docente
          </button>
        </div>
      </header>

      <main className="max-w-350 mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-4xl font-bold text-foreground">Sessões Disponíveis</h2>
            <button
              onClick={handleReload}
              disabled={is_loading}
              className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
