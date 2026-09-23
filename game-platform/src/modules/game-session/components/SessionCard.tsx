import { useCallback, useRef, useState } from 'react'
import { CheckCircle2, MoreVertical, Trash2, Users } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useClickOutside } from '../../../shared/hooks/useClickOutside'
import { get_session_label } from '../utils/session-label'
import type { Session } from '../types'

interface SessionCardProps {
  session: Session
  onDelete?: () => void
  is_deleting?: boolean
  onFinish?: () => void
  is_finishing?: boolean
}

export const SessionCard = ({
  session,
  onDelete,
  is_deleting = false,
  onFinish,
  is_finishing = false
}: SessionCardProps) => {
  const { is_authenticated } = useAuth()
  const can_delete = is_authenticated && !!onDelete
  const can_finish = is_authenticated && !!onFinish && session.isActive
  const [is_menu_open, setIsMenuOpen] = useState(false)
  const menu_ref = useRef<HTMLDivElement>(null)

  useClickOutside(menu_ref, useCallback(() => setIsMenuOpen(false), []), is_menu_open)

  const handleDeleteClick = () => {
    setIsMenuOpen(false)
    onDelete?.()
  }

  return (
    <article data-session-card="true" className="surface-panel group flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1">
      <div className="mb-3 flex gap-4">
        <div className="shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/12">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="14" rx="2" strokeWidth="2"/>
              <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="mb-1 text-base leading-tight text-card-foreground">
            {get_session_label(session)}
          </h3>
          <p className="heading-kicker text-[0.62rem]">
            {session.game}
          </p>
        </div>

        <div className="flex shrink-0 items-start gap-2">
          {can_delete && !session.isActive && (
            <button
              type="button"
              onClick={onDelete}
              disabled={is_deleting}
              aria-label="Excluir sessão"
              title="Excluir sessão"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-destructive/40 bg-destructive/15 text-destructive transition-colors hover:bg-destructive/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          {can_delete && can_finish && (
            <div className="relative shrink-0" ref={menu_ref}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-label="Mais opções"
                aria-expanded={is_menu_open}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-card/65 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {is_menu_open && (
                <div className="surface-panel absolute right-0 z-10 mt-2 w-44 p-1.5">
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={is_deleting}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {is_deleting ? 'Excluindo...' : 'Excluir sessão'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        Criado por {session.user.name}
      </p>

      <div className={`${can_finish ? 'mb-6 ' : ''}flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm font-medium text-foreground`}>
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
          </svg>
          {new Date(session.created_at).toLocaleDateString('pt-BR')}
        </span>
        <span className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          {session.players.length} jogadores
        </span>
      </div>

      {can_finish && (
        <button
          type="button"
          onClick={onFinish}
          disabled={is_finishing}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/15 px-4 py-3 text-sm font-semibold text-destructive transition-all hover:scale-[1.02] hover:bg-destructive/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          <CheckCircle2 className="h-4 w-4" />
          Finalizar Sessão
        </button>
      )}
    </article>
  )
}
