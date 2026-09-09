export type RouletteMoveOption = 'azul' | 'vermelho' | 'preto'

export type RouletteMatchStatus = 'in_progress' | 'finished'

export interface RouletteStoredMove {
  coinsAmount: number
  aposta: number
  opcao: RouletteMoveOption
  winrate: number
}

export interface RouletteJoinResponse {
  matchId: string
  sessionId: string
  playerId: string
  coins: number
  pointsLimit: number
  timeLimit: number | null
  pityStreak: number
  moves: Record<string, RouletteStoredMove>
  status: RouletteMatchStatus
}

export interface RouletteSpinRequest {
  playerId: string
  opcao: RouletteMoveOption
  aposta: number
}

export interface RouletteSpinResponse {
  round: number
  opcao: RouletteMoveOption
  aposta: number
  won: boolean
  coinsAmount: number
  winProbability: number
  matchFinished: boolean
}

export interface RouletteFinishResponse {
  matchId?: string
  status?: RouletteMatchStatus
}

export interface RouletteRoundHistory {
  round: number
  aposta: number
  opcao: RouletteMoveOption
  won: boolean
  coinsAmount: number
}

export interface RouletteGameState {
  matchId: string
  sessionId: string
  playerId: string
  coins: number
  pointsLimit: number
  timeLimit: number | null
  pityStreak: number
  status: RouletteMatchStatus
  currentRound: number
  moveHistory: RouletteRoundHistory[]
  telemetry: Array<{ round: number; winProbability: number }>
}

export interface RouletteGameOverSummary {
  matchId: string
  playerId: string
  finalCoins: number
  pointsLimit: number
  roundsPlayed: number
  reachedTarget: boolean
  depletedCoins: boolean
  timedOut: boolean
}
