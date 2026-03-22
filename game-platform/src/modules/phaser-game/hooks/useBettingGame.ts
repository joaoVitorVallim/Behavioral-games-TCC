import { useState, useEffect, useCallback, useRef } from 'react'
import type { BettingGameConfig, BettingGameState, BetResult, BetPopupData } from '../types'
import { bettingService } from '../services/bettingService'

type UseBettingGameProps = {
  sessionId: string
  onPopupNeeded?: (popupData: BetPopupData) => void
  onGameOver?: (finalScore: number) => void
}

export function useBettingGame({ sessionId, onPopupNeeded, onGameOver }: UseBettingGameProps) {
  const [config, setConfig] = useState<BettingGameConfig | null>(null)
  const [gameState, setGameState] = useState<BettingGameState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState<BetPopupData | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bonusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const popupCheckRef = useRef(false)

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true)
        const loadedConfig = await bettingService.getGameConfig(sessionId)
        setConfig(loadedConfig)

        // Initialize game state
        const initialState: BettingGameState = {
          currentPoints: loadedConfig.startingPoints,
          totalScore: 0,
          roundsPlayed: 0,
          timeRemaining: loadedConfig.limitMode === 'time' ? loadedConfig.limitValue * 60 : 0,
          pointsGoal: loadedConfig.limitMode === 'points' ? loadedConfig.limitValue : undefined,
          selectedColor: 'red',
          selectedAmount: 10,
          isSpinning: false,
          gameOver: false,
          results: [],
        }
        setGameState(initialState)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar configuração')
      } finally {
        setIsLoading(false)
      }
    }

    loadConfig()
  }, [sessionId])

  // Timer for time-based limit
  useEffect(() => {
    if (!gameState || !config || config.limitMode !== 'time' || gameState.gameOver) {
      return
    }

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return prev

        const newTime = prev.timeRemaining - 1

        // Check if popup should appear (at configured time percent)
        if (
          !popupCheckRef.current &&
          config.popupAtTimePercent &&
          newTime <= config.limitValue * 60 * (config.popupAtTimePercent / 100)
        ) {
          popupCheckRef.current = true
          handleShowPopup()
        }

        // Check if time is up
        if (newTime <= 0) {
          if (timerRef.current) clearInterval(timerRef.current)
          return {
            ...prev,
            gameOver: true,
            timeRemaining: 0,
          }
        }

        return {
          ...prev,
          timeRemaining: newTime,
        }
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, config])

  // Bonus timer
  useEffect(() => {
    if (!gameState || !config || gameState.currentPoints > 0 || gameState.gameOver) {
      return
    }

    const bonusInterval = config.bonusIntervalMinutes ? config.bonusIntervalMinutes * 60 * 1000 : 5 * 60 * 1000
    
    bonusTimerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.currentPoints > 0) return prev
        return {
          ...prev,
          currentPoints: Math.min(prev.currentPoints + config.bonusPoints, config.startingPoints),
        }
      })
    }, bonusInterval)

    return () => {
      if (bonusTimerRef.current) clearInterval(bonusTimerRef.current)
    }
  }, [gameState, config])

  const handleShowPopup = useCallback(async () => {
    try {
      const data = await bettingService.getPopupData(sessionId)
      setPopupData(data)
      setShowPopup(true)
      onPopupNeeded?.(data)
    } catch (err) {
      console.error('Erro ao buscar dados do popup:', err)
    }
  }, [sessionId, onPopupNeeded])

  const handleBet = useCallback(
    (color: 'red' | 'black' | 'blue', amount: number) => {
      setGameState((prev) => {
        if (!prev || prev.isSpinning || prev.gameOver || prev.currentPoints < amount) return prev

        return {
          ...prev,
          selectedColor: color,
          selectedAmount: amount,
          isSpinning: true,
        }
      })
    },
    []
  )

  const handleSpinResult = useCallback(
    (number: number, color: 'red' | 'black' | 'blue', won: boolean) => {
      setGameState((prev) => {
        if (!prev) return prev

        const multiplier =
          color === 'red'
            ? config?.redMultiplier || 2
            : color === 'black'
              ? config?.blackMultiplier || 2
              : config?.blueMultiplier || 5

        const winAmount = won ? prev.selectedAmount * (multiplier - 1) : -prev.selectedAmount
        const newScore = prev.totalScore + winAmount
        const newPoints = prev.currentPoints + winAmount
        const newRounds = prev.roundsPlayed + 1

        const result: BetResult = {
          number,
          color,
          won,
          winAmount,
          totalPoints: newScore,
          roundNumber: newRounds,
          timestamp: new Date().toISOString(),
        }

        // Check if game should end by points
        if (
          config?.limitMode === 'points' &&
          config.popupAtPointsValue &&
          newScore >= config.popupAtPointsValue &&
          !popupCheckRef.current
        ) {
          popupCheckRef.current = true
          handleShowPopup()
        }

        // Check if points limit reached
        let isGameOver = false
        if (config?.limitMode === 'points' && newScore >= config.limitValue) {
          isGameOver = true
          onGameOver?.(newScore)
        }

        // Check if rounds limit reached
        if (config?.limitMode === 'rounds' && newRounds >= config.limitValue) {
          isGameOver = true
          onGameOver?.(newScore)
        }

        return {
          ...prev,
          currentPoints: newPoints,
          totalScore: newScore,
          roundsPlayed: newRounds,
          isSpinning: false,
          gameOver: isGameOver,
          results: [...prev.results, result],
        }
      })
    },
    [config, onGameOver, handleShowPopup]
  )

  const handlePopupConfirm = useCallback(async (markedStudentIds: string[]) => {
    if (!popupData) return

    try {
      await bettingService.submitMarkedStudents(sessionId, popupData.id, markedStudentIds)
      setShowPopup(false)

      // Add time to timer if in time mode
      if (gameState && config?.limitMode === 'time') {
        const addedTime = markedStudentIds.length * popupData.timeGainedPerStudentSeconds
        setGameState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            timeRemaining: prev.timeRemaining + addedTime,
          }
        })
      }
    } catch (err) {
      console.error('Erro ao confirmar popup:', err)
      setError('Erro ao confirmar seleção de alunos')
    }
  }, [popupData, sessionId, gameState, config])

  return {
    config,
    gameState,
    isLoading,
    error,
    showPopup,
    popupData,
    handleBet,
    handleSpinResult,
    handlePopupConfirm,
    setShowPopup,
  }
}
