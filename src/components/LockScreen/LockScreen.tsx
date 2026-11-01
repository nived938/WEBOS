import React, { useState, useEffect } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import { User, Lock, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react'

export const LockScreen: React.FC = () => {
  const { isLocked, unlockSystem } = useWindowManager()
  const { settings } = useSettings()

  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!isLocked) return null

  const handleUnlock = (e?: React.FormEvent) => {
    e?.preventDefault()
    const success = unlockSystem(pin)
    if (!success) {
      soundService.playAlert()
      setError(true)
      setTimeout(() => setError(false), 600)
    } else {
      setPin('')
      setError(false)
    }
  }

  const handleQuickUnlock = () => {
    unlockSystem(settings.lockPin || '1234')
    setPin('')
    setError(false)
  }

  const timeFormatted = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateFormatted = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="fixed inset-0 z-[9990] backdrop-blur-3xl bg-neutral-950/60 flex flex-col justify-between items-center py-14 px-6 select-none text-white animate-fadeIn">
      {/* Top Header: Clock & Date */}
      <div className="flex flex-col items-center mt-6">
        <h1 className="text-7xl md:text-8xl font-light tracking-tight text-white drop-shadow-md">
          {timeFormatted}
        </h1>
        <p className="text-lg md:text-xl font-medium text-neutral-300 mt-2 tracking-wide">
          {dateFormatted}
        </p>
      </div>

      {/* Middle: User Card & PIN Pad */}
      <div className="flex flex-col items-center w-full max-w-sm">
        {/* User Avatar */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[2px] shadow-2xl shadow-blue-500/30">
            <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-cyan-300" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1.5 rounded-full border-2 border-neutral-900 shadow">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <h2 className="text-lg font-semibold tracking-wide text-white mb-1">
          {settings.username || 'NOVA Administrator'}
        </h2>
        <p className="text-xs text-neutral-400 mb-6 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          System Session Locked
        </p>

        {/* PIN Entry Form */}
        <form onSubmit={handleUnlock} className="w-full flex flex-col items-center gap-3">
          <div
            className={`relative flex items-center w-64 bg-white/10 dark:bg-neutral-800/80 border rounded-2xl px-4 py-2.5 backdrop-blur-md transition-all duration-200 ${
              error
                ? 'border-red-500 ring-2 ring-red-500/30 animate-shake'
                : 'border-white/20 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30'
            }`}
          >
            <input
              type="password"
              maxLength={8}
              placeholder="Enter PIN..."
              value={pin}
              autoFocus
              onChange={(e) => setPin(e.target.value)}
              className="bg-transparent border-none text-white text-center tracking-[0.25em] text-base placeholder:tracking-normal placeholder:text-neutral-400 placeholder:text-sm focus:outline-none w-full"
            />
            <button
              type="submit"
              className="p-1 rounded-xl bg-cyan-500/80 hover:bg-cyan-500 text-neutral-950 transition-colors ml-2"
              title="Unlock"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <span className="text-xs text-red-400 font-medium">
              Incorrect PIN. (Default: 1234)
            </span>
          )}

          {/* Quick Unlock Assist */}
          <div className="flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={handleQuickUnlock}
              className="flex items-center gap-1.5 text-xs text-cyan-400/90 hover:text-cyan-300 px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/40 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Quick Unlock (Default: 1234)
            </button>
          </div>
        </form>
      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-neutral-500 tracking-wider">
        NOVA OS • Protected by Hardware Security Isolation
      </div>
    </div>
  )
}
