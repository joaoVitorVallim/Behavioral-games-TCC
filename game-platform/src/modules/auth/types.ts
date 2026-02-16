export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
}

export interface User {
  id: string
  email: string
}

export interface AuthState {
  user: User | null
  access_token: string | null
  is_authenticated: boolean
  is_loading: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}
