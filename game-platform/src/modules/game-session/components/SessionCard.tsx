import type { Session } from '../types'

interface SessionCardProps {
  session: Session
  onEnter: () => void
}

export const SessionCard = ({ session, onEnter }: SessionCardProps) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary transition-all">
      <div className="flex gap-4 mb-3">
        <div className="flex-shrink-0">
          <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="14" rx="2" strokeWidth="2"/>
              <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-card-foreground font-semibold text-base leading-tight mb-1">{session.title}</h3>
          <p className="text-muted-foreground text-xs">{session.subtitle}</p>
        </div>

        <div className="flex-shrink-0">
          <span className="px-3 py-1 text-[10px] rounded-full bg-transparent border border-primary text-primary">
            {session.category}
          </span>
        </div>
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed mb-6">
        {session.description}
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
            {session.date}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {session.team}
          </span>
        </div>
        
        <button
          onClick={onEnter}
          className="px-8 py-2.5 bg-primary hover:opacity-90 text-primary-foreground rounded-lg text-sm font-medium transition-opacity"
        >
          Entrar
        </button>
      </div>
    </div>
  )
}
