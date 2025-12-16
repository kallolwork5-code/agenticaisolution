import axios from 'axios'
import Cookies from 'js-cookie'
import { LoginCredentials, AuthResponse, UserProfile } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class AuthService {
  private static instance: AuthService
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials)
      const authData: AuthResponse = response.data
      
      // Store tokens in cookies
      Cookies.set('access_token', authData.access_token, { expires: 1 }) // 1 day
      Cookies.set('refresh_token', authData.refresh_token, { expires: 7 }) // 7 days
      
      return authData
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getAccessToken()
      if (token) {
        await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear tokens
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const refreshToken = Cookies.get('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refresh_token: refreshToken
      })
      
      const newToken = response.data.access_token
      Cookies.set('access_token', newToken, { expires: 1 })
      
      return newToken
    } catch (error) {
      // If refresh fails, clear all tokens
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
      throw error
    }
  }

  getAccessToken(): string | undefined {
    return Cookies.get('access_token')
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const token = this.getAccessToken()
      if (!token) return null

      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      return response.data
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }
}

export default AuthService