import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useSettings } from '@/core/settings/SettingsContext'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { soundService } from '@/core/audio/soundService'
import { WALLPAPERS } from '@/core/settings/wallpapers'
import {
  getPinLockoutStatus,
  verifyRecoveryKey,
  MAX_ATTEMPTS_BEFORE_LOCKOUT,
} from '@/core/security/cryptoPin'
import {
  User,
  Lock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
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
  AlertTriangle,
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

  // Rate Limiting & Lockout
  const [lockout, setLockout] = useState(() => getPinLockoutStatus())
  const [currentTime, setCurrentTime] = useState(new Date())
  const pinInputRef = useRef<HTMLInputElement>(null)

  // Clock updater & Lockout countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      const currentLockout = getPinLockoutStatus()
      setLockout(currentLockout)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto focus PIN input when revealed
  useEffect(() => {
    if (isPromptRevealed && !showRecoveryModal && !lockout.isLockedOut) {
      setTimeout(() => pinInputRef.current?.focus(), 100)
    }
  }, [isPromptRevealed, showRecoveryModal, lockout.isLockedOut])

  // Reset state when screen is locked
  useEffect(() => {
    if (isLocked) {
      setPin('')
      setError(false)
      setIsUnlockedSuccess(false)
      setShowRecoveryModal(false)
      setRecoveryInput('')
      setLockout(getPinLockoutStatus())
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

    // Enforce rate limiting check
    if (lockout.isLockedOut) {
      soundService.playAlert()
      setError(true)
      setErrorMessage(`Too many failed attempts. Wait ${lockout.remainingSeconds}s.`)
      setTimeout(() => setError(false), 1200)
      return
    }

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
      const updatedLockout = getPinLockoutStatus()
      setLockout(updatedLockout)
      setError(true)
      if (updatedLockout.isLockedOut) {
        setErrorMessage(`Too many attempts. Lockout active for ${updatedLockout.remainingSeconds}s.`)
      } else {
        const remaining = MAX_ATTEMPTS_BEFORE_LOCKOUT - updatedLockout.failedAttempts
        setErrorMessage(
          remaining > 0
            ? `Incorrect PIN. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`
            : 'Incorrect PIN.'
        )
      }
      setTimeout(() => setError(false), 1500)
    }
  }

  const handleUnlockWithoutPin = async () => {
    if (!settings.isPinSet) {
      await unlockSystem()
    }
  }

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings.recoveryKey) {
      setRecoveryError(true)
      return
    }

    const isValid = verifyRecoveryKey(recoveryInput, settings.recoveryKey)
    if (isValid) {
      soundService.playStartup()
      // Wipe the forgotten credentials safely so user can configure a new PIN
      updateSettings({
        isPinSet: false,
        lockScreenEnabled: false,
        pinHash: undefined,
        pinSalt: undefined,
        recoveryKey: undefined,
        lockPin: undefined,
      })
      await unlockSystem()
      setShowRecoveryModal(false)
      setRecoveryInput('')
    } else {
      soundService.playAlert()
      setRecoveryError(true)
      setTimeout(() => setRecoveryError(false), 1200)
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
      <div className="absolute inset-0 bg-neutral-950/50 backdrop-blur-2xl -z-10" />

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

            {/* Lockout Notification Card */}
            {lockout.isLockedOut && (
              <div className="mt-4 px-4 py-3 rounded-2xl bg-red-950/80 border border-red-500/40 text-center flex items-center gap-2.5 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-red-300">Authentication Rate Limit Active</p>
                  <p className="text-[11px] text-red-200/80">
                    Temporarily locked for {lockout.remainingSeconds}s due to repeated failures.
                  </p>
                </div>
              </div>
            )}

            {/* PIN Entry Form */}
            {settings.isPinSet ? (
              <form onSubmit={handleUnlock} className="w-full flex flex-col items-center gap-2.5 mt-4">
                <div
                  className={`relative flex items-center w-64 bg-white/10 dark:bg-neutral-900/80 border rounded-2xl px-3.5 py-2.5 backdrop-blur-xl transition-all duration-200 ${
                    lockout.isLockedOut
                      ? 'border-red-500/50 opacity-50 cursor-not-allowed'
                      : error
                      ? 'border-red-500 ring-2 ring-red-500/30 animate-shake'
                      : isUnlockedSuccess
                      ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                      : 'border-white/20 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30'
                  }`}
                >
                  <input
                    ref={pinInputRef}
                    disabled={lockout.isLockedOut}
                    type={showPin ? 'text' : 'password'}
                    maxLength={32}
                    placeholder={lockout.isLockedOut ? 'Locked Out' : 'Enter Security PIN...'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="bg-transparent border-none text-white text-center tracking-[0.2em] text-sm placeholder:tracking-normal placeholder:text-neutral-400 placeholder:text-xs focus:outline-none w-full font-mono disabled:cursor-not-allowed"
                  />

                  {/* Show / Hide PIN Toggle */}
                  <button
                    type="button"
                    disabled={lockout.isLockedOut}
                    onClick={() => setShowPin(!showPin)}
                    className="p-1 text-neutral-400 hover:text-white transition-colors ml-1 disabled:opacity-30"
                    title={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={lockout.isLockedOut}
                    className="p-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 transition-colors ml-1 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Unlock Session"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {error && (
                  <span className="text-xs text-red-400 font-medium text-center">{errorMessage}</span>
                )}

                {/* Account Recovery Link */}
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(true)}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-cyan-300 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Reset with Recovery Key
                  </button>
                </div>
              </form>
            ) : (
              /* No PIN Needed: Direct Continue with Guidance */
              <div className="mt-5 flex flex-col items-center gap-3 text-center">
                <p className="text-[11px] text-neutral-400 max-w-[260px] leading-relaxed">
                  PIN security is currently disabled. Configure a personal PIN in System Settings to shield your desktop.
                </p>
                <button
                  onClick={handleUnlockWithoutPin}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Enter Desktop</span>
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
          className="fixed inset-0 z-[9995] bg-black/75 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-neutral-900/95 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center gap-2.5 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-base font-bold">Privacy Lock Recovery</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Enter your emergency recovery key to verify your session and reset your local PIN hash.
            </p>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Browser Privacy Notice:</strong> This recovery reset applies to this local browser session. It is not hardware encryption and does not replace Windows account security.
              </span>
            </div>

            <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-3 mt-1">
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
                  Verify & Reset PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Info & Honest Privacy Notice */}
      <div className="text-[11px] text-neutral-400/80 tracking-wider text-center z-10 flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
        <span>NOVA OS • Client-Side Privacy Shield</span>
        <span className="hidden sm:inline">•</span>
        <span>Local Browser Session Lock</span>
      </div>
    </div>
  )
}
