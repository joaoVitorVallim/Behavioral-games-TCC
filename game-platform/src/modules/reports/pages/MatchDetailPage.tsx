import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BarChart3, Swords, UserCircle } from 'lucide-react'
import { Header } from '../../../shared/components/Header'
import { useMatchResult } from '../hooks/useMatchResult'
import {
  compute_totals,
  format_datetime,
  format_player_summary,
  get_sorted_rounds,
  translate_choice
} from '../utils/format'
import {
  build_cooperation_series,
  build_points_series
} from '../utils/chart-data'
import { PointsChart } from '../components/PointsChart'
import { CooperationChart } from '../components/CooperationChart'
import { get_session_label } from '../../game-session/utils/session-label'
import type { PlayerResultWithRole } from '../types'

export function MatchDetailPage() {
  const { sessionId, matchId } = useParams<{ sessionId: string; matchId: string }>()
  const navigate = useNavigate()
  const root_ref = useRef<HTMLDivElement | null>(null)
  const { data, is_loading, is_error } = useMatchResult(sessionId, matchId)

  useEffect(() => {
    if (!root_ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-match="players"], [data-match="rounds"], [data-match="graph"]',
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

  const player_by_role = useMemo(() => {
    const map: Record<'player1' | 'player2', PlayerResultWithRole | null> = {
      player1: null,
      player2: null
    }
    if (!data) return map
    for (const player of data.players) {
      map[player.role] = player
    }
    return map
  }, [data])

  const sorted_rounds = useMemo(
    () => (data ? get_sorted_rounds(data.match.moves) : []),
    [data]
  )

  const totals = useMemo(
    () => (data ? compute_totals(data.match.moves) : { player1: 0, player2: 0 }),
    [data]
  )

  return (
    <div ref={root_ref} className="app-shell">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <button
          type="button"
          onClick={() => navigate(sessionId ? `/reports/${sessionId}` : '/reports')}
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para partidas
        </button>

        {is_loading && (
          <div className="surface-panel py-12 text-center text-sm text-muted-foreground">
            Carregando partida...
          </div>
        )}

        {is_error && (
          <div className="surface-panel py-12 text-center text-sm text-destructive">
            Não foi possível carregar a partida. Tente novamente.
          </div>
        )}

        {!is_loading && !is_error && data && (
          <>
            <section className="surface-panel mb-8 px-6 py-7 md:px-10 md:py-8">
              <div className="mb-3 flex items-center gap-3">
                <Swords className="h-8 w-8 text-primary" />
                <h1 className="text-3xl text-foreground md:text-4xl">Detalhes da Partida</h1>
              </div>
              <p className="text-sm text-muted-foreground md:text-base">
                Sessão{' '}
                <span className="text-foreground">
                  {get_session_label(data.session)}
                </span>{' '}
                · Jogo <span className="text-foreground capitalize">{data.session.game}</span>{' '}
                · Iniciada em{' '}
                <span className="text-foreground">
                  {format_datetime(data.match.created_at)}
                </span>
              </p>
            </section>

            <section
              data-match="players"
              className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              {(['player1', 'player2'] as const).map((role, index) => {
                const player = player_by_role[role]
                const role_label = index === 0 ? 'Jogador 1' : 'Jogador 2'
                const role_total = index === 0 ? totals.player1 : totals.player2

                return (
                  <div key={role} className="surface-panel p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-xl border border-primary/35 bg-primary/10 p-2 text-primary">
                        <UserCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="heading-kicker">Participante</p>
                        <h2 className="text-2xl text-foreground">{role_label}</h2>
                      </div>
                    </div>

                    <div className="surface-subtle mb-4 p-4">
                      <p className="heading-kicker mb-1">Pontuação total</p>
                      <p className="text-3xl font-semibold text-foreground">{role_total}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        {format_player_summary(player)}
                      </p>
                      {player?.course && (
                        <p className="text-xs text-muted-foreground">Curso: {player.course}</p>
                      )}
                      {player?.profession && (
                        <p className="text-xs text-muted-foreground">
                          Profissão: {player.profession}
                        </p>
                      )}
                      {player?.age !== null && player?.age !== undefined && (
                        <p className="text-xs text-muted-foreground">Idade: {player.age}</p>
                      )}
                      {player?.gender && (
                        <p className="text-xs text-muted-foreground">Gênero: {player.gender}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </section>

            <section data-match="rounds" className="surface-panel mb-8 p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-2xl text-foreground md:text-3xl">Rodadas</h2>
                <span className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {sorted_rounds.length}{' '}
                  {sorted_rounds.length === 1 ? 'rodada' : 'rodadas'}
                </span>
              </div>

              {sorted_rounds.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Nenhuma rodada registrada nesta partida.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border/80">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-secondary/35 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Rodada</th>
                        <th className="px-4 py-3 font-semibold">Jogador 1 – Escolha</th>
                        <th className="px-4 py-3 font-semibold">Jogador 1 – Pontos</th>
                        <th className="px-4 py-3 font-semibold">Jogador 2 – Escolha</th>
                        <th className="px-4 py-3 font-semibold">Jogador 2 – Pontos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted_rounds.map((round) => {
                        const move = data.match.moves[String(round)]
                        return (
                          <tr
                            key={round}
                            className="border-t border-border/70 bg-card/35"
                          >
                            <td className="px-4 py-3 font-medium text-foreground">{round}</td>
                            <td className="px-4 py-3 text-foreground">
                              {translate_choice(move.player1Choice)}
                            </td>
                            <td className="px-4 py-3 text-foreground">{move.player1Points}</td>
                            <td className="px-4 py-3 text-foreground">
                              {translate_choice(move.player2Choice)}
                            </td>
                            <td className="px-4 py-3 text-foreground">{move.player2Points}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border bg-secondary/45 font-semibold text-foreground">
                        <td className="px-4 py-3">Total</td>
                        <td className="px-4 py-3 text-muted-foreground">—</td>
                        <td className="px-4 py-3">{totals.player1}</td>
                        <td className="px-4 py-3 text-muted-foreground">—</td>
                        <td className="px-4 py-3">{totals.player2}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </section>

            <section data-match="graph" className="surface-panel p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl text-foreground md:text-3xl">Gráficos</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {(['player1', 'player2'] as const).map((role, index) => {
                  const role_label = index === 0 ? 'Jogador 1' : 'Jogador 2'
                  const points_data = build_points_series(data.match.moves, role)
                  const cooperation_data = build_cooperation_series(data.match.moves, role)

                  return (
                    <div key={role} className="surface-subtle p-5">
                      <h3 className="mb-4 text-lg font-semibold text-foreground">
                        {role_label}
                      </h3>

                      <div className="mb-6">
                        <p className="heading-kicker mb-2">Pontos versus Rodadas</p>
                        <PointsChart data={points_data} />
                      </div>

                      <div>
                        <p className="heading-kicker mb-2">Cooperação e Competição</p>
                        <CooperationChart data={cooperation_data} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
