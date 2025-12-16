'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  username: string
  email?: string
  created_at: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      // Only access localStorage in the browser
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
            setIsAuthenticated(true)
          } catch (error) {
            console.error('Error parsing user data:', error)
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
          }
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Login failed')
      }

      const data = await response.json()
      
      // Store tokens and user data (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      
      setUser(data.user)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Login error:', error)
      throw error // Re-throw to let the component handle it
    }
  }

  const logout = async () => {
    try {
      // Only access localStorage in the browser
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token')
        if (token) {
          // Call logout endpoint
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        }
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage and state regardless of API call success (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
      }
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}