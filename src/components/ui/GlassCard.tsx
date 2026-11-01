import React from 'react'

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'subtle' | 'standard' | 'prominent' | 'interactive'
  elevation?: 'flat' | 'low' | 'medium' | 'high'
  className?: string
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'standard',
  elevation = 'medium',
  className = '',
  ...props
}) => {
  const variantStyles = {
    subtle: 'bg-white/5 dark:bg-white/[0.04] border-white/10 dark:border-white/[0.07] backdrop-blur-md',
    standard: 'bg-white/10 dark:bg-neutral-900/60 border-white/15 dark:border-white/10 backdrop-blur-xl',
    prominent: 'bg-white/20 dark:bg-neutral-900/80 border-white/25 dark:border-white/15 backdrop-blur-2xl shadow-xl',
    interactive: 'bg-white/10 dark:bg-neutral-900/60 border-white/15 dark:border-white/10 backdrop-blur-xl hover:bg-white/15 dark:hover:bg-neutral-800/80 hover:border-white/25 transition-all duration-200 cursor-pointer active:scale-[0.99]',
  }[variant]

  const elevationStyles = {
    flat: '',
    low: 'shadow-sm',
    medium: 'shadow-md shadow-black/10 dark:shadow-black/30',
    high: 'shadow-2xl shadow-black/20 dark:shadow-black/50',
  }[elevation]

  return (
    <div
      className={`rounded-2xl border ${variantStyles} ${elevationStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
