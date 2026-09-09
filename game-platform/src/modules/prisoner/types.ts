/**
 * Canonical prisoner's-dilemma event/state types. Previously each of GameScene.ts,
 * ResultPage.tsx and WaitingPage.tsx declared its own partial, slightly
 * inconsistent view of these same server payload shapes — this is the one
 * definition all of them now import.
 */

export type Choice = 'cooperate' | 'defect'
export type Phase = 'waiting' | 'dealing' | 'choosing' | 'committed' | 'revealing' | 'finished'

export interface RoundMoves {
  player1Choice: Choice
  player2Choice: Choice
  player1Points: number
  player2Points: number
  player1TimedOut?: boolean
  player2TimedOut?: boolean
}

export interface RoundResultData {
  round: number
  result: RoundMoves
  totalPoints: { player1: number | null; player2: number | null }
  nextRound: number | null
  timedOut: boolean
}

export interface MatchReadyData {
  currentRound: number
  totalRounds: number
  roundTimeLimit: number | null
  userViewPoints: boolean
  player1Id: string
  player2Id: string
  totalPoints?: { player1: number | null; player2: number | null }
  pendingChoices?: { player1: boolean; player2: boolean }
  roundEndsAt?: number | null
  serverNow?: number
  receivedAt?: number
}

export interface RoundStartData {
  round: number
  totalRounds: number
  roundEndsAt: number | null
  serverNow: number
  receivedAt?: number
}

export interface MatchFinishedData {
  finalScore: { player1: number; player2: number }
}

export interface MatchResult {
  matchId: string
  finalScore: { player1: number; player2: number }
  moves: Record<string, RoundMoves>
}
