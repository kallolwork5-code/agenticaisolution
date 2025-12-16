'use client'

import { useRouter, usePathname } from 'next/navigation'
import { 
  Upload, 
  BarChart3, 
  Brain, 
  Home,
  LogOut,
  User
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      description: 'Main overview'
    },
    {
      id: 'data-management',
      label: 'Data Management',
      icon: Upload,
      path: '/dashboard/data-management',
      description: 'Upload & process files'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/dashboard/analytics',
      description: 'Financial insights'
    },
    {
      id: 'ai-engine',
      label: 'AI Engine',
      icon: Brain,
      path: '/dashboard/ai-engine',
      description: 'Natural language queries'
    }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  return (
    <div className={`bg-gray-900 text-white w-64 min-h-screen flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">CollectiSense AI</h1>
            <p className="text-xs text-gray-400">Financial Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                ${active 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
              <div className="flex-1">
                <div className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-300'}`}>
                  {item.label}
                </div>
                <div className={`text-xs ${active ? 'text-primary-100' : 'text-gray-500'}`}>
                  {item.description}
                </div>
              </div>
            </button>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{user?.username}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}