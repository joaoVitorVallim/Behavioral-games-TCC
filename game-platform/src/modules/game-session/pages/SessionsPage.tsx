import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useLocation, useNavigate } from 'react-router-dom'
import { SessionCard } from '../components/SessionCard'
import { SessionCardSkeleton } from '../components/SessionCardSkeleton'
import { JoinSessionModal } from '../components/JoinSessionModal'
import { ConfirmDeleteSessionModal } from '../components/ConfirmDeleteSessionModal'
import { ConfirmFinishSessionModal } from '../components/ConfirmFinishSessionModal'
import { Header } from '../../../shared/components/Header'
import { useSessions } from '../hooks/useSessions'
import { useAuth } from '../../auth/hooks/useAuth'
import { get_session_label } from '../utils/session-label'
import { RefreshCw } from 'lucide-react'
import type { Session } from '../types'

export const SessionsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { is_authenticated } = useAuth()
  const {
    sessions,
    is_loading,
    refetch,
    deleteSession,
    is_deleting,
    deleting_id,
    finishSession,
    is_finishing,
    finishing_id
  } = useSessions()
  const [selected_session, setSelectedSession] = useState<Session | null>(null)
  const [session_to_delete, setSessionToDelete] = useState<Session | null>(null)
  const [session_to_finish, setSessionToFinish] = useState<Session | null>(null)
  const [action_toast, setActionToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const action_toast_timeout_ref = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => {
    return () => {
      if (action_toast_timeout_ref.current) {
        clearTimeout(action_toast_timeout_ref.current)
      }
    }
  }, [])

  const showActionToast = (type: 'success' | 'error', message: string) => {
    setActionToast({ type, message })

    if (action_toast_timeout_ref.current) {
      clearTimeout(action_toast_timeout_ref.current)
    }

    action_toast_timeout_ref.current = setTimeout(() => {
      setActionToast(null)
      action_toast_timeout_ref.current = null
    }, 2800)
  }

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

  const handleRequestDelete = (session: Session) => {
    if (!is_authenticated) return
    setSessionToDelete(session)
  }

  const handleCancelDelete = () => {
    if (is_deleting) return
    setSessionToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!session_to_delete) return

    const target_name = get_session_label(session_to_delete)

    try {
      await deleteSession(session_to_delete.id)
      setSessionToDelete(null)
      showActionToast('success', `Sessão ${target_name} excluída.`)
    } catch {
      showActionToast('error', 'Não foi possível excluir a sessão. Tente novamente.')
    }
  }

  const handleRequestFinish = (session: Session) => {
    if (!is_authenticated) return
    setSessionToFinish(session)
  }

  const handleCancelFinish = () => {
    if (is_finishing) return
    setSessionToFinish(null)
  }

  const handleConfirmFinish = async () => {
    if (!session_to_finish) return

    const target_name = get_session_label(session_to_finish)

    try {
      await finishSession(session_to_finish.id)
      setSessionToFinish(null)
      showActionToast('success', `Sessão ${target_name} finalizada.`)
    } catch {
      showActionToast('error', 'Não foi possível finalizar a sessão. Tente novamente.')
    }
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
                onDelete={is_authenticated ? () => handleRequestDelete(session) : undefined}
                is_deleting={is_deleting && deleting_id === session.id}
                onFinish={is_authenticated ? () => handleRequestFinish(session) : undefined}
                is_finishing={is_finishing && finishing_id === session.id}
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

      {session_to_delete && (
        <ConfirmDeleteSessionModal
          session={session_to_delete}
          is_deleting={is_deleting}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}

      {session_to_finish && (
        <ConfirmFinishSessionModal
          session={session_to_finish}
          is_finishing={is_finishing}
          onCancel={handleCancelFinish}
          onConfirm={handleConfirmFinish}
        />
      )}

      {action_toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div
            className={`min-w-64 max-w-sm rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm ${
              action_toast.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-100'
                : 'border-destructive/40 bg-destructive/20 text-red-100'
            }`}
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-medium">{action_toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
