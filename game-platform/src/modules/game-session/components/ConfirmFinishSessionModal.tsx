import { CheckCircle2 } from 'lucide-react'
import { get_session_label } from '../utils/session-label'
import type { Session } from '../types'

interface ConfirmFinishSessionModalProps {
  session: Session
  is_finishing: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmFinishSessionModal({
  session,
  is_finishing,
  onCancel,
  onConfirm
}: ConfirmFinishSessionModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-finish-title"
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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h2 id="confirm-finish-title" className="text-xl text-foreground">
            Finalizar sessão
          </h2>
        </div>

        <p className="mb-2 text-sm text-muted-foreground">
          Após finalizada, a sessão não aceitará mais novos participantes nem novas partidas. Esta ação não pode ser desfeita.
        </p>

        <div className="surface-subtle mb-6 mt-4 p-4">
          <p className="heading-kicker mb-1">Sessão</p>
          <p className="text-sm font-medium text-foreground">{get_session_label(session)}</p>
          <p className="mt-1 text-xs text-muted-foreground capitalize">{session.game}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={is_finishing}
            className="btn-secondary w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={is_finishing}
            className="w-full rounded-xl border border-emerald-400/40 bg-emerald-400/15 px-5 py-2.5 text-sm font-semibold text-emerald-200 transition-all hover:scale-[1.02] hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto"
          >
            {is_finishing ? 'Finalizando...' : 'Finalizar'}
          </button>
        </div>
      </div>
    </div>
  )
}
