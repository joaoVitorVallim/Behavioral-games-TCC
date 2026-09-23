/**
 * Single source of truth for storage keys shared across layers.
 *
 * `AUTH_TOKEN_STORAGE_KEY` was previously hardcoded as the literal 'auth_token'
 * independently in both infrastructure/api/api-client.ts and
 * modules/auth/services/authService.ts (as TOKEN_KEY) — two sources of truth for
 * the same localStorage key. Centralized here so a rename only happens once.
 */
export const AUTH_TOKEN_STORAGE_KEY = 'auth_token'

/**
 * The match/session sessionStorage keys — written by play's PlayGameModal when
 * a player joins, then read/written by the game-session match screens during
 * gameplay. Kept in `shared` since both modules need the exact same raw key
 * strings (previously duplicated as raw literals with no shared constant).
 */
export const MATCH_SESSION_STORAGE_KEYS = {
  playerId: 'playerId',
  matchId: 'matchId',
  sessionId: 'sessionId',
  isPlayer1: 'isPlayer1',
  matchReadyData: 'matchReadyData',
  matchResult: 'matchResult',
  playerEmail: 'playerEmail'
} as const
