'use client'

import { useState } from 'react'
import { 
  Upload, 
  BarChart3, 
  Brain, 
  ChevronLeft, 
  ChevronRight,
  Database,
  FileText,
  Zap
} from 'lucide-react'

interface CarouselSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

interface CarouselNavigationProps {
  activeSection: string
  onSectionChange: (sectionId: string) => void
  className?: string
}

export default function CarouselNavigation({ 
  activeSection, 
  onSectionChange, 
  className = '' 
}: CarouselNavigationProps) {
  const sections: CarouselSection[] = [
    {
      id: 'data-management',
      title: 'Data Management',
      description: 'Upload, process, and manage your transaction data files',
      icon: <Upload className="w-6 h-6" />,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200'
    },
    {
      id: 'dashboard',
      title: 'Analytics Dashboard',
      description: 'View insights, metrics, and financial analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'engine',
      title: 'AI Engine',
      description: 'Query your data using natural language AI',
      icon: <Brain className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  const currentIndex = sections.findIndex(section => section.id === activeSection)

  const navigateToSection = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + sections.length) % sections.length
      : (currentIndex + 1) % sections.length
    onSectionChange(sections[newIndex].id)
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CollectiSense AI</h2>
          <p className="text-gray-600 mt-1">Intelligent Financial Transaction Management</p>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateToSection('prev')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateToSection('next')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section, index) => {
          const isActive = section.id === activeSection
          const isAdjacent = Math.abs(index - currentIndex) === 1 || 
                           (currentIndex === 0 && index === sections.length - 1) ||
                           (currentIndex === sections.length - 1 && index === 0)
          
          return (
            <div
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`
                relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 transform
                ${isActive 
                  ? `${section.bgColor} ${section.borderColor} scale-105 shadow-lg` 
                  : isAdjacent
                    ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 scale-100'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 scale-95 opacity-75'
                }
                hover:scale-105 hover:shadow-md
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary-600 rounded-full animate-pulse" />
              )}
              
              {/* Icon */}
              <div className={`
                inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4
                ${isActive ? section.bgColor : 'bg-white'}
                ${isActive ? section.color : 'text-gray-500'}
              `}>
                {section.icon}
              </div>
              
              {/* Content */}
              <h3 className={`
                text-lg font-semibold mb-2
                ${isActive ? section.color : 'text-gray-700'}
              `}>
                {section.title}
              </h3>
              <p className={`
                text-sm leading-relaxed
                ${isActive ? 'text-gray-700' : 'text-gray-500'}
              `}>
                {section.description}
              </p>
              
              {/* Features preview for active section */}
              {isActive && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    {section.id === 'data-management' && (
                      <>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>File Upload</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Database className="w-3 h-3" />
                          <span>Processing</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>Real-time</span>
                        </div>
                      </>
                    )}
                    {section.id === 'dashboard' && (
                      <>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-3 h-3" />
                          <span>Analytics</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Database className="w-3 h-3" />
                          <span>Metrics</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>Live Data</span>
                        </div>
                      </>
                    )}
                    {section.id === 'engine' && (
                      <>
                        <div className="flex items-center space-x-1">
                          <Brain className="w-3 h-3" />
                          <span>AI Query</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>RAG</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>Instant</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Section indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`
              w-2 h-2 rounded-full transition-all duration-200
              ${section.id === activeSection 
                ? 'bg-primary-600 w-8' 
                : 'bg-gray-300 hover:bg-gray-400'
              }
            `}
          />
        ))}
      </div>
    </div>
  )
}