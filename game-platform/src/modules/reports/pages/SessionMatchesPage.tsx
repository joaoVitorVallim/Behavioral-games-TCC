import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  RefreshCw,
  Swords,
  Users
} from 'lucide-react'
import { Header } from '../../../shared/components/Header'
import { useSessionResults } from '../hooks/useSessionResults'
import {
  compute_totals,
  format_date,
  format_datetime,
  format_player_summary
} from '../utils/format'
import { get_session_label } from '../../game-session/utils/session-label'
import type { PlayerResult } from '../types'

export function SessionMatchesPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const root_ref = useRef<HTMLDivElement | null>(null)
  const { data, is_loading, is_fetching, is_error, refetch } = useSessionResults(sessionId)

  useEffect(() => {
    if (!root_ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-session="header"], [data-session="matches"]',
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
  }, [data])

  const players_by_id = useMemo(() => {
    const map = new Map<string, PlayerResult>()
    if (!data) return map
    for (const player of data.players) {
      map.set(player.id, player)
    }
    return map
  }, [data])

  const handleOpenMatch = (matchId: string) => {
    if (!sessionId) return
    navigate(`/reports/${sessionId}/matches/${matchId}`)
  }

  return (
    <div ref={root_ref} className="app-shell">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <button
          type="button"
          onClick={() => navigate('/reports')}
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para relatórios
        </button>

        {is_loading && (
          <div className="surface-panel py-12 text-center text-sm text-muted-foreground">
            Carregando dados da sessão...
          </div>
        )}

        {is_error && (
          <div className="surface-panel py-12 text-center text-sm text-destructive">
            Não foi possível carregar a sessão. Tente novamente.
          </div>
        )}

        {!is_loading && !is_error && data && (
          <>
            <section
              data-session="header"
              className="surface-panel mb-8 px-6 py-7 md:px-10 md:py-8"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <FileText className="h-9 w-9 text-primary" />
                    <h1 className="text-3xl text-foreground md:text-4xl">
                      {get_session_label(data.session)}
                    </h1>
                  </div>
                  <p className="text-sm text-muted-foreground md:text-base">
                    Código: <span className="text-foreground">{data.session.inviteCode}</span> · Jogo:{' '}
                    <span className="text-foreground capitalize">{data.session.game}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={is_fetching}
                  className="btn-secondary w-full md:w-auto"
                >
                  <RefreshCw className={`h-4 w-4 ${is_fetching ? 'animate-spin' : ''}`} />
                  Recarregar
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="surface-subtle p-4">
                  <p className="heading-kicker mb-1">Criada em</p>
                  <p className="text-sm font-medium text-foreground">
                    {format_datetime(data.session.created_at)}
                  </p>
                </div>
                <div className="surface-subtle p-4">
                  <p className="heading-kicker mb-1">Finalizada em</p>
                  <p className="text-sm font-medium text-foreground">
                    {format_datetime(data.session.finished_at)}
                  </p>
                </div>
                <div className="surface-subtle p-4">
                  <p className="heading-kicker mb-1">Status</p>
                  <p className="text-sm font-medium text-foreground">
                    {data.session.isActive ? 'Ativa' : 'Finalizada'}
                  </p>
                </div>
                <div className="surface-subtle p-4">
                  <p className="heading-kicker mb-1">Docente</p>
                  <p className="text-sm font-medium text-foreground">
                    {data.session.createdBy?.name ?? '—'}
                  </p>
                </div>
              </div>

              <div className="mt-4 surface-subtle p-4">
                <p className="heading-kicker mb-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Jogadores
                  </span>
                </p>
                <p className="text-sm text-foreground">
                  {data.players.length}{' '}
                  {data.players.length === 1 ? 'participante' : 'participantes'}
                </p>
              </div>
            </section>

            <section data-session="matches" className="surface-panel p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Swords className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl text-foreground md:text-3xl">Partidas</h2>
                </div>
                <span className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {data.matches.length}{' '}
                  {data.matches.length === 1 ? 'partida' : 'partidas'}
                </span>
              </div>

              {data.matches.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Nenhuma partida registrada nesta sessão.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border/80">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-secondary/35 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Jogador 1</th>
                        <th className="px-4 py-3 font-semibold">Jogador 2</th>
                        <th className="px-4 py-3 font-semibold">Rodadas</th>
                        <th className="px-4 py-3 font-semibold">Placar</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 text-right font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.matches.map((match) => {
                        const player1 = players_by_id.get(match.player1_id) ?? null
                        const player2 = players_by_id.get(match.player2_id) ?? null
                        const totals = compute_totals(match.moves)
                        const rounds_played = Object.keys(match.moves).length

                        return (
                          <tr
                            key={match.id}
                            className="border-t border-border/70 bg-card/35 transition-colors hover:bg-card/60"
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-foreground">Jogador 1</p>
                              <p className="text-xs text-muted-foreground">
                                {format_player_summary(player1)}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-foreground">Jogador 2</p>
                              <p className="text-xs text-muted-foreground">
                                {format_player_summary(player2)}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-foreground">{rounds_played}</td>
                            <td className="px-4 py-3 text-foreground font-medium">
                              {totals.player1} <span className="text-muted-foreground">x</span>{' '}
                              {totals.player2}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground capitalize">
                              {match.status}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleOpenMatch(match.id)}
                                  className="btn-primary px-3 py-2"
                                >
                                  Detalhes
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="mt-4 text-xs text-muted-foreground">
                Criada em {format_date(data.session.created_at)}
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
