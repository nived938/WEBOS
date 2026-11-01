import React from 'react'

export interface GlassSliderProps {
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  unit?: string
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
}

export const GlassSlider: React.FC<GlassSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  unit = '',
  icon,
  disabled = false,
  className = '',
}) => {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))

  return (
    <div className={`flex flex-col gap-1.5 w-full ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}>
      {(label || icon) && (
        <div className="flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center gap-1.5">
            {icon && <span className="opacity-70">{icon}</span>}
            {label && <span className="font-medium">{label}</span>}
          </div>
          <span className="font-mono text-neutral-500 dark:text-neutral-400">
            {value}
            {unit}
          </span>
        </div>
      )}
      <div className="relative flex items-center w-full h-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-neutral-200 dark:bg-neutral-800/80 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #3b82f6 ${percentage}%, rgba(120, 120, 128, 0.25) ${percentage}%, rgba(120, 120, 128, 0.25) 100%)`,
          }}
        />
      </div>
    </div>
  )
}
