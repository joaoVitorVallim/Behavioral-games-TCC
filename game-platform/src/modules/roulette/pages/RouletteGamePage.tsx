import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Header } from '../../../shared/components/Header'
import {
  RouletteApiError,
  finishRouletteMatch,
  getRouletteMatchState,
  joinRouletteMatch,
  spinRouletteMatch,
} from '../api/rouletteClient'
import { RouletteStore } from '../store/rouletteStore'
import RoletaGame from '../phaser/RoletaGame'
import type { RouletteGameState, RouletteMoveOption } from '../types/roulette'

function resolveError(error: unknown, fallback: string): string {
  return error instanceof RouletteApiError ? error.message : fallback
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
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [initial, setInitial] = useState<RouletteGameState | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3200)
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

        setInitial(storeRef.current.applyJoin(response))
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
  }, [matchId, playerId])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  const handleSpin = useCallback(
    async (opcao: RouletteMoveOption, aposta: number) => {
      const response = await spinRouletteMatch(matchId, { playerId, opcao, aposta })
      storeRef.current.applySpin(response)
      return response
    },
    [matchId, playerId]
  )

  const handleFinish = useCallback(async () => {
    try {
      storeRef.current.markFinished()
      await finishRouletteMatch(matchId)
    } catch (error) {
      showToast(resolveError(error, 'Erro ao encerrar sessão no servidor.'))
    }
  }, [matchId, showToast])

  const handleExit = useCallback(() => {
    navigate('/sessions')
  }, [navigate])

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

  if (!initial) {
    return (
      <div className="app-shell">
        <Header />
        <main className="flex min-h-[70vh] items-center justify-center px-5">
          <p className="text-sm text-muted-foreground">Preparando mesa de roleta...</p>
        </main>
      </div>
    )
  }

  return (
    <>
      <RoletaGame initial={initial} onSpin={handleSpin} onFinish={handleFinish} onExit={handleExit} />

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
    </>
  )
}
