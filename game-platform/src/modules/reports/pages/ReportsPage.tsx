import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useNavigate } from 'react-router-dom'
import { FileText, RefreshCw, Users, ChevronRight } from 'lucide-react'
import { Header } from '../../../shared/components/Header'
import { useSessionsResults } from '../hooks/useSessionsResults'
import { format_date } from '../utils/format'
import { get_session_label } from '../../game-session/utils/session-label'

export function ReportsPage() {
  const navigate = useNavigate()
  const root_ref = useRef<HTMLDivElement | null>(null)
  const { sessions, is_loading, is_fetching, is_error, refetch } = useSessionsResults()

  useEffect(() => {
    if (!root_ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-reports="title"], [data-reports="table"]',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.08
        }
      )
    }, root_ref)

    return () => ctx.revert()
  }, [])

  const handleOpenSession = (sessionId: string) => {
    navigate(`/reports/${sessionId}`)
  }

  return (
    <div ref={root_ref} className="app-shell">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <section data-reports="title" className="surface-panel mb-8 px-6 py-7 md:px-10 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <FileText className="h-9 w-9 text-primary" />
                <h1 className="text-4xl text-foreground md:text-5xl">Relatórios</h1>
              </div>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                Selecione uma sessão para visualizar os resultados das partidas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={is_fetching}
              className="btn-secondary w-full md:w-auto"
              title="Recarregar sessões"
            >
              <RefreshCw className={`h-4 w-4 ${is_fetching ? 'animate-spin' : ''}`} />
              Recarregar
            </button>
          </div>
        </section>

        <section data-reports="table" className="surface-panel p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-2xl text-foreground md:text-3xl">Sessões</h2>
            {!is_loading && !is_error && (
              <span className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                {sessions.length} {sessions.length === 1 ? 'sessão' : 'sessões'}
              </span>
            )}
          </div>

          {is_loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Carregando sessões...
            </div>
          ) : is_error ? (
            <div className="py-12 text-center text-sm text-destructive">
              Não foi possível carregar as sessões. Tente novamente.
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma sessão encontrada.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/80">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-secondary/35 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Sessão</th>
                    <th className="px-4 py-3 font-semibold">Jogo</th>
                    <th className="px-4 py-3 font-semibold">Criada em</th>
                    <th className="px-4 py-3 font-semibold">Participantes</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-t border-border/70 bg-card/35 transition-colors hover:bg-card/60"
                    >
                      <td className="px-4 py-3 text-foreground">
                        <p className="font-medium">{get_session_label(session)}</p>
                        <p className="text-xs text-muted-foreground">
                          Código: {session.inviteCode}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">
                        {session.game}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format_date(session.created_at)}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          {session.playersCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {session.isActive ? (
                          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            Ativa
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                            Finalizada
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenSession(session.id)}
                            className="btn-primary px-3 py-2"
                          >
                            Ver partidas
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
