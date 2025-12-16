export interface LoginCredentials {
  username: string
  password: string
}

export interface UserProfile {
  id: string
  username: string
  email?: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: UserProfile
}

export interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<string>
}