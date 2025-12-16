'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { LoginCredentials } from '@/lib/auth/types'
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'

interface ModernLoginFormProps {
  onSubmit?: (credentials: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export default function ModernLoginForm({ 
  onSubmit, 
  isLoading: externalLoading, 
  error: externalError, 
  className = '' 
}: ModernLoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const { login } = useAuth()

  const currentError = externalError || error
  const currentLoading = externalLoading || isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (onSubmit) {
        await onSubmit(credentials)
      } else {
        await login(credentials)
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleFocus = (field: string) => {
    setFocusedField(field)
  }

  const handleBlur = () => {
    setFocusedField(null)
  }

  return (
    <div className={`w-full space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center animate-in fade-in duration-500 delay-100">
        <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-6 shadow-lg ring-4 ring-primary-600/20 animate-in zoom-in duration-600 delay-200 hover:scale-105 transition-transform">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 animate-in slide-in-from-bottom-2 duration-500 delay-300">
          Welcome Back
        </h2>
        <p className="text-gray-400 animate-in slide-in-from-bottom-2 duration-500 delay-400">
          Sign in to access your CollectiSense AI dashboard
        </p>
      </div>

      {/* Login Form */}
      <form className="space-y-6 animate-in fade-in duration-600 delay-500" onSubmit={handleSubmit}>
        {/* Error Message */}
        {currentError && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-200">{currentError}</span>
          </div>
        )}

        {/* Username Field */}
        <div className="relative animate-in slide-in-from-bottom-3 duration-500 delay-600">
          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 z-10 ${
            focusedField === 'username' || credentials.username ? 'text-primary-400' : 'text-gray-500'
          }`}>
            <User className="h-5 w-5" />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={credentials.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            onFocus={() => handleFocus('username')}
            onBlur={handleBlur}
            className="block w-full pl-12 pr-4 py-4 pt-6 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-gray-500 hover:shadow-lg focus:shadow-xl peer"
            placeholder="Username"
            autoComplete="username"
          />
          <label 
            htmlFor="username" 
            className={`absolute left-12 transition-all duration-200 pointer-events-none ${
              focusedField === 'username' || credentials.username
                ? 'top-2 text-xs text-primary-400' 
                : 'top-4 text-sm text-gray-400'
            }`}
          >
            Username
          </label>
        </div>

        {/* Password Field */}
        <div className="relative animate-in slide-in-from-bottom-3 duration-500 delay-700">
          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 z-10 ${
            focusedField === 'password' || credentials.password ? 'text-primary-400' : 'text-gray-500'
          }`}>
            <Lock className="h-5 w-5" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={credentials.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onFocus={() => handleFocus('password')}
            onBlur={handleBlur}
            className="block w-full pl-12 pr-12 py-4 pt-6 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-gray-500 hover:shadow-lg focus:shadow-xl"
            placeholder="Password"
            autoComplete="current-password"
          />
          <label 
            htmlFor="password" 
            className={`absolute left-12 transition-all duration-200 pointer-events-none ${
              focusedField === 'password' || credentials.password
                ? 'top-2 text-xs text-primary-400' 
                : 'top-4 text-sm text-gray-400'
            }`}
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 hover:scale-110 transition-all duration-200 z-10"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Submit Button */}
        <div className="animate-in slide-in-from-bottom-3 duration-500 delay-800">
          <button
            type="submit"
            disabled={currentLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg focus:shadow-xl"
          >
            {currentLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Sign in</span>
                <Lock className="h-4 w-4 transition-transform group-hover:rotate-12" />
              </div>
            )}
          </button>
        </div>

        {/* Additional Options */}
        <div className="flex items-center justify-between text-sm animate-in fade-in duration-500 delay-900">
          <label className="flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 bg-gray-800 rounded transition-all duration-200 hover:scale-110"
            />
            <span className="ml-2">Remember me</span>
          </label>
          <button
            type="button"
            className="text-primary-400 hover:text-primary-300 transition-all duration-200 hover:underline hover:scale-105"
          >
            Forgot password?
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Secured with enterprise-grade encryption
        </p>
      </div>
    </div>
  )
}