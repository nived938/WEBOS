import React from 'react'
import { soundService } from '@/core/audio/soundService'

export interface GlassMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  danger?: boolean
  disabled?: boolean
  separator?: boolean
  onClick?: () => void
}

export interface GlassMenuProps {
  items: GlassMenuItem[]
  onClose?: () => void
  className?: string
}

export const GlassMenu: React.FC<GlassMenuProps> = ({ items, onClose, className = '' }) => {
  return (
    <div
      className={`min-w-48 py-1.5 rounded-xl bg-neutral-900/90 border border-white/15 shadow-2xl backdrop-blur-2xl text-xs text-white z-[110] animate-fadeIn ${className}`}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={`sep-${index}`} className="my-1 border-t border-white/10" />
        }

        return (
          <button
            key={item.id}
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return
              soundService.playClick()
              item.onClick?.()
              onClose?.()
            }}
            className={`w-full flex items-center justify-between px-3.5 py-1.5 text-left transition-colors ${
              item.disabled
                ? 'opacity-40 cursor-not-allowed'
                : item.danger
                ? 'hover:bg-red-500/20 text-red-300 hover:text-red-200'
                : 'hover:bg-white/10 text-neutral-200 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {item.icon && <span className="opacity-80">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
            {item.shortcut && (
              <span className="text-[10px] text-neutral-400 font-mono pl-3">{item.shortcut}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
