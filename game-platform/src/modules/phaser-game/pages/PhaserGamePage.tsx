import { useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { PhaserGame } from '../components/PhaserGame'
import { PopupModal } from '../components/PopupModal'
import { useBettingGame } from '../hooks/useBettingGame'
import type { BettingGameConfig } from '../types'

const DEMO_CONFIG: BettingGameConfig = {
  id: 'demo-1',
  configName: 'Demo Configuration',
  game: 'betting',
  startingPoints: 500,
  redMultiplier: 2,
  blackMultiplier: 2,
  blueMultiplier: 5,
  limitMode: 'points',
  limitValue: 200,
  bonusPoints: 50,
  bonusIntervalRounds: 3,
  popupAtTimePercent: 50,
  popupAtPointsValue: 150,
  demoMode: true,
}

const DEMO_STUDENTS = [
  { id: '1', name: 'Ana Silva' },
  { id: '2', name: 'Bruno Costa' },
  { id: '3', name: 'Carla Oliveira' },
  { id: '4', name: 'Daniel Santos' },
  { id: '5', name: 'Ester Alves' },
  { id: '6', name: 'Felipe Gomes' },
  { id: '7', name: 'Gabriela Rocha' },
  { id: '8', name: 'Hugo Martins' },
]

export function PhaserGamePage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id') || 'demo'

  const {
    config,
    isLoading,
    error,
    showPopup,
    popupData,
    handleSpinResult,
    handlePopupConfirm,
    setShowPopup,
  } = useBettingGame({
    sessionId,
    onPopupNeeded: (data) => {
      console.log('Popup needed:', data)
    },
    onGameOver: (finalScore) => {
      console.log('Game over! Final score:', finalScore)
    },
  })

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg font-semibold">Carregando jogo...</p>
        </div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <p className="text-destructive text-lg font-semibold mb-2">Erro ao carregar jogo</p>
          <p className="text-muted-foreground">{error || 'Configuração não encontrada'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute left-4 top-4 z-40 hidden rounded-lg border border-primary/30 bg-card/75 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md md:flex md:items-center md:gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Modo de jogo em execucao
      </div>
      <PhaserGame
        fullscreen
        config={config || DEMO_CONFIG}
        onSpinComplete={handleSpinResult}
      />

      {showPopup && popupData && (
        <PopupModal
          popupData={popupData}
          students={DEMO_STUDENTS}
          onConfirm={handlePopupConfirm}
          onClose={() => setShowPopup(false)}
          isLoading={false}
        />
      )}
    </div>
  )
}
