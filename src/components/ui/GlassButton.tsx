import React from 'react'
import { soundService } from '@/core/audio/soundService'

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  active?: boolean
  playSound?: boolean
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  active = false,
  playSound = true,
  onClick,
  className = '',
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && playSound) {
      soundService.playClick()
    }
    onClick?.(e)
  }

  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 rounded-lg gap-1.5',
    md: 'text-sm px-3.5 py-1.5 rounded-xl gap-2',
    lg: 'text-base px-5 py-2.5 rounded-2xl gap-2.5',
  }[size]

  const variantStyles = {
    primary:
      'bg-blue-600/85 hover:bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40 active:scale-[0.98]',
    secondary: `backdrop-blur-md border border-white/15 dark:border-white/10 ${
      active
        ? 'bg-white/30 dark:bg-white/20 text-neutral-900 dark:text-white shadow-sm'
        : 'bg-white/10 dark:bg-neutral-800/60 hover:bg-white/20 dark:hover:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200 active:scale-[0.98]'
    }`,
    danger:
      'bg-red-600/80 hover:bg-red-600 text-white shadow-md shadow-red-600/30 border border-red-400/40 active:scale-[0.98]',
    ghost:
      'hover:bg-white/10 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300 active:scale-[0.98]',
    icon: 'p-2 rounded-xl bg-white/10 dark:bg-neutral-800/60 hover:bg-white/20 dark:hover:bg-neutral-700/60 border border-white/15 dark:border-white/10 text-neutral-800 dark:text-neutral-200 active:scale-[0.95]',
  }[variant]

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles} ${size === 'md' && variant === 'icon' ? 'p-2' : sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
