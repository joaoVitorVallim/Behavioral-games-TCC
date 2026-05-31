export interface SessionResultsSettings {
  id: string
  configName: string
  game: string
  createdAt: string
  userViewPoints?: boolean
  limitRounds?: number | null
  roundTimeLimit?: number | null
  [key: string]: unknown
}

export interface SessionResultsCreator {
  id: string
  name: string
  login: string
  created_at: string
}

export interface SessionResultsListItem {
  id: string
  game: string
  inviteCode: string
  isActive: boolean
  inputInfo: string[]
  settings: SessionResultsSettings
  createdBy: SessionResultsCreator
  playersCount: number
  created_at: string
  finished_at: string | null
}

export interface SessionResultsInfo {
  id: string
  game: string
  inviteCode: string
  isActive: boolean
  inputInfo: string[]
  settings: SessionResultsSettings
  createdBy: SessionResultsCreator
  created_at: string
  finished_at: string | null
}

export interface PlayerResult {
  id: string
  educationLevel: string | null
  semester: number | null
  course: string | null
  age: number | null
  gender: string | null
  profession: string | null
  session_id: string
  created_at: string
}

export interface PlayerResultWithRole extends PlayerResult {
  role: 'player1' | 'player2'
}

export type Choice = 'cooperate' | 'defect' | string

export interface RoundResult {
  player1Choice: Choice
  player1Points: number
  player2Choice: Choice
  player2Points: number
}

export interface MatchMoves {
  [round: string]: RoundResult
}

export interface MatchSummary {
  id: string
  player1_id: string
  player2_id: string
  status: string
  matchTime: number | null
  moves: MatchMoves
  created_at: string
}

export interface SessionResultsDetail {
  session: SessionResultsInfo
  players: PlayerResult[]
  matches: MatchSummary[]
}

export interface MatchResultDetail {
  session: SessionResultsInfo
  players: PlayerResultWithRole[]
  match: MatchSummary
}
