import React, { useEffect, useState } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { soundService } from '@/core/audio/soundService'
import { bootManager, type UserProfile } from '@/core/boot/bootManager'
import { Sparkles, ShieldAlert, User, Check, Play } from 'lucide-react'
import { RecoveryModeModal } from './RecoveryModeModal'

export const BootScreen: React.FC = () => {
  const { isBooting, completeBoot } = useWindowManager()
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('Initializing NOVA OS Kernel...')
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false)
  const [profiles, setProfiles] = useState<UserProfile[]>(() => bootManager.getProfiles())
  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => bootManager.getActiveProfile().id)
  const [showProfilePicker, setShowProfilePicker] = useState(false)

  useEffect(() => {
    if (!isBooting) {
      setProgress(0)
      return
    }

    // 8 Realistic Virtual OS Boot Stages
    const stages = [
      { at: 10, label: 'Probing Browser Compositor & Hardware Concurrency...' },
      { at: 25, label: 'Starting Virtual Window Manager & Liquid Glass Shaders...' },
      { at: 40, label: 'Mounting Virtual File System (VFS) & Virtual Storage...' },
      { at: 55, label: 'Loading User Security Credentials & Cryptographic Salts...' },
      { at: 70, label: 'Initializing Audio Engine & WebGL Three.js Subsystems...' },
      { at: 82, label: 'Verifying Installed Application Packages & Plugins...' },
      { at: 94, label: 'Restoring Previous Desktop Workspace Session...' },
      { at: 100, label: 'Welcome to NOVA OS' },
    ]

    const startTime = Date.now()
    const duration = 2200

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentProgress = Math.min(100, Math.floor((elapsed / duration) * 100))
      setProgress(currentProgress)

      for (let i = stages.length - 1; i >= 0; i--) {
        if (currentProgress >= stages[i].at) {
          setStage(stages[i].label)
          break
        }
      }

      if (currentProgress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          soundService.playStartup()
          completeBoot()
        }, 250)
      }
    }, 35)

    return () => clearInterval(interval)
  }, [isBooting, completeBoot])

  if (!isBooting) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-[#090a10] flex flex-col items-center justify-center select-none text-white transition-opacity duration-700">
      {/* Recovery Mode Modal */}
      <RecoveryModeModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        onSuccess={() => {
          setProfiles(bootManager.getProfiles())
        }}
      />

      {/* Celestial Star Glow & Icon */}
      <div className="relative mb-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[2px] shadow-2xl shadow-cyan-500/30 flex items-center justify-center">
          <div className="w-full h-full bg-neutral-950/90 rounded-[22px] flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" />
          </div>
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-cyan-200">
          NOVA OS
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mt-1">
          Browser Operating System Kernel 2.5
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="w-80 max-w-[85vw] flex flex-col items-center gap-3">
        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-white rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(56,189,248,0.7)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="w-full flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span className="truncate pr-2">{stage}</span>
          <span className="text-neutral-500">{progress}%</span>
        </div>
      </div>

      {/* Action Buttons: Skip & Recovery Mode */}
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => {
            soundService.playStartup()
            completeBoot()
          }}
          className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-full border border-neutral-700 hover:border-neutral-500 transition-all opacity-80 hover:opacity-100 flex items-center gap-1.5"
        >
          <Play className="w-3 h-3" /> Skip Boot Sequence
        </button>

        <button
          onClick={() => setIsRecoveryOpen(true)}
          className="text-xs text-amber-400/80 hover:text-amber-300 px-3 py-1.5 rounded-full border border-amber-500/30 hover:border-amber-500/60 transition-all flex items-center gap-1.5"
        >
          <ShieldAlert className="w-3 h-3" /> Recovery Mode
        </button>
      </div>
    </div>
  )
}
