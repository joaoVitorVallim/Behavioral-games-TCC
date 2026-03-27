import type { Session } from '../types'

interface SessionCardProps {
  session: Session
  onEnter: () => void
}

export const SessionCard = ({ session, onEnter }: SessionCardProps) => {
  return (
    <article data-session-card="true" className="surface-panel group p-6 transition-transform duration-300 hover:-translate-y-1">
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
            {session.settings.configName}
          </h3>
          <p className="heading-kicker text-[0.62rem]">
            {session.game}
          </p>
        </div>
      </div>

      <p className="mb-6 text-xs leading-relaxed text-muted-foreground">
        Criado por {session.user.name} • {session.players.length} jogadores
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
            </svg>
            {new Date(session.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
        
        <button
          onClick={onEnter}
          className="btn-primary px-6 py-2.5"
        >
          Entrar
        </button>
      </div>
    </article>
  )
}
