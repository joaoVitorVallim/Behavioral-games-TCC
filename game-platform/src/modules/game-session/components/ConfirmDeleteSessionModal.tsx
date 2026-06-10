import { AlertTriangle } from 'lucide-react'
import { get_session_label } from '../utils/session-label'
import type { Session } from '../types'

interface ConfirmDeleteSessionModalProps {
  session: Session
  is_deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDeleteSessionModal({
  session,
  is_deleting,
  onCancel,
  onConfirm
}: ConfirmDeleteSessionModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div
        className="surface-panel relative w-full max-w-md p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Fechar"
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center text-xl leading-none text-muted-foreground transition-all hover:scale-125 hover:text-foreground"
        >
          ✕
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 id="confirm-delete-title" className="text-xl text-foreground">
            Excluir sessão
          </h2>
        </div>

        <p className="mb-2 text-sm text-muted-foreground">
          Tem certeza que deseja excluir a sessão abaixo? Esta ação não pode ser desfeita.
        </p>

        <div className="surface-subtle mb-4 mt-4 p-4">
          <p className="heading-kicker mb-1">Sessão</p>
          <p className="text-sm font-medium text-foreground">
            {get_session_label(session)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground capitalize">{session.game}</p>
        </div>

        {session.isActive && (
          <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Sessão em andamento
            </div>
            <p className="text-xs leading-relaxed text-destructive/90">
              Esta sessão está ativa. Excluir agora pode interromper partidas que estão sendo jogadas e desconectar os participantes.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={is_deleting}
            className="btn-secondary w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={is_deleting}
            className="w-full rounded-xl border border-destructive/40 bg-destructive/15 px-5 py-2.5 text-sm font-semibold text-destructive transition-all hover:scale-[1.02] hover:bg-destructive/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto"
          >
            {is_deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}
