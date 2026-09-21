import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SessionCard } from '../components/SessionCard'
import { SessionCardSkeleton } from '../components/SessionCardSkeleton'
import { ConfirmActionModal } from '../components/ConfirmActionModal'
import { Header } from '../../../shared/components/Header'
import { Toast } from '../../../shared/components/Toast'
import { useSessions } from '../hooks/useSessions'
import { useAuth } from '../../auth/hooks/useAuth'
import { useGsapReveal } from '../../../shared/hooks/useGsapReveal'
import { useToast } from '../../../shared/hooks/useToast'
import { get_session_label } from '../utils/session-label'
import { RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react'
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
  const [session_to_delete, setSessionToDelete] = useState<Session | null>(null)
  const [session_to_finish, setSessionToFinish] = useState<Session | null>(null)
  const { toast, showToast } = useToast()

  useEffect(() => {
    if (!location.state || typeof location.state !== 'object') return

    const refresh_sessions = (location.state as { refresh_sessions?: boolean }).refresh_sessions

    if (!refresh_sessions) return

    void refetch()
    navigate('/sessions', { replace: true })
  }, [location.state, refetch, navigate])

  useGsapReveal('[data-session-card="true"]', {
    deps: [is_loading, sessions],
    y: 20,
    duration: 0.55,
    stagger: 0.08
  })

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
      showToast('success', `Sessão ${target_name} excluída.`)
    } catch {
      showToast('error', 'Não foi possível excluir a sessão. Tente novamente.')
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
      showToast('success', `Sessão ${target_name} finalizada.`)
    } catch {
      showToast('error', 'Não foi possível finalizar a sessão. Tente novamente.')
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
              <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                Aqui estão as sessões criadas por você. Acompanhe o andamento das partidas e gerencie cada sessão.
              </p>
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
                onDelete={is_authenticated ? () => handleRequestDelete(session) : undefined}
                is_deleting={is_deleting && deleting_id === session.id}
                onFinish={is_authenticated ? () => handleRequestFinish(session) : undefined}
                is_finishing={is_finishing && finishing_id === session.id}
              />
            ))}
          </div>
        )}
      </main>

      {session_to_delete && (
        <ConfirmActionModal
          icon={AlertTriangle}
          title="Excluir sessão"
          description="Tem certeza que deseja excluir a sessão abaixo? Esta ação não pode ser desfeita."
          tone="destructive"
          session_label={get_session_label(session_to_delete)}
          session_game={session_to_delete.game}
          confirm_label="Excluir"
          confirming_label="Excluindo..."
          is_confirming={is_deleting}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          warning={
            session_to_delete.isActive
              ? {
                  title: 'Sessão em andamento',
                  message: 'Esta sessão está ativa. Excluir agora pode interromper partidas que estão sendo jogadas e desconectar os participantes.'
                }
              : undefined
          }
        />
      )}

      {session_to_finish && (
        <ConfirmActionModal
          icon={CheckCircle2}
          title="Finalizar sessão"
          description="Após finalizada, a sessão não aceitará mais novos participantes nem novas partidas. Esta ação não pode ser desfeita."
          tone="success"
          session_label={get_session_label(session_to_finish)}
          session_game={session_to_finish.game}
          confirm_label="Finalizar"
          confirming_label="Finalizando..."
          is_confirming={is_finishing}
          onCancel={handleCancelFinish}
          onConfirm={handleConfirmFinish}
        />
      )}

      <Toast toast={toast} />
    </div>
  )
}
