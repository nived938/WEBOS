import React from 'react'
import { soundService } from '@/core/audio/soundService'

export interface GlassToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export const GlassToggle: React.FC<GlassToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) => {
  const handleToggle = () => {
    if (disabled) return
    soundService.playClick()
    onChange(!checked)
  }

  return (
    <label
      onClick={handleToggle}
      className={`inline-flex items-center justify-between cursor-pointer select-none group ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${className}`}
    >
      {(label || description) && (
        <div className="flex flex-col mr-3 text-left">
          {label && (
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {description}
            </span>
          )}
        </div>
      )}
      <div
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-white/20 dark:border-white/10 transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-blue-600 shadow-sm shadow-blue-500/30' : 'bg-neutral-300 dark:bg-neutral-800'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          } mt-0.5`}
        />
      </div>
    </label>
  )
}
