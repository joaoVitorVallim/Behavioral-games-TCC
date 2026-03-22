// Betting Game Types

export type BetColor = 'red' | 'black' | 'blue'

export interface BettingGameConfig {
  id: string
  configName: string
  game: 'betting'
  startingPoints: number
  redMultiplier: number
  blackMultiplier: number
  blueMultiplier: number
  limitMode: 'time' | 'points' | 'rounds'
  limitValue: number
  bonusPoints: number
  bonusIntervalMinutes?: number
  bonusIntervalRounds?: number
  popupAtTimePercent?: number
  popupAtPointsValue?: number
  demoMode: boolean
  createdAt?: string
}

export interface BetPopupData {
  id: string
  phrase: string
  selectedStudentCount: number
  timeGainedPerStudentSeconds: number
  gamesUntilBonusActivation: number
  sessionId: string
}

export interface BetResult {
  number: number
  color: BetColor
  won: boolean
  winAmount: number
  totalPoints: number
  roundNumber: number
  timestamp: string
}

export interface BettingGameState {
  currentPoints: number
  totalScore: number
  roundsPlayed: number
  timeRemaining: number
  pointsGoal?: number
  selectedColor: BetColor
  selectedAmount: number
  isSpinning: boolean
  gameOver: boolean
  results: BetResult[]
}
