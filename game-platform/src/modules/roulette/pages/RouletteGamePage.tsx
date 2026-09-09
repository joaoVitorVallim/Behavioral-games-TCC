import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Header } from '../../../shared/components/Header'
import {
  RouletteApiError,
  finishRouletteMatch,
  getRouletteMatchState,
  joinRouletteMatch,
  spinRouletteMatch,
} from '../api/rouletteClient'
import { RouletteStore } from '../store/rouletteStore'
import { RouletteWheel } from '../components/RouletteWheel'
import { WHEEL_COLOR_META, WHEEL_SPIN_SECONDS, computeTargetRotation } from '../config/wheel'
import type { RouletteGameOverSummary, RouletteGameState, RouletteMoveOption } from '../types/roulette'

type StatusTone = 'neutral' | 'accent' | 'warn' | 'win' | 'lose'

const STATUS_DOT_CLASS: Record<StatusTone, string> = {
  neutral: 'bg-border',
  accent: 'bg-primary',
  warn: 'bg-amber-400',
  win: 'bg-success',
  lose: 'bg-destructive',
}

const BET_OPTIONS: RouletteMoveOption[] = ['azul', 'vermelho', 'preto']

function clampBet(value: number, coins: number): number {
  if (coins <= 0) {
    return 0
  }
  return Math.max(1, Math.min(coins, value))
}

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(clamped / 60).toString().padStart(2, '0')
  const seconds = (clamped % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

function formatSessionCode(matchId: string): string {
  const trimmed = matchId.replace(/-/g, '').slice(-8).toUpperCase()
  return trimmed || matchId
}

export function RouletteGamePage() {
  const location = useLocation()
  const navigate = useNavigate()

  const search_params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const matchId =
    search_params.get('matchId') ||
    sessionStorage.getItem('matchId') ||
    localStorage.getItem('matchId') ||
    ''
  const playerId =
    search_params.get('playerId') ||
    sessionStorage.getItem('playerId') ||
    localStorage.getItem('playerId') ||
    ''

  const storeRef = useRef(new RouletteStore())
  const hasEndedRef = useRef(false)
  const isProcessingRef = useRef(false)
  const pendingTimeoutRef = useRef(false)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stopwatchRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextRoundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [gameState, setGameState] = useState<RouletteGameState | null>(null)
  const [initialCoins, setInitialCoins] = useState<number | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<RouletteMoveOption | null>(null)
  const [bet, setBet] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [status, setStatus] = useState('Preparando mesa de roleta...')
  const [statusTone, setStatusTone] = useState<StatusTone>('neutral')
  const [toast, setToast] = useState<string | null>(null)
  const [summary, setSummary] = useState<RouletteGameOverSummary | null>(null)

  useEffect(() => {
    isProcessingRef.current = isProcessing
  }, [isProcessing])

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const resolveError = useCallback((error: unknown, fallback: string): string => {
    return error instanceof RouletteApiError ? error.message : fallback
  }, [])

  const finishMatch = useCallback(
    async (timedOut: boolean) => {
      if (hasEndedRef.current) {
        return
      }
      hasEndedRef.current = true
      setIsProcessing(false)
      setIsSpinning(false)

      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
      if (stopwatchRef.current) {
        clearInterval(stopwatchRef.current)
        stopwatchRef.current = null
      }

      const finalState = storeRef.current.markFinished()
      setGameState(finalState)

      try {
        await finishRouletteMatch(finalState.matchId)
      } catch (error) {
        showToast(resolveError(error, 'Erro ao encerrar sessão no servidor.'))
      }

      setSummary(storeRef.current.buildGameOverSummary(timedOut))
    },
    [resolveError, showToast]
  )

  const handleTimeExpired = useCallback(() => {
    if (hasEndedRef.current) {
      return
    }
    if (isProcessingRef.current) {
      pendingTimeoutRef.current = true
      return
    }
    setStatus('Tempo esgotado. Encerrando sessão...')
    setStatusTone('warn')
    void finishMatch(true)
  }, [finishMatch])

  const startCountdown = useCallback(() => {
    if (countdownRef.current) {
      return
    }
    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) {
          return prev
        }
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current)
            countdownRef.current = null
          }
          handleTimeExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [handleTimeExpired])

  const startStopwatch = useCallback(() => {
    if (stopwatchRef.current) {
      return
    }
    stopwatchRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
  }, [])

  useEffect(() => {
    if (!matchId || !playerId) {
      return
    }

    let cancelled = false

    async function join() {
      try {
        let response = await joinRouletteMatch(matchId, playerId)

        if (response.status === 'finished') {
          response = await getRouletteMatchState(matchId)
        }

        if (cancelled) {
          return
        }

        const snapshot = storeRef.current.applyJoin(response)
        setInitialCoins(snapshot.coins)
        setGameState(snapshot)
        setBet(clampBet(10, snapshot.coins))
        setStatus('Selecione uma condição e defina a magnitude para iniciar o ensaio.')
        setStatusTone('neutral')

        if (snapshot.timeLimit !== null) {
          setRemainingSeconds(snapshot.timeLimit)
          startCountdown()
        } else {
          startStopwatch()
        }

        if (snapshot.status === 'finished') {
          await finishMatch(false)
        }
      } catch (error) {
        if (cancelled) {
          return
        }
        setLoadError(resolveError(error, 'Não foi possível inicializar a partida.'))
      }
    }

    void join()

    return () => {
      cancelled = true
    }
  }, [matchId, playerId, startCountdown, startStopwatch, finishMatch, resolveError])

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (stopwatchRef.current) clearInterval(stopwatchRef.current)
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current)
      if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current)
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  const handleSpin = useCallback(async () => {
    if (isSpinning || isProcessing || hasEndedRef.current || !gameState) {
      return
    }

    if (!selectedOption) {
      setStatus('Nenhuma condição selecionada — escolha uma cor antes de executar.')
      setStatusTone('warn')
      return
    }

    if (bet <= 0 || bet > gameState.coins) {
      setStatus('Fichas insuficientes para esta magnitude.')
      setStatusTone('warn')
      return
    }

    setIsProcessing(true)
    setIsSpinning(true)
    setStatus('Ensaio em curso — aguardando leitura do setor.')
    setStatusTone('accent')

    const coinsBeforeSpin = gameState.coins

    try {
      const response = await spinRouletteMatch(gameState.matchId, {
        playerId: gameState.playerId,
        opcao: selectedOption,
        aposta: bet,
      })

      console.debug('[roulette] telemetry', {
        round: response.round,
        winProbability: response.winProbability,
      })

      setRotation((prev) => computeTargetRotation(prev, response.opcao))

      await new Promise<void>((resolve) => {
        spinTimeoutRef.current = setTimeout(resolve, WHEEL_SPIN_SECONDS * 1000 + 150)
      })

      const snapshot = storeRef.current.applySpin(response)
      setGameState(snapshot)

      const gain = response.coinsAmount - coinsBeforeSpin
      const meta = WHEEL_COLOR_META[response.opcao]

      if (response.won) {
        setStatus(`Resposta reforçada — setor ${meta.label}. Ganho de ${gain} fichas.`)
        setStatusTone('win')
      } else {
        setStatus(`Sem reforço — setor ${meta.label}. Perda de ${bet} fichas.`)
        setStatusTone('lose')
      }

      setBet((prev) => clampBet(prev, snapshot.coins))
      setIsSpinning(false)

      if (response.matchFinished || pendingTimeoutRef.current) {
        await finishMatch(pendingTimeoutRef.current)
        return
      }

      nextRoundTimeoutRef.current = setTimeout(() => {
        setIsProcessing(false)
        setStatus('Nova rodada: escolha uma condição e defina a magnitude.')
        setStatusTone('neutral')
      }, 900)
    } catch (error) {
      setIsSpinning(false)
      setIsProcessing(false)
      showToast(resolveError(error, 'Falha ao girar a roleta.'))
      setStatus('Erro no ensaio. Tente novamente.')
      setStatusTone('warn')
    }
  }, [isSpinning, isProcessing, gameState, selectedOption, bet, finishMatch, resolveError, showToast])

  const handleManualFinish = useCallback(() => {
    if (hasEndedRef.current || isProcessing || !gameState) {
      return
    }
    setStatus('Encerrando sessão por solicitação do jogador...')
    setStatusTone('neutral')
    void finishMatch(false)
  }, [isProcessing, gameState, finishMatch])

  const handlePickOption = useCallback(
    (option: RouletteMoveOption) => {
      if (isProcessing || hasEndedRef.current) {
        return
      }
      setSelectedOption(option)
      setStatus(`Condição ${WHEEL_COLOR_META[option].label} selecionada. Defina a magnitude e execute.`)
      setStatusTone('neutral')
    },
    [isProcessing]
  )

  const incrementBet = useCallback(() => {
    if (isProcessing || hasEndedRef.current || !gameState) {
      return
    }
    setBet((prev) => clampBet(prev + 1, gameState.coins))
  }, [isProcessing, gameState])

  const decrementBet = useCallback(() => {
    if (isProcessing || hasEndedRef.current || !gameState) {
      return
    }
    setBet((prev) => clampBet(prev - 1, gameState.coins))
  }, [isProcessing, gameState])

  const freqs = useMemo(() => {
    const history = gameState?.moveHistory ?? []
    const total = history.length

    return BET_OPTIONS.map((option) => {
      const count = history.filter((entry) => entry.opcao === option).length
      const pct = total ? (count / total) * 100 : 0
      return { option, meta: WHEEL_COLOR_META[option], count, total, pct }
    })
  }, [gameState])

  const logRows = useMemo(() => {
    const history = gameState?.moveHistory ?? []
    const baseline = initialCoins ?? 0

    const rows = history.map((entry, index) => {
      const prevCoins = index === 0 ? baseline : history[index - 1].coinsAmount
      return { ...entry, delta: entry.coinsAmount - prevCoins }
    })

    return rows.slice().reverse().slice(0, 6)
  }, [gameState, initialCoins])

  if (!matchId || !playerId) {
    const missing = [!matchId ? 'matchId' : null, !playerId ? 'playerId' : null].filter(Boolean).join(', ')

    return (
      <div className="app-shell">
        <Header />
        <main className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-5 py-24 text-center md:px-8">
          <div className="surface-panel w-full p-10">
            <h1 className="mb-4 text-3xl text-foreground">Parâmetros ausentes</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Não foi possível iniciar a sessão da roleta porque faltam: <strong className="text-foreground">{missing}</strong>.
            </p>
            <p className="mt-3 font-data text-xs text-muted-foreground">
              Exemplo: /roulette/game?matchId=...&playerId=...
            </p>
          </div>
        </main>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="app-shell">
        <Header />
        <main className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-5 py-24 text-center md:px-8">
          <div className="surface-panel w-full p-10">
            <h1 className="mb-4 text-3xl text-foreground">Não foi possível iniciar o ensaio</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{loadError}</p>
          </div>
        </main>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="app-shell">
        <Header />
        <main className="flex min-h-[70vh] items-center justify-center px-5">
          <p className="text-sm text-muted-foreground">Preparando mesa de roleta...</p>
        </main>
      </div>
    )
  }

  const isFinished = gameState.status === 'finished'
  const clockValue = remainingSeconds !== null ? formatClock(remainingSeconds) : formatClock(elapsedSeconds)

  return (
    <div className="app-shell">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="flex flex-col gap-6">
          <section className="surface-panel flex flex-col gap-6 px-6 py-7 md:flex-row md:items-end md:justify-between md:px-10 md:py-8">
            <div>
              <p className="heading-kicker mb-2">Partida em andamento</p>
              <h2 className="text-4xl text-foreground md:text-5xl">Roleta Tricromática</h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                Três condições em distribuição equiprovável — seis setores, dois por condição. Cada ensaio registra a
                escolha, a magnitude apostada e o resultado.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${isFinished ? 'bg-muted-foreground' : 'bg-primary animate-pulse'}`} />
                <span className="text-[11px] font-medium text-primary">{isFinished ? 'Sessão encerrada' : 'Coletando dados'}</span>
              </span>
              <div className="flex flex-col items-start gap-1 md:items-end">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Código da sessão</span>
                <span className="font-data text-base tracking-[0.2em] text-foreground">{formatSessionCode(gameState.matchId)}</span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="surface-subtle flex flex-col gap-2 p-5">
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Fichas</span>
              <span className="font-display text-3xl text-foreground">{gameState.coins}</span>
            </div>
            <div className="surface-subtle flex flex-col gap-2 p-5">
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Meta</span>
              <span className="font-display text-3xl text-primary">{gameState.pointsLimit}</span>
            </div>
            <div className="surface-subtle flex flex-col gap-2 p-5">
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Ensaios</span>
              <span className="font-display text-3xl text-foreground">{String(gameState.currentRound).padStart(2, '0')}</span>
            </div>
            <div className="surface-subtle flex flex-col gap-2 p-5">
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Duração</span>
              <span className="font-data text-2xl text-orange-400">{clockValue}</span>
            </div>
          </section>

          <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_400px]">
            <div className="surface-panel flex flex-col items-center gap-6 p-8">
              <div className="flex w-full items-baseline justify-between gap-4">
                <h3 className="text-2xl text-foreground">Aparato</h3>
                <span className="font-data text-[11px] text-muted-foreground">
                  sequência sem reforço · {gameState.pityStreak}
                </span>
              </div>

              <RouletteWheel rotation={rotation} spinSeconds={WHEEL_SPIN_SECONDS} />

              <div className="flex w-full items-start gap-3 border-t border-border/70 pt-5">
                <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${STATUS_DOT_CLASS[statusTone]}`} />
                <p className="text-sm leading-relaxed text-muted-foreground">{status}</p>
              </div>
            </div>

            <div className="surface-panel flex flex-col p-7">
              <div className="flex flex-col gap-4 pb-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-data text-xs text-primary">01</span>
                  <span className="text-xl text-foreground">Condição</span>
                </div>
                <div className="flex flex-col gap-2">
                  {BET_OPTIONS.map((option) => {
                    const meta = WHEEL_COLOR_META[option]
                    const active = selectedOption === option

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handlePickOption(option)}
                        disabled={isProcessing}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                          active
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border/80 bg-background/40 text-foreground/90 hover:border-primary/40'
                        }`}
                      >
                        <span className={`h-3.5 w-3.5 flex-none rounded-[4px] border border-white/10 ${meta.swatchClass}`} />
                        <span className="flex-1">{meta.label}</span>
                        {active && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-border/70 py-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-data text-xs text-orange-400">02</span>
                  <span className="text-xl text-foreground">Magnitude</span>
                </div>
                <div className="flex items-stretch overflow-hidden rounded-xl border border-border/80">
                  <button
                    type="button"
                    onClick={decrementBet}
                    disabled={isProcessing}
                    className="w-12 border-r border-border/80 bg-background/40 font-data text-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    −
                  </button>
                  <div className="flex flex-1 items-center justify-center gap-2 py-3">
                    <span className="font-display text-[27px] leading-none text-foreground">{bet}</span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">fichas</span>
                  </div>
                  <button
                    type="button"
                    onClick={incrementBet}
                    disabled={isProcessing}
                    className="w-12 border-l border-border/80 bg-background/40 font-data text-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <p className="font-data text-[11px] text-muted-foreground">limite atual · {gameState.coins} fichas</p>
              </div>

              <div className="flex flex-col gap-3 border-t border-border/70 pt-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-data text-xs text-muted-foreground">03</span>
                  <span className="text-xl text-foreground">Execução</span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSpin()}
                  disabled={isProcessing || gameState.coins <= 0}
                  className="btn-primary w-full py-4 text-xs uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSpinning ? 'Executando…' : 'Executar ensaio'}
                </button>
                <button
                  type="button"
                  onClick={handleManualFinish}
                  disabled={isProcessing}
                  className="btn-secondary w-full py-3 text-[11px] uppercase tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Encerrar sessão
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="surface-panel flex flex-col gap-5 p-7">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-xl text-foreground">Frequência observada</h3>
                <span className="font-data text-[11px] text-muted-foreground">{freqs[0]?.total ?? 0} ensaios</span>
              </div>
              <div className="flex flex-col gap-4">
                {freqs.map((f) => (
                  <div key={f.option} className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-foreground">{f.meta.label}</span>
                      <span className="font-data text-xs text-muted-foreground">
                        {f.count} / {f.total} · {f.total ? f.pct.toFixed(1) : '0.0'}%
                      </span>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-secondary/60">
                      <div
                        className={`h-full rounded-full ${f.meta.swatchClass} transition-[width] duration-500`}
                        style={{ width: `${f.pct}%` }}
                      />
                      <div className="absolute -top-0.5 -bottom-0.5 w-px bg-border" style={{ left: '33.3%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-panel flex flex-col gap-5 p-7">
              <h3 className="text-xl text-foreground">Registro de ensaios</h3>
              <div className="flex flex-col">
                {logRows.length === 0 ? (
                  <p className="max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
                    Nenhum ensaio registrado. O histórico das últimas seis rodadas aparece aqui.
                  </p>
                ) : (
                  logRows.map((row) => (
                    <div
                      key={row.round}
                      className="flex items-center gap-4 border-b border-border/60 py-2.5 last:border-b-0"
                    >
                      <span className="w-7 font-data text-xs text-muted-foreground">
                        {String(row.round).padStart(2, '0')}
                      </span>
                      <span className={`h-2.5 w-2.5 flex-none rounded-[3px] ${WHEEL_COLOR_META[row.opcao].swatchClass}`} />
                      <span className="flex-1 text-sm text-foreground">
                        {WHEEL_COLOR_META[row.opcao].label} · {row.aposta} fichas
                      </span>
                      <span className={`font-data text-xs ${row.delta >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {row.delta >= 0 ? `+${row.delta}` : row.delta}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-md p-8 text-center">
            <p className="heading-kicker mb-3">
              {summary.timedOut ? 'Tempo encerrado' : summary.reachedTarget ? 'Meta alcançada' : 'Sessão encerrada'}
            </p>
            <h2
              className={`mb-3 text-3xl ${
                summary.reachedTarget ? 'text-success' : summary.depletedCoins ? 'text-destructive' : 'text-foreground'
              }`}
            >
              {summary.reachedTarget ? 'Meta alcançada!' : summary.depletedCoins ? 'Saldo zerado' : 'Ensaio finalizado'}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {summary.reachedTarget
                ? 'A sessão terminou com a meta de fichas atingida.'
                : summary.depletedCoins
                  ? 'As fichas acabaram antes da meta ser atingida.'
                  : summary.timedOut
                    ? 'O tempo limite da sessão foi atingido.'
                    : 'A sessão foi encerrada.'}
            </p>
            <div className="surface-subtle mb-6 grid grid-cols-2 gap-4 p-5 text-left">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Fichas finais</p>
                <p className="font-display text-2xl text-foreground">{summary.finalCoins}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Meta</p>
                <p className="font-display text-2xl text-foreground">{summary.pointsLimit}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Rodadas</p>
                <p className="font-display text-2xl text-foreground">{summary.roundsPlayed}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Match</p>
                <p className="font-data text-xs break-all text-muted-foreground">{summary.matchId}</p>
              </div>
            </div>
            <button type="button" onClick={() => navigate('/sessions')} className="btn-primary w-full">
              Voltar às sessões
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className="min-w-64 max-w-sm rounded-xl border border-destructive/40 bg-destructive/20 px-4 py-3 text-red-100 shadow-xl backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-medium">{toast}</p>
          </div>
        </div>
      )}
    </div>
  )
}
