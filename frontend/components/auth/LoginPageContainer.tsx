'use client'

import { ReactNode } from 'react'

interface LoginPageContainerProps {
  className?: string;
  backgroundComponent: ReactNode;
  formComponent: ReactNode;
}

export default function LoginPageContainer({ 
  className = '', 
  backgroundComponent, 
  formComponent 
}: LoginPageContainerProps) {
  return (
    <div className={`min-h-screen w-full flex transition-all duration-300 ease-in-out ${className}`}>
      {/* Left side - Animated Background (60% on desktop, 50% on tablet, hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 xl:w-2/3 transition-all duration-500 ease-in-out">
        <div className="w-full h-screen overflow-hidden">
          {backgroundComponent}
        </div>
      </div>

      {/* Right side - Login Form (40% on desktop, 50% on tablet, full width on mobile) */}
      <div className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3 min-h-screen flex items-center justify-center bg-gray-900 relative transition-all duration-500 ease-in-out">
        {/* Mobile background header with parallax effect */}
        <div className="absolute top-0 left-0 right-0 h-40 md:hidden overflow-hidden">
          <div className="w-full h-full scale-125 opacity-20 transform translate-y-2">
            {backgroundComponent}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900" />
        </div>

        {/* Decorative elements for visual continuity */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />
          </div>
          
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-l from-gray-900 via-gray-900/95 to-gray-900/90 md:bg-gradient-to-l md:from-gray-900 md:via-gray-900/98 md:to-transparent" />
        </div>

        {/* Form container with enhanced spacing and animations */}
        <div className="relative z-10 w-full max-w-md mx-auto p-6 md:p-8 lg:p-10 animate-in slide-in-from-right-4 fade-in duration-700 delay-300">
          {formComponent}
        </div>

        {/* Responsive breakpoint indicators (for development - can be removed) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-4 right-4 text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded opacity-50">
            <span className="md:hidden">Mobile</span>
            <span className="hidden md:inline lg:hidden">Tablet</span>
            <span className="hidden lg:inline xl:hidden">Desktop</span>
            <span className="hidden xl:inline">Large Desktop</span>
          </div>
        )}
      </div>
    </div>
  )
}