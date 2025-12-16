'use client'

import { 
  Activity, 
  Banknote, 
  Building2, 
  Calculator, 
  CheckCircle2, 
  Clock4, 
  CreditCard, 
  Database, 
  FileText, 
  GitBranch, 
  Globe, 
  LineChart, 
  MapPin, 
  PieChart, 
  Repeat, 
  Shield, 
  Smartphone, 
  TrendingUp, 
  Users, 
  Wallet,
  Zap,
  ArrowRightLeft
} from 'lucide-react'

interface ContextualImageryProps {
  theme?: 'light' | 'dark';
  animationSpeed?: 'slow' | 'normal' | 'fast';
  reducedMotion?: boolean;
}

export default function ContextualImagery({ 
  theme = 'dark', 
  animationSpeed = 'normal',
  reducedMotion = false 
}: ContextualImageryProps) {
  
  // Financial technology elements with specific positioning
  const financialElements = [
    // Transaction Processing
    { icon: CreditCard, position: { x: 10, y: 15 }, delay: 0, category: 'payment' },
    { icon: Smartphone, position: { x: 85, y: 20 }, delay: 1.2, category: 'payment' },
    { icon: Wallet, position: { x: 20, y: 75 }, delay: 2.1, category: 'payment' },
    
    // Cost Analysis & Reconciliation
    { icon: Calculator, position: { x: 75, y: 65 }, delay: 0.8, category: 'analysis' },
    { icon: PieChart, position: { x: 45, y: 25 }, delay: 1.5, category: 'analysis' },
    { icon: LineChart, position: { x: 65, y: 80 }, delay: 2.8, category: 'analysis' },
    { icon: TrendingUp, position: { x: 30, y: 40 }, delay: 1.8, category: 'analysis' },
    
    // SLA & Compliance
    { icon: Clock4, position: { x: 80, y: 45 }, delay: 0.5, category: 'sla' },
    { icon: CheckCircle2, position: { x: 15, y: 55 }, delay: 2.5, category: 'sla' },
    { icon: FileText, position: { x: 55, y: 70 }, delay: 1.1, category: 'sla' },
    
    // Routing & Network
    { icon: GitBranch, position: { x: 40, y: 85 }, delay: 1.7, category: 'routing' },
    { icon: ArrowRightLeft, position: { x: 70, y: 30 }, delay: 0.3, category: 'routing' },
    { icon: Globe, position: { x: 25, y: 20 }, delay: 2.2, category: 'routing' },
    { icon: MapPin, position: { x: 85, y: 75 }, delay: 1.4, category: 'routing' },
    
    // Infrastructure & Security
    { icon: Database, position: { x: 35, y: 65 }, delay: 0.9, category: 'infrastructure' },
    { icon: Shield, position: { x: 60, y: 15 }, delay: 1.9, category: 'infrastructure' },
    { icon: Building2, position: { x: 50, y: 50 }, delay: 2.6, category: 'infrastructure' },
    { icon: Zap, position: { x: 90, y: 55 }, delay: 0.7, category: 'infrastructure' }
  ]

  const getSpeedMultiplier = () => {
    switch (animationSpeed) {
      case 'slow': return 1.5
      case 'fast': return 0.7
      default: return 1
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      payment: 'text-primary-400',
      analysis: 'text-primary-500',
      sla: 'text-primary-300',
      routing: 'text-primary-600',
      infrastructure: 'text-primary-200'
    }
    return colors[category as keyof typeof colors] || 'text-primary-400'
  }

  if (reducedMotion) {
    return (
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {financialElements.slice(0, 8).map((element, index) => {
          const IconComponent = element.icon
          return (
            <div
              key={`static-${index}`}
              className="absolute"
              style={{
                left: `${element.position.x}%`,
                top: `${element.position.y}%`,
              }}
            >
              <IconComponent className={`w-6 h-6 ${getCategoryColor(element.category)}`} />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Floating financial icons */}
      {financialElements.map((element, index) => {
        const IconComponent = element.icon
        const duration = (5 + Math.random() * 4) * getSpeedMultiplier()
        
        return (
          <div
            key={`contextual-${index}`}
            className="absolute opacity-60"
            style={{
              left: `${element.position.x}%`,
              top: `${element.position.y}%`,
              animation: `contextual-float-${index} ${duration}s ease-in-out infinite`,
              animationDelay: `${element.delay}s`
            }}
          >
            <IconComponent className={`w-5 h-5 md:w-6 md:h-6 ${getCategoryColor(element.category)}`} />
          </div>
        )
      })}

      {/* Data flow connections */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Transaction flow lines */}
        <path
          d="M10,15 Q30,25 45,25 Q60,25 75,65"
          stroke="currentColor"
          strokeWidth="0.2"
          fill="none"
          className="text-primary-400"
          style={{
            strokeDasharray: '2,2',
            animation: 'dash-flow 8s linear infinite'
          }}
        />
        <path
          d="M85,20 Q70,35 55,70 Q40,85 25,20"
          stroke="currentColor"
          strokeWidth="0.2"
          fill="none"
          className="text-primary-500"
          style={{
            strokeDasharray: '3,1',
            animation: 'dash-flow 12s linear infinite reverse'
          }}
        />
        <path
          d="M20,75 Q50,60 80,45 Q90,40 85,75"
          stroke="currentColor"
          strokeWidth="0.2"
          fill="none"
          className="text-primary-300"
          style={{
            strokeDasharray: '1,3',
            animation: 'dash-flow 10s linear infinite'
          }}
        />
      </svg>

      {/* CSS animations for contextual elements */}
      <style jsx>{`
        ${financialElements.map((_, index) => `
          @keyframes contextual-float-${index} {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
              opacity: 0.6;
            }
            25% { 
              transform: translateY(-8px) translateX(3px) rotate(1deg) scale(1.05);
              opacity: 0.8;
            }
            50% { 
              transform: translateY(-4px) translateX(-2px) rotate(-0.5deg) scale(0.95);
              opacity: 0.7;
            }
            75% { 
              transform: translateY(6px) translateX(4px) rotate(1.5deg) scale(1.02);
              opacity: 0.9;
            }
          }
        `).join('')}

        @keyframes dash-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 20; }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}