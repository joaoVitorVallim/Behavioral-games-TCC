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

// -- Game Catalog (from API) --

export interface GameCatalogItem {
  id: string
  name: string
  description: string
  redirectUrl: string
}

// -- Dynamic Game Config Fields (from API) --

export type GameConfigFieldType = 'string' | 'number' | 'boolean' | `enum(${string})`

export interface GameConfigFieldDefinition {
  name: string
  type: GameConfigFieldType | string
}

export interface GameConfigFieldsResponse {
  common: GameConfigFieldDefinition[]
  [game: string]: GameConfigFieldDefinition[]
}

export type ConfigPrimitiveValue = string | number | boolean

// -- Session Settings (game config stored in DB) --

export interface SessionSettings {
  id: string
  configName: string
  game: string
  createdAt: string
  [key: string]: ConfigPrimitiveValue | string
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
  createdAt?: string
  [key: string]: ConfigPrimitiveValue | string | undefined
}

export interface CreateConfigPayload {
  configName: string
  game: string
  [key: string]: ConfigPrimitiveValue | string
}

// -- Session Creation Types --

export interface CreateSessionPayload {
  game: string
  inputInfo: string[]
  settings: Omit<CreateConfigPayload, 'game'>
  user_id: string
}

export type CreateSessionResponse =
  | Session
  | {
      session: Session
      invite_code?: string
      inviteCode?: string
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