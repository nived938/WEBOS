import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { GlassButton } from './GlassButton'
import { soundService } from '@/core/audio/soundService'

export interface GlassDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  isDestructive?: boolean
  className?: string
}

export const GlassDialog: React.FC<GlassDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  isDestructive = false,
  className = '',
}) => {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundService.playClick()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundService.playClick()
          onClose()
        }
      }}
    >
      <div
        className={`w-full max-w-lg rounded-2xl bg-neutral-900/85 border border-white/20 shadow-2xl backdrop-blur-2xl p-6 flex flex-col gap-4 text-white animate-scaleUp ${className}`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
            {description && <p className="text-xs text-neutral-400 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={() => {
              soundService.playClick()
              onClose()
            }}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="py-2 text-sm text-neutral-200">{children}</div>

        {(confirmLabel || cancelLabel) && (
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            {cancelLabel && (
              <GlassButton variant="ghost" size="sm" onClick={onClose}>
                {cancelLabel}
              </GlassButton>
            )}
            {confirmLabel && (
              <GlassButton
                variant={isDestructive ? 'danger' : 'primary'}
                size="sm"
                onClick={() => {
                  onConfirm?.()
                  onClose()
                }}
              >
                {confirmLabel}
              </GlassButton>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
