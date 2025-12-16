'use client'

import { useEffect, useState } from 'react'
import { 
  CreditCard, 
  TrendingUp, 
  ArrowRightLeft, 
  DollarSign, 
  BarChart3, 
  Clock, 
  Shield, 
  Zap,
  Target,
  Network
} from 'lucide-react'
import ContextualImagery from './ContextualImagery'

interface AnimatedBackgroundProps {
  className?: string;
  reducedMotion?: boolean;
}

interface FloatingElement {
  id: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  delay: number;
  duration: number;
  scale: number;
}

export default function AnimatedBackground({ className = '', reducedMotion = false }: AnimatedBackgroundProps) {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    // Check for user's reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion || reducedMotion) {
      return
    }

    // Generate floating elements with financial context
    const financialElements: FloatingElement[] = [
      {
        id: 'credit-card-1',
        icon: <CreditCard className="w-8 h-8 text-primary-400" />,
        x: 15,
        y: 20,
        delay: 0,
        duration: 6,
        scale: 1
      },
      {
        id: 'trending-up-1',
        icon: <TrendingUp className="w-6 h-6 text-primary-500" />,
        x: 75,
        y: 15,
        delay: 1,
        duration: 8,
        scale: 0.8
      },
      {
        id: 'arrow-exchange-1',
        icon: <ArrowRightLeft className="w-7 h-7 text-primary-300" />,
        x: 25,
        y: 60,
        delay: 2,
        duration: 7,
        scale: 1.1
      },
      {
        id: 'dollar-sign-1',
        icon: <DollarSign className="w-5 h-5 text-primary-600" />,
        x: 80,
        y: 70,
        delay: 0.5,
        duration: 5,
        scale: 0.9
      },
      {
        id: 'bar-chart-1',
        icon: <BarChart3 className="w-8 h-8 text-primary-400" />,
        x: 45,
        y: 25,
        delay: 3,
        duration: 9,
        scale: 1.2
      },
      {
        id: 'clock-1',
        icon: <Clock className="w-6 h-6 text-primary-500" />,
        x: 65,
        y: 45,
        delay: 1.5,
        duration: 6,
        scale: 0.7
      },
      {
        id: 'shield-1',
        icon: <Shield className="w-7 h-7 text-primary-300" />,
        x: 20,
        y: 80,
        delay: 2.5,
        duration: 8,
        scale: 1
      },
      {
        id: 'zap-1',
        icon: <Zap className="w-5 h-5 text-primary-600" />,
        x: 85,
        y: 30,
        delay: 4,
        duration: 4,
        scale: 0.8
      },
      {
        id: 'target-1',
        icon: <Target className="w-6 h-6 text-primary-400" />,
        x: 35,
        y: 75,
        delay: 1.8,
        duration: 7,
        scale: 0.9
      },
      {
        id: 'network-1',
        icon: <Network className="w-8 h-8 text-primary-300" />,
        x: 55,
        y: 85,
        delay: 3.5,
        duration: 6,
        scale: 1.1
      }
    ]

    setElements(financialElements)
  }, [reducedMotion])

  return (
    <div className={`animated-background relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-in fade-in duration-700 ${className}`}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-primary-600/10" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>

      {/* Main content area with contextual information */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 lg:p-12">
        {/* Brand section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-6 shadow-lg">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            CollectiSense AI
          </h1>
          <p className="text-xl text-gray-300 max-w-md mx-auto leading-relaxed">
            Intelligent Cost Reconciliation & SLA Management for Digital Transactions
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
          <div className="flex items-center space-x-3 text-gray-300">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-400" />
            </div>
            <span className="text-sm">Cost Analysis & Optimization</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-300">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary-400" />
            </div>
            <span className="text-sm">SLA Compliance Tracking</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-300">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-primary-400" />
            </div>
            <span className="text-sm">Smart Routing Engine</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-300">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-400" />
            </div>
            <span className="text-sm">Secure Reconciliation</span>
          </div>
        </div>
      </div>

      {/* Floating financial icons */}
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute pointer-events-none"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            transform: `scale(${element.scale})`,
            animation: `float-${element.id} ${element.duration}s ease-in-out infinite`,
            animationDelay: `${element.delay}s`
          }}
        >
          {element.icon}
        </div>
      ))}

      {/* Enhanced contextual imagery */}
      <ContextualImagery 
        theme="dark" 
        animationSpeed="normal" 
        reducedMotion={reducedMotion}
      />

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-primary-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle-float ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        @keyframes particle-float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-20px) translateX(10px);
            opacity: 0.2;
          }
        }

        @keyframes float-credit-card-1 {
          0%, 100% { transform: scale(1) translateY(0px) rotate(0deg); }
          33% { transform: scale(1.1) translateY(-10px) rotate(2deg); }
          66% { transform: scale(0.9) translateY(5px) rotate(-1deg); }
        }

        @keyframes float-trending-up-1 {
          0%, 100% { transform: scale(0.8) translateY(0px) rotate(0deg); }
          33% { transform: scale(0.88) translateY(-8px) rotate(1deg); }
          66% { transform: scale(0.72) translateY(4px) rotate(-0.5deg); }
        }

        @keyframes float-arrow-exchange-1 {
          0%, 100% { transform: scale(1.1) translateY(0px) rotate(0deg); }
          33% { transform: scale(1.21) translateY(-12px) rotate(3deg); }
          66% { transform: scale(0.99) translateY(6px) rotate(-2deg); }
        }

        @keyframes float-dollar-sign-1 {
          0%, 100% { transform: scale(0.9) translateY(0px) rotate(0deg); }
          33% { transform: scale(0.99) translateY(-9px) rotate(1.5deg); }
          66% { transform: scale(0.81) translateY(4px) rotate(-1deg); }
        }

        @keyframes float-bar-chart-1 {
          0%, 100% { transform: scale(1.2) translateY(0px) rotate(0deg); }
          33% { transform: scale(1.32) translateY(-14px) rotate(2.5deg); }
          66% { transform: scale(1.08) translateY(7px) rotate(-1.5deg); }
        }

        @keyframes float-clock-1 {
          0%, 100% { transform: scale(0.7) translateY(0px) rotate(0deg); }
          33% { transform: scale(0.77) translateY(-7px) rotate(1deg); }
          66% { transform: scale(0.63) translateY(3px) rotate(-0.5deg); }
        }

        @keyframes float-shield-1 {
          0%, 100% { transform: scale(1) translateY(0px) rotate(0deg); }
          33% { transform: scale(1.1) translateY(-10px) rotate(2deg); }
          66% { transform: scale(0.9) translateY(5px) rotate(-1deg); }
        }

        @keyframes float-zap-1 {
          0%, 100% { transform: scale(0.8) translateY(0px) rotate(0deg); }
          33% { transform: scale(0.88) translateY(-8px) rotate(1.5deg); }
          66% { transform: scale(0.72) translateY(4px) rotate(-1deg); }
        }

        @keyframes float-target-1 {
          0%, 100% { transform: scale(0.9) translateY(0px) rotate(0deg); }
          33% { transform: scale(0.99) translateY(-9px) rotate(1deg); }
          66% { transform: scale(0.81) translateY(4px) rotate(-0.5deg); }
        }

        @keyframes float-network-1 {
          0%, 100% { transform: scale(1.1) translateY(0px) rotate(0deg); }
          33% { transform: scale(1.21) translateY(-12px) rotate(2deg); }
          66% { transform: scale(0.99) translateY(6px) rotate(-1deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .animated-background * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}