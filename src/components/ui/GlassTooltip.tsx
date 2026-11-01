import React, { useState } from 'react'

export interface GlassTooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export const GlassTooltip: React.FC<GlassTooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    const t = setTimeout(() => setIsVisible(true), delay)
    setTimer(t)
  }

  const handleMouseLeave = () => {
    if (timer) clearTimeout(timer)
    setIsVisible(false)
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position]

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-[130] pointer-events-none px-2.5 py-1 text-[11px] font-medium text-white bg-neutral-900/90 border border-white/20 rounded-lg shadow-xl backdrop-blur-xl whitespace-nowrap animate-fadeIn ${positionClasses}`}
        >
          {content}
        </div>
      )}
    </div>
  )
}
