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

  // Stop all pointer and mouse events from bubbling to the window titlebar drag handler
  const handleControlEvent = (e: React.SyntheticEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      data-window-controls="true"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={handleControlEvent}
      onMouseDown={handleControlEvent}
      onPointerUp={handleControlEvent}
      onMouseUp={handleControlEvent}
      onDoubleClick={handleControlEvent}
      className="relative z-40 flex items-center gap-2 px-3 py-2 shrink-0 pointer-events-auto select-none"
    >
      {/* Red: Close */}
      <button
        type="button"
        aria-label="Close window"
        title="Close"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        onPointerDown={handleControlEvent}
        onMouseDown={handleControlEvent}
        onPointerUp={handleControlEvent}
        onDoubleClick={handleControlEvent}
        className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] border border-[#e0443e] flex items-center justify-center transition-all duration-150 hover:brightness-110 active:scale-90 active:brightness-90 cursor-pointer shadow-sm relative group focus:outline-none focus:ring-1 focus:ring-red-400"
      >
        {isHovered && <X size={8} className="text-neutral-900 stroke-[3.5] pointer-events-none" />}
      </button>

      {/* Yellow: Minimize */}
      <button
        type="button"
        aria-label="Minimize window"
        title="Minimize"
        onClick={(e) => {
          e.stopPropagation()
          onMinimize()
        }}
        onPointerDown={handleControlEvent}
        onMouseDown={handleControlEvent}
        onPointerUp={handleControlEvent}
        onDoubleClick={handleControlEvent}
        className="w-3.5 h-3.5 rounded-full bg-[#febc2e] border border-[#d89e24] flex items-center justify-center transition-all duration-150 hover:brightness-110 active:scale-90 active:brightness-90 cursor-pointer shadow-sm relative group focus:outline-none focus:ring-1 focus:ring-amber-400"
      >
        {isHovered && <Minus size={8} className="text-neutral-900 stroke-[3.5] pointer-events-none" />}
      </button>

      {/* Green: Maximize / Restore */}
      <button
        type="button"
        aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
        title={isMaximized ? 'Restore' : 'Maximize'}
        onClick={(e) => {
          e.stopPropagation()
          onMaximize()
        }}
        onPointerDown={handleControlEvent}
        onMouseDown={handleControlEvent}
        onPointerUp={handleControlEvent}
        onDoubleClick={handleControlEvent}
        className="w-3.5 h-3.5 rounded-full bg-[#28c840] border border-[#1aab29] flex items-center justify-center transition-all duration-150 hover:brightness-110 active:scale-90 active:brightness-90 cursor-pointer shadow-sm relative group focus:outline-none focus:ring-1 focus:ring-emerald-400"
      >
        {isHovered &&
          (isMaximized ? (
            <Minimize2 size={7} className="text-neutral-900 stroke-[3] pointer-events-none" />
          ) : (
            <Maximize2 size={7} className="text-neutral-900 stroke-[3] pointer-events-none" />
          ))}
      </button>
    </div>
  )
}
