import { MATCH_SESSION_STORAGE_KEYS as KEYS } from '../../shared/constants/storageKeys'
import type { MatchReadyData, MatchResult } from './types'

function readJson<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, data: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(data))
  } catch {
    // sessionStorage may be full/unavailable (e.g. private browsing) — non-fatal
  }
}

/**
 * Typed accessors for the prisoner match/session sessionStorage keys — previously
 * accessed as raw string literals independently across GameScene.ts,
 * useWebSocket.ts, ResultPage.tsx, GamePage.tsx and WaitingPage.tsx, with JSON
 * parse-safety handled ad hoc (or not at all — ResultPage's JSON.parse had no
 * try/catch) at each call site.
 */
export const matchSession = {
  getPlayerId: (): string => sessionStorage.getItem(KEYS.playerId) ?? '',

  getMatchId: (): string => sessionStorage.getItem(KEYS.matchId) ?? '',
  setMatchId: (id: string): void => sessionStorage.setItem(KEYS.matchId, id),

  getSessionId: (): string => sessionStorage.getItem(KEYS.sessionId) ?? '',

  getIsPlayer1: (): boolean => sessionStorage.getItem(KEYS.isPlayer1) === 'true',
  setIsPlayer1: (value: boolean): void => sessionStorage.setItem(KEYS.isPlayer1, String(value)),

  // Raw payload straight off the socket — shape isn't guaranteed until narrowed,
  // so the setter takes `unknown` (same trust-boundary looseness as before).
  getMatchReadyData: (): MatchReadyData | null => readJson<MatchReadyData>(KEYS.matchReadyData),
  setMatchReadyData: (data: unknown): void => writeJson(KEYS.matchReadyData, data),

  getMatchResult: (): MatchResult | null => readJson<MatchResult>(KEYS.matchResult),
  setMatchResult: (data: unknown): void => writeJson(KEYS.matchResult, data),

  clear: (): void => {
    Object.values(KEYS).forEach((key) => sessionStorage.removeItem(key))
  }
}
