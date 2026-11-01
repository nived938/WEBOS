import React, { useState } from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { createSecurePin, generateRecoveryKey } from '@/core/security/cryptoPin'
import { WALLPAPERS } from '@/core/settings/wallpapers'
import type { AutoLockTimeout } from '@/types'
import {
  Lock,
  Key,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Upload,
  Trash2,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react'

export const LockScreenSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()
  const { lockSystem } = useWindowManager()
  const { addNotification } = useNotifications()

  // PIN Form state
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPinFields, setShowPinFields] = useState(false)
  const [pinMessage, setPinMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const [isHashing, setIsHashing] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  const autoLockOptions: { value: AutoLockTimeout; label: string }[] = [
    { value: 0, label: 'Never (Disabled)' },
    { value: 1, label: '1 minute' },
    { value: 2, label: '2 minutes' },
    { value: 5, label: '5 minutes (Recommended)' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
  ]

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinMessage(null)
    if (!newPin || newPin.length < 4 || newPin.length > 8) {
      setPinMessage({ text: 'PIN must be between 4 and 8 digits.', isError: true })
      return
    }
    if (newPin !== confirmPin) {
      setPinMessage({ text: 'PINs do not match. Please verify both fields.', isError: true })
      return
    }

    setIsHashing(true)
    try {
      const pinResult = await createSecurePin(newPin)
      updateSettings({
        pinHash: pinResult.hash,
        pinSalt: pinResult.salt,
        recoveryKey: pinResult.recoveryKey,
        isPinSet: true,
      })
      soundService.playStartup()
      setPinMessage({ text: 'PIN secured with PBKDF2 (100,000 iterations)!', isError: false })
      setNewPin('')
      setConfirmPin('')
      addNotification('Security Updated', 'New PIN hashed and saved securely with cryptographic salt.', 'settings')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to secure PIN.'
      setPinMessage({ text: message, isError: true })
    } finally {
      setIsHashing(false)
    }
  }

  const handleCopyRecoveryKey = () => {
    const key = settings.recoveryKey || 'NOVA-8492-7201-9482'
    navigator.clipboard?.writeText(key)
    setCopiedKey(true)
    soundService.playClick()
    setTimeout(() => setCopiedKey(false), 2000)
    addNotification('Recovery Key Copied', 'Copied recovery key to system clipboard.', 'settings')
  }

  const handleRegenerateRecoveryKey = () => {
    soundService.playClick()
    const newKey = generateRecoveryKey()
    updateSettings({ recoveryKey: newKey })
    addNotification('Recovery Key Regenerated', 'A new emergency recovery key has been created.', 'settings')
  }

  const handleUploadLockWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addNotification('Invalid Format', 'Please upload a PNG, JPG, WebP, or SVG image.', 'settings')
      return
    }
    if (file.size > 2.5 * 1024 * 1024) {
      addNotification('File Exceeds Limit', 'Lock wallpaper should be under 2.5MB for fast loading.', 'settings')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      updateSettings({
        lockWallpaperId: 'custom',
        customLockWallpaperUrl: dataUrl,
        lockWallpaperType: 'custom',
      })
      soundService.playClick()
      addNotification('Lock Wallpaper Updated', `Set custom lock wallpaper from "${file.name}"`, 'settings')
    }
    reader.readAsDataURL(file)
  }

  const activeLockWallpaper =
    WALLPAPERS.find((w) => w.id === settings.lockWallpaperId) || WALLPAPERS[0]

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1">Lock Screen & Security</h3>
          <p className="text-neutral-400 text-xs">
            Manage your cryptographic PIN, emergency recovery key, lock screen wallpaper, and inactivity timeout.
          </p>
        </div>
        <button
          onClick={() => {
            soundService.playClick()
            lockSystem()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition shadow-md shadow-purple-600/20"
        >
          <Lock size={13} />
          <span>Lock System</span>
        </button>
      </div>

      {/* Lock Screen Clock Format */}
      <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
          <Clock size={14} className="text-cyan-400" />
          <span>Lock Screen Clock Format</span>
        </label>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {(['12h', '24h'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => {
                soundService.playClick()
                updateSettings({
                  panelSettings: {
                    ...settings.panelSettings,
                    clockFormat: fmt,
                  },
                })
              }}
              className={`py-2 rounded-xl border text-xs font-semibold transition ${
                settings.panelSettings.clockFormat === fmt
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              {fmt === '12h' ? '12-Hour (e.g. 02:45 PM)' : '24-Hour (e.g. 14:45)'}
            </button>
          ))}
        </div>
      </div>

      {/* Lock Screen Wallpaper Selection */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white text-xs">Lock Screen Wallpaper</h4>
            <p className="text-[11px] text-neutral-400">Can be configured independently from desktop wallpaper.</p>
          </div>
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer transition shadow-md shadow-blue-600/20">
            <Upload size={13} />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleUploadLockWallpaper}
              className="hidden"
            />
          </label>
        </div>

        {/* Mini Lock Wallpaper Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {WALLPAPERS.slice(0, 6).map((w) => {
            const isSelected = settings.lockWallpaperId === w.id && !settings.customLockWallpaperUrl
            return (
              <div
                key={w.id}
                onClick={() => {
                  soundService.playClick()
                  updateSettings({
                    lockWallpaperId: w.id,
                    customLockWallpaperUrl: undefined,
                    lockWallpaperType: w.type === 'dynamic' ? 'dynamic' : 'gradient',
                  })
                }}
                className={`relative rounded-xl overflow-hidden border cursor-pointer aspect-video transition-all shadow-sm ${
                  isSelected ? 'border-cyan-400 ring-2 ring-cyan-500/50 scale-[1.02]' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: w.fallbackColor || '#090919',
                    backgroundImage: w.style,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-black">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
                <div className="absolute bottom-1 left-1.5 right-1">
                  <span className="text-[9px] font-semibold text-white truncate block drop-shadow-md">{w.name}</span>
                </div>
              </div>
            )
          })}
        </div>

        {settings.customLockWallpaperUrl && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
            <span className="text-cyan-200">Custom lock wallpaper is active</span>
            <button
              onClick={() => {
                soundService.playClick()
                updateSettings({
                  lockWallpaperId: 'deep-space',
                  customLockWallpaperUrl: undefined,
                  lockWallpaperType: 'gradient',
                })
              }}
              className="text-red-400 hover:text-red-300 text-[11px] font-medium"
            >
              Reset to Built-in
            </button>
          </div>
        )}
      </div>

      {/* Lock Screen PIN Protection */}
      <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <div>
              <div className="font-semibold text-white text-xs">Require PIN to Unlock</div>
              <div className="text-[11px] text-neutral-400">Protects desktop with cryptographic PBKDF2 hash</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.lockScreenEnabled}
            onChange={(e) => updateSettings({ lockScreenEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
          />
        </div>

        {/* PIN Configuration Form */}
        <form onSubmit={handleUpdatePin} className="space-y-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-neutral-300">Set / Change Master PIN</label>
            <button
              type="button"
              onClick={() => setShowPinFields(!showPinFields)}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              {showPinFields ? <EyeOff size={12} /> : <Eye size={12} />}
              <span>{showPinFields ? 'Hide PIN' : 'Show PIN'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type={showPinFields ? 'text' : 'password'}
              maxLength={8}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="New PIN (4-8 digits)"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500 font-mono tracking-widest"
            />
            <input
              type={showPinFields ? 'text' : 'password'}
              maxLength={8}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Confirm PIN"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500 font-mono tracking-widest"
            />
          </div>

          {pinMessage && (
            <div
              className={`p-2 rounded-xl text-[11px] flex items-center gap-1.5 ${
                pinMessage.isError
                  ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              }`}
            >
              {pinMessage.isError ? <AlertCircle size={13} /> : <Check size={13} />}
              <span>{pinMessage.text}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isHashing || !newPin || !confirmPin}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs transition"
            >
              {isHashing ? 'Hashing (PBKDF2)...' : 'Save PIN'}
            </button>
          </div>
        </form>
      </div>

      {/* Inactivity Auto-Lock Timeout */}
      <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
        <label className="text-xs font-semibold text-neutral-300">Inactivity Auto-Lock Timeout</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {autoLockOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                soundService.playClick()
                updateSettings({ autoLockTimeout: opt.value })
              }}
              className={`p-2 rounded-xl text-left border text-[11px] font-medium transition ${
                settings.autoLockTimeout === opt.value
                  ? 'border-blue-500 bg-blue-500/20 text-white font-bold'
                  : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Recovery Key */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-amber-400" />
            <div>
              <div className="font-semibold text-white text-xs">Emergency Recovery Key</div>
              <div className="text-[11px] text-neutral-400">Allows unlocking if you forget your master PIN</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyRecoveryKey}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Copy Key"
            >
              {copiedKey ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
            <button
              onClick={handleRegenerateRecoveryKey}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Regenerate Key"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-amber-300 tracking-wider text-center select-all">
          {settings.recoveryKey || 'NOVA-8492-7201-9482'}
        </div>
      </div>
    </div>
  )
}
