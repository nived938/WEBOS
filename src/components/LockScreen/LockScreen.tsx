import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useSettings } from '@/core/settings/SettingsContext'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { soundService } from '@/core/audio/soundService'
import { WALLPAPERS } from '@/core/settings/wallpapers'
import {
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Battery,
  Bell,
  ChevronUp,
  Sparkles,
  Compass,
  Bot,
  HelpCircle,
  RotateCcw,
} from 'lucide-react'

export const LockScreen: React.FC = () => {
  const { isLocked, unlockSystem } = useWindowManager()
  const { settings, updateSettings } = useSettings()
  const { notifications, unreadCount } = useNotifications()

  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isUnlockedSuccess, setIsUnlockedSuccess] = useState(false)
  const [isPromptRevealed, setIsPromptRevealed] = useState(false)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [recoveryInput, setRecoveryInput] = useState('')
  const [recoveryError, setRecoveryError] = useState(false)

  const [currentTime, setCurrentTime] = useState(new Date())
  const pinInputRef = useRef<HTMLInputElement>(null)

  // Clock updater
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto focus PIN input when revealed
  useEffect(() => {
    if (isPromptRevealed && !showRecoveryModal) {
      setTimeout(() => pinInputRef.current?.focus(), 100)
    }
  }, [isPromptRevealed, showRecoveryModal])

  // Reset state when screen is locked
  useEffect(() => {
    if (isLocked) {
      setPin('')
      setError(false)
      setIsUnlockedSuccess(false)
      setShowRecoveryModal(false)
      setRecoveryInput('')
      // If no PIN is configured, reveal prompt immediately
      if (!settings.isPinSet) {
        setIsPromptRevealed(true)
      } else {
        setIsPromptRevealed(false)
      }
    }
  }, [isLocked, settings.isPinSet])

  // Global Enter key to reveal or unlock
  useEffect(() => {
    if (!isLocked) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (!isPromptRevealed) {
          e.preventDefault()
          soundService.playClick()
          setIsPromptRevealed(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLocked, isPromptRevealed])

  // Resolve Lock Screen Wallpaper
  const lockWallpaper = useMemo(() => {
    const targetId = settings.lockWallpaperId || settings.wallpaperId
    return WALLPAPERS.find((w) => w.id === targetId) || WALLPAPERS[0]
  }, [settings.lockWallpaperId, settings.wallpaperId])

  const wallpaperStyle = useMemo<React.CSSProperties>(() => {
    if (settings.customLockWallpaperUrl) {
      return {
        backgroundColor: lockWallpaper.fallbackColor || '#090919',
        backgroundImage: `url(${settings.customLockWallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    return {
      backgroundColor: lockWallpaper.fallbackColor || '#090919',
      backgroundImage: lockWallpaper.style,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }, [settings.customLockWallpaperUrl, lockWallpaper])

  if (!isLocked) return null

  const handleUnlock = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!pin && settings.isPinSet) {
      setError(true)
      setErrorMessage('Please enter your PIN')
      setTimeout(() => setError(false), 800)
      return
    }

    const success = await unlockSystem(pin)
    if (success) {
      setIsUnlockedSuccess(true)
      setError(false)
      setTimeout(() => {
        setPin('')
        setIsUnlockedSuccess(false)
      }, 400)
    } else {
      soundService.playAlert()
      setError(true)
      setErrorMessage('Incorrect PIN. (Default: 1234)')
      setTimeout(() => setError(false), 800)
    }
  }

  const handleQuickUnlock = async () => {
    await unlockSystem('guest')
    setPin('')
    setError(false)
  }

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetKey = settings.recoveryKey || 'NOVA-1234-RECOVER'
    if (recoveryInput.trim().toUpperCase() === targetKey.trim().toUpperCase()) {
      soundService.playStartup()
      updateSettings({
        isPinSet: false,
        lockPin: '1234',
      })
      await unlockSystem('guest')
      setShowRecoveryModal(false)
      setRecoveryInput('')
    } else {
      soundService.playAlert()
      setRecoveryError(true)
      setTimeout(() => setRecoveryError(false), 800)
    }
  }

  const timeFormatted = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateFormatted = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  // User Avatar Icon resolver
  const renderAvatar = () => {
    const avatar = settings.userAvatar || 'avatar-nova'
    if (avatar.startsWith('data:image/') || avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return (
        <img
          src={avatar}
          alt={settings.username || 'User'}
          className="w-14 h-14 rounded-full object-cover border-2 border-white/30 shadow-lg"
        />
      )
    }
    if (avatar === 'avatar-bot') return <Bot className="w-10 h-10 text-cyan-300" />
    if (avatar === 'avatar-compass') return <Compass className="w-10 h-10 text-purple-300" />
    if (avatar === 'avatar-sparkles') return <Sparkles className="w-10 h-10 text-amber-300" />
    return <User className="w-10 h-10 text-cyan-300" />
  }

  return (
    <div
      style={wallpaperStyle}
      onClick={() => {
        if (!isPromptRevealed && !showRecoveryModal) {
          soundService.playClick()
          setIsPromptRevealed(true)
        }
      }}
      className={`fixed inset-0 z-[9990] flex flex-col justify-between items-center py-6 px-8 select-none text-white transition-all duration-700 ${
        isUnlockedSuccess ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Liquid Glass Ambient Backdrop Blur */}
      <div className="absolute inset-0 bg-neutral-950/45 backdrop-blur-2xl -z-10" />

      {/* Top Status Bar */}
      <div className="w-full flex items-center justify-between text-xs text-white/80 font-medium z-10 px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="tracking-widest uppercase text-[11px] font-semibold text-cyan-200">
            NOVA OS
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          {/* Wi-Fi Indicator */}
          <div className="flex items-center gap-1.5 text-neutral-300" title="Network Connection">
            {settings.wifiEnabled ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline text-[11px]">Nova-5G</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline text-[11px]">Offline</span>
              </>
            )}
          </div>

          {/* Battery Status */}
          <div className="flex items-center gap-1 text-emerald-400" title="Power: 100% Adapter">
            <span className="text-[11px]">100%</span>
            <Battery className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Center Clock & Date */}
      <div className="flex flex-col items-center mt-6 transition-all duration-300">
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-extralight tracking-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          {timeFormatted}
        </h1>
        <p className="text-base sm:text-lg md:text-xl font-medium text-neutral-200 mt-2 tracking-wide drop-shadow">
          {dateFormatted}
        </p>

        {/* Notification Preview Badge */}
        {unreadCount > 0 && notifications.length > 0 && !isPromptRevealed && (
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-neutral-200 shadow-lg animate-pulse">
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {unreadCount} notification{unreadCount > 1 ? 's' : ''} • {notifications[0].title}
            </span>
          </div>
        )}
      </div>

      {/* Unlock Section */}
      <div className="w-full max-w-sm flex flex-col items-center mb-8 z-10">
        {!isPromptRevealed ? (
          /* Swipe / Click / Enter Prompt */
          <button
            onClick={() => {
              soundService.playClick()
              setIsPromptRevealed(true)
            }}
            className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
          >
            <ChevronUp className="w-6 h-6 text-cyan-400 animate-bounce group-hover:scale-125 transition-transform" />
            <span className="text-xs font-semibold tracking-wider uppercase text-neutral-300 group-hover:text-white transition-colors">
              Click anywhere or press Enter to unlock
            </span>
          </button>
        ) : (
          /* User Profile & PIN Card */
          <div className="w-full flex flex-col items-center animate-fadeIn">
            {/* User Avatar */}
            <div className="relative mb-3.5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[2px] shadow-2xl shadow-blue-500/30">
                <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center overflow-hidden">
                  {renderAvatar()}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1.5 rounded-full border-2 border-neutral-900 shadow">
                <Lock className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* User Greeting & Bio */}
            <h2 className="text-lg font-bold tracking-wide text-white">
              {settings.username || 'Commander Nova'}
            </h2>
            <p className="text-xs text-cyan-300/90 font-medium mt-0.5">
              {settings.userGreeting || 'Welcome back to NOVA OS'}
            </p>
            {settings.userBio && (
              <p className="text-[11px] text-neutral-400 mt-0.5 max-w-[280px] text-center truncate">
                {settings.userBio}
              </p>
            )}

            {/* PIN Entry Form */}
            {settings.isPinSet ? (
              <form onSubmit={handleUnlock} className="w-full flex flex-col items-center gap-2.5 mt-5">
                <div
                  className={`relative flex items-center w-64 bg-white/10 dark:bg-neutral-900/80 border rounded-2xl px-3.5 py-2.5 backdrop-blur-xl transition-all duration-200 ${
                    error
                      ? 'border-red-500 ring-2 ring-red-500/30 animate-shake'
                      : isUnlockedSuccess
                      ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                      : 'border-white/20 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30'
                  }`}
                >
                  <input
                    ref={pinInputRef}
                    type={showPin ? 'text' : 'password'}
                    maxLength={12}
                    placeholder="Enter Security PIN..."
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="bg-transparent border-none text-white text-center tracking-[0.2em] text-sm placeholder:tracking-normal placeholder:text-neutral-400 placeholder:text-xs focus:outline-none w-full font-mono"
                  />

                  {/* Show / Hide PIN Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="p-1 text-neutral-400 hover:text-white transition-colors ml-1"
                    title={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="p-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 transition-colors ml-1 shadow-sm"
                    title="Unlock Session"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {error && (
                  <span className="text-xs text-red-400 font-medium">{errorMessage}</span>
                )}

                {/* Quick Unlock & Recovery Links */}
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={handleQuickUnlock}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Guest Unlock (1234)
                  </button>

                  <span className="text-neutral-600">•</span>

                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(true)}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Forgot PIN?
                  </button>
                </div>
              </form>
            ) : (
              /* No PIN Needed: Direct Continue */
              <div className="mt-5">
                <button
                  onClick={handleQuickUnlock}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Continue to Desktop</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recovery Key Reset Modal */}
      {showRecoveryModal && (
        <div
          onClick={() => setShowRecoveryModal(false)}
          className="fixed inset-0 z-[9995] bg-black/70 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-neutral-900/90 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center gap-2.5 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-base font-bold">Lock Screen Recovery</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Enter your emergency recovery key to bypass the lock screen and reset your security PIN.
            </p>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-neutral-400 text-[11px] block mb-1">Default Recovery Key:</span>
              <span className="font-mono text-cyan-300 font-semibold select-all">
                {settings.recoveryKey || 'NOVA-8492-7201-9482'}
              </span>
            </div>

            <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="NOVA-XXXX-XXXX-XXXX"
                value={recoveryInput}
                onChange={(e) => setRecoveryInput(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 uppercase tracking-wider text-center"
              />

              {recoveryError && (
                <span className="text-xs text-red-400 text-center font-medium">
                  Invalid recovery key. Please check and try again.
                </span>
              )}

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-neutral-950 transition"
                >
                  Verify & Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Info & Privacy Gate Notice */}
      <div className="text-[11px] text-neutral-400/80 tracking-wider text-center z-10 flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
        <span>NOVA OS • Client-Side Privacy Gate</span>
        <span className="hidden sm:inline">•</span>
        <span>Local Browser Protected Session</span>
      </div>
    </div>
  )
}
