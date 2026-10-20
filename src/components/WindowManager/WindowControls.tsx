import React, { useState } from 'react'
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react'

interface WindowControlsProps {
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  isMaximized: boolean
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-2 px-3 py-2 z-10 shrink-0"
    >
      {/* Red: Close */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] flex items-center justify-center transition active:opacity-70 group"
        title="Close"
      >
        {isHovered && <X size={8} className="text-neutral-900 stroke-[3]" />}
      </button>

      {/* Yellow: Minimize */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onMinimize()
        }}
        className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] flex items-center justify-center transition active:opacity-70 group"
        title="Minimize"
      >
        {isHovered && <Minus size={8} className="text-neutral-900 stroke-[3]" />}
      </button>

      {/* Green: Maximize / Restore */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onMaximize()
        }}
        className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] flex items-center justify-center transition active:opacity-70 group"
        title={isMaximized ? 'Restore' : 'Maximize'}
      >
        {isHovered &&
          (isMaximized ? (
            <Minimize2 size={7} className="text-neutral-900 stroke-[3]" />
          ) : (
            <Maximize2 size={7} className="text-neutral-900 stroke-[3]" />
          ))}
      </button>
    </div>
  )
}
