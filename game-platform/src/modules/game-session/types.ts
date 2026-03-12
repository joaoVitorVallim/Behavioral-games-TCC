// -- Player Info Options (session-level) --

export type PlayerInfoField = 'nickname' | 'name' | 'age' | 'gender' | 'profession' | 'email'

export const PLAYER_INFO_OPTIONS: { value: PlayerInfoField; label: string }[] = [
  { value: 'nickname', label: 'Apelido' },
  { value: 'name', label: 'Nome' },
  { value: 'age', label: 'Idade' },
  { value: 'gender', label: 'Gênero' },
  { value: 'profession', label: 'Profissão' },
  { value: 'email', label: 'E-mail' }
]

export const GAME_OPTIONS = [
  { value: 'cards', label: 'Cards' },
  { value: 'words', label: 'Words' }
] as const

// -- Session Settings (game config stored in DB) --

export interface SessionSettings {
  id: string
  configName: string
  game: string
  userViewPoints: boolean
  limitRounds: number
  createdAt: string
  cardDeckSize: number
  allowSpecialCards: boolean
  cardTheme: string
  wordPoolSize: number
  difficulty: string
  includeTimerPerWord: boolean
  secondsPerWord: number
}

export interface SessionUser {
  id: string
  name: string
  login: string
}

export interface Session {
  id: string
  session_name: string
  game: string
  inputInfo: string[]
  settings: SessionSettings
  settings_id: string
  inviteCode: string
  user: SessionUser
  user_id: string
  players: string[]
  isActive: boolean
  created_at: string
  finished_at: string | null
}

// -- Game Configuration Types (match-level) --

export interface GameConfig {
  id: string
  configName: string
  game: string
  userViewPoints: boolean
  limitRounds: number
  cardDeckSize: number
  allowSpecialCards: boolean
  cardTheme: string
  wordPoolSize: number
  difficulty: string
  includeTimerPerWord: boolean
  secondsPerWord: number
  createdAt?: string
}

export interface CreateConfigPayload {
  configName: string
  game: string
  userViewPoints: boolean
  limitRounds: number
  cardDeckSize: number
  allowSpecialCards: boolean
  cardTheme: string
  wordPoolSize: number
  difficulty: string
  includeTimerPerWord: boolean
  secondsPerWord: number
}

// -- Session Creation Types --

export interface CreateSessionPayload {
  session_name: string
  game: string
  inputInfo: string[]
  settings: CreateConfigPayload
  user_id: string
}

export interface CreateSessionResponse {
  session: Session
  invite_code: string
}

// -- Join Session Types --

export interface SessionRequirement {
  field: string
  label: string
  type: 'text' | 'email' | 'number'
  required: boolean
  placeholder: string
}

export interface ValidateCodeResponse {
  valid: boolean
  requirements: SessionRequirement[]
}

export interface JoinSessionPayload {
  code: string
  [key: string]: string
}