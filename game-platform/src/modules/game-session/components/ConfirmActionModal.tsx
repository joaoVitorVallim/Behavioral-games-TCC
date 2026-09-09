import { AlertTriangle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ConfirmActionTone = 'destructive' | 'success'

interface ConfirmActionModalProps {
  icon: LucideIcon
  title: string
  description: string
  tone: ConfirmActionTone
  session_label: string
  session_game: string
  confirm_label: string
  confirming_label: string
  is_confirming: boolean
  onCancel: () => void
  onConfirm: () => void
  /** Extra warning block — only the delete flow uses this, for an active session. */
  warning?: { title: string; message: string }
}

const TONE_STYLES: Record<ConfirmActionTone, { icon: string; confirm: string }> = {
  destructive: {
    icon: 'border-destructive/40 bg-destructive/10 text-destructive',
    confirm: 'border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/25'
  },
  success: {
    icon: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
    confirm: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25'
  }
}

/**
 * Merges ConfirmDeleteSessionModal and ConfirmFinishSessionModal, which were
 * near-identical (same chrome, close button, session-info block, button row —
 * differing only in icon/color/copy and delete's extra active-session warning).
 */
export function ConfirmActionModal({
  icon: Icon,
  title,
  description,
  tone,
  session_label,
  session_game,
  confirm_label,
  confirming_label,
  is_confirming,
  onCancel,
  onConfirm,
  warning
}: ConfirmActionModalProps) {
  const styles = TONE_STYLES[tone]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-title"
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
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${styles.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h2 id="confirm-action-title" className="text-xl text-foreground">
            {title}
          </h2>
        </div>

        <p className="mb-2 text-sm text-muted-foreground">{description}</p>

        <div className={`surface-subtle mt-4 p-4 ${warning ? 'mb-4' : 'mb-6'}`}>
          <p className="heading-kicker mb-1">Sessão</p>
          <p className="text-sm font-medium text-foreground">{session_label}</p>
          <p className="mt-1 text-xs text-muted-foreground capitalize">{session_game}</p>
        </div>

        {warning && (
          <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {warning.title}
            </div>
            <p className="text-xs leading-relaxed text-destructive/90">{warning.message}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={is_confirming}
            className="btn-secondary w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={is_confirming}
            className={`w-full rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto ${styles.confirm}`}
          >
            {is_confirming ? confirming_label : confirm_label}
          </button>
        </div>
      </div>
    </div>
  )
}
