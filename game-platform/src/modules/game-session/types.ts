export interface Session {
  id: string
  title: string
  subtitle: string
  description: string
  room: string
  date: string
  team: string
  category: string
  status: 'active' | 'upcoming' | 'completed'
}

export interface SessionRequirement {
  field: string
  label: string
  type: 'text' | 'email' | 'number'
  required: boolean
  placeholder?: string
}

export interface ValidateCodeResponse {
  valid: boolean
  requirements: SessionRequirement[]
}

export interface JoinSessionPayload {
  code: string
  [key: string]: string
}
