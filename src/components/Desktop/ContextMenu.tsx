import React from 'react'

export interface MenuItem {
  label: string
  action: () => void
  disabled?: boolean
  divider?: boolean
  danger?: boolean
  shortcut?: string
}

interface ContextMenuProps {
  x: number
  y: number
  items: MenuItem[]
  onClose: () => void
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  // Ensure menu stays within screen bounds
  const menuW = 200
  const menuH = items.length * 28 + 10
  const screenW = window.innerWidth || 1280
  const screenH = window.innerHeight || 800

  const posX = Math.min(x, screenW - menuW - 10)
  const posY = Math.min(y, screenH - menuH - 10)

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ left: `${posX}px`, top: `${posY}px` }}
      className="fixed z-[997] w-52 bg-neutral-900/85 backdrop-blur-3xl border border-white/20 rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] py-1 text-xs text-neutral-200 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {items.map((item, idx) => {
        if (item.divider) {
          return <div key={idx} className="my-1 border-t border-white/10" />
        }
        return (
          <button
            key={idx}
            disabled={item.disabled}
            onClick={() => {
              item.action()
              onClose()
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 transition text-left ${
              item.disabled
                ? 'opacity-40 cursor-not-allowed'
                : item.danger
                ? 'hover:bg-red-600 hover:text-white text-red-300'
                : 'hover:bg-blue-600 hover:text-white text-neutral-200'
            }`}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-[10px] text-neutral-400 font-mono">{item.shortcut}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
