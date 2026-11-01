import React from 'react'

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'subtle' | 'standard' | 'elevated' | 'sunken'
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  glow?: boolean
  className?: string
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  variant = 'standard',
  blur = 'xl',
  glow = false,
  className = '',
  ...props
}) => {
  const blurClass = {
    none: '',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
    '2xl': 'backdrop-blur-2xl',
    '3xl': 'backdrop-blur-3xl',
  }[blur]

  const variantClass = {
    subtle: 'bg-white/5 dark:bg-white/[0.03] border border-white/10 dark:border-white/[0.06]',
    standard: 'bg-white/10 dark:bg-neutral-900/70 border border-white/15 dark:border-white/10',
    elevated: 'bg-white/15 dark:bg-neutral-900/85 border border-white/20 dark:border-white/15 shadow-2xl shadow-black/25',
    sunken: 'bg-black/20 dark:bg-black/40 border border-white/5 shadow-inner',
  }[variant]

  const glowClass = glow ? 'ring-1 ring-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]' : ''

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${blurClass} ${variantClass} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
