import React, { useState } from 'react'
import {
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Layout,
  Layers,
  CheckCircle2,
  X,
  Database,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import { bootManager } from '@/core/boot/bootManager'

interface RecoveryModeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
}

export const RecoveryModeModal: React.FC<RecoveryModeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  if (!isOpen) return null

  const handleApplyRecovery = (opt: 'no_startup_apps' | 'default_theme' | 'reset_layout' | 'clear_session' | 'full_reset') => {
    bootManager.executeRecovery(opt)
    soundService.play('notification')
    onSuccess(`Recovery action "${opt.replace(/_/g, ' ')}" executed successfully.`)
    setIsConfirming(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      <div className="bg-[#181926] border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl shadow-amber-500/10 space-y-5 text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">NOVA OS RECOVERY MODE</h2>
              <span className="text-[11px] text-amber-300 font-mono">Emergency Diagnostics & Safe Reset</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <p className="text-xs text-neutral-300 leading-relaxed">
          Use recovery tools if the desktop fails to render or a configuration error occurs.
          Your personal virtual files in the filesystem will remain intact.
        </p>

        {/* Options List */}
        <div className="space-y-2">
          {[
            {
              id: 'no_startup_apps',
              title: 'Start Without Startup Apps',
              desc: 'Disables all auto-launch apps for clean desktop entry.',
              icon: Layers,
            },
            {
              id: 'default_theme',
              title: 'Restore Default Theme & Wallpaper',
              desc: 'Resets active theme to NOVA Dark and wallpaper to Aurora.',
              icon: Sparkles,
            },
            {
              id: 'reset_layout',
              title: 'Reset Desktop Icon Arrangement',
              desc: 'Restores default desktop icon grid layout.',
              icon: Layout,
            },
            {
              id: 'clear_session',
              title: 'Clear Saved Session Cache',
              desc: 'Discards saved window states and opens a fresh desktop.',
              icon: Database,
            },
            {
              id: 'full_reset',
              title: 'Full Virtual Recovery Reset',
              desc: 'Resets session, layout, and startup apps simultaneously.',
              icon: RotateCcw,
              isDestructive: true,
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundService.playClick()
                  setSelectedOption(item.id)
                  setIsConfirming(true)
                }}
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-start gap-3 transition-colors group"
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.isDestructive ? 'text-rose-400' : 'text-amber-400'}`} />
                <div>
                  <span className={`text-xs font-semibold block ${item.isDestructive ? 'text-rose-300' : 'text-white'}`}>
                    {item.title}
                  </span>
                  <span className="text-[11px] text-neutral-400">{item.desc}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Confirmation Modal Overlay */}
        {isConfirming && selectedOption && (
          <div className="fixed inset-0 z-[10010] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-[#202234] border border-amber-500/50 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">Confirm Recovery Action</h4>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Proceed with executing "{selectedOption.replace(/_/g, ' ')}"? The OS state will be updated immediately.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApplyRecovery(selectedOption as any)}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/30 transition-all"
                >
                  Confirm & Execute
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs transition-colors"
          >
            Cancel & Exit Recovery
          </button>
        </div>
      </div>
    </div>
  )
}
