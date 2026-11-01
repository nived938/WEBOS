import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { useSettings } from '@/core/settings/SettingsContext'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { WALLPAPERS } from '@/core/settings/wallpapers'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { usePointerLock } from '@/core/pointer/PointerLockContext'
import { hashPin, generateRecoveryKey } from '@/core/security/cryptoPin'
import type { AccentColor, ThemeMode, CursorStyle, PerformanceMode, AutoLockTimeout } from '@/types'
import {
  User,
  Bot,
  Compass,
  Key,
  Copy,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Palette,
  Image,
  Sliders,
  Volume2,
  Bell,
  HardDrive,
  Info,
  RotateCcw,
  Sun,
  Moon,
  Sparkles,
  Check,
  CheckCheck,
  Monitor,
  Laptop,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  MousePointer,
  Lock,
  Zap,
  Clock,
} from 'lucide-react'

export const SettingsApp: React.FC<AppInstanceProps> = () => {
  const { settings, updateSettings, resetSettings } = useSettings()
  const { lockSystem } = useWindowManager()
  const { nodes, resetToDefault } = useFileSystem()
  const { addNotification } = useNotifications()
  const { isSupported: isPointerLockSupported, isLocked: isPointerLocked, requestLock: requestPointerLock } = usePointerLock()

  const [activeSection, setActiveSection] = useState<
    | 'profile'
    | 'appearance'
    | 'wallpaper'
    | 'dock'
    | 'display'
    | 'sound'
    | 'security'
    | 'notifications'
    | 'storage'
    | 'about'
  >('profile')
  const [wallpaperFilter, setWallpaperFilter] = useState<'all' | 'dynamic' | 'gradient'>('all')
  const [lockWallpaperFilter, setLockWallpaperFilter] = useState<'all' | 'dynamic' | 'gradient'>('all')

  // PIN Form state
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPinFields, setShowPinFields] = useState(false)
  const [pinMessage, setPinMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const [isHashing, setIsHashing] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  const handleUploadCustomWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addNotification('Invalid Format', 'Please upload a PNG, JPG, WebP, or SVG image.', 'settings')
      return
    }
    if (file.size > 2.5 * 1024 * 1024) {
      addNotification('File Exceeds Limit', 'Image should be under 2.5MB to ensure fast desktop rendering.', 'settings')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      updateSettings({
        wallpaperId: 'custom',
        customWallpaperUrl: dataUrl,
      })
      soundService.playClick()
      addNotification('Wallpaper Updated', `Set custom wallpaper from "${file.name}"`, 'settings')
    }
    reader.readAsDataURL(file)
  }

  const handleUploadCustomAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addNotification('Invalid Format', 'Please upload a PNG, JPG, WebP, or SVG image.', 'settings')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      addNotification('File Exceeds Limit', 'Avatar image should be under 2MB.', 'settings')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      updateSettings({ userAvatar: dataUrl })
      soundService.playClick()
      addNotification('Avatar Updated', 'Custom profile picture set successfully.', 'settings')
    }
    reader.readAsDataURL(file)
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
      const { hash, salt } = await hashPin(newPin)
      updateSettings({
        pinHash: hash,
        pinSalt: salt,
        isPinSet: true,
        lockPin: newPin,
      })
      soundService.playStartup()
      setPinMessage({ text: 'PIN secured with PBKDF2 (100,000 iterations)!', isError: false })
      setNewPin('')
      setConfirmPin('')
      addNotification('Security Updated', 'New PIN hashed and saved securely with cryptographic salt.', 'settings')
    } catch {
      setPinMessage({ text: 'Failed to compute cryptographic hash.', isError: true })
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

  const [showResetModal, setShowResetModal] = useState(false)

  const accentOptions: { id: AccentColor; name: string; color: string }[] = [
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'purple', name: 'Purple', color: '#8b5cf6' },
    { id: 'emerald', name: 'Emerald', color: '#10b981' },
    { id: 'orange', name: 'Orange', color: '#f97316' },
    { id: 'rose', name: 'Rose', color: '#f43f5e' },
    { id: 'amber', name: 'Amber', color: '#f59e0b' },
  ]

  const autoLockOptions: { value: AutoLockTimeout; label: string }[] = [
    { value: 0, label: 'Never (Disabled)' },
    { value: 1, label: '1 minute' },
    { value: 2, label: '2 minutes' },
    { value: 5, label: '5 minutes (Recommended)' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
  ]

  const avatarPresets = [
    { id: 'avatar-nova', name: 'Astronaut', icon: User, color: 'text-cyan-400', bg: 'from-blue-600 to-cyan-500' },
    { id: 'avatar-bot', name: 'Android', icon: Bot, color: 'text-emerald-400', bg: 'from-emerald-600 to-teal-500' },
    { id: 'avatar-compass', name: 'Navigator', icon: Compass, color: 'text-purple-400', bg: 'from-purple-600 to-indigo-500' },
    { id: 'avatar-sparkles', name: 'Nebula', icon: Sparkles, color: 'text-amber-400', bg: 'from-amber-600 to-rose-500' },
  ]

  // Storage calculations
  const totalStorage = 100 * 1024 * 1024 // 100 MB simulated virtual quota
  const usedBytes = nodes.reduce((acc, curr) => acc + (curr.size || 0), 0)
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(2)

  const handleSoundTest = () => {
    soundService.playStartup()
  }

  const handleFullReset = () => {
    soundService.playTrashEmpty()
    resetSettings()
    resetToDefault()
    setShowResetModal(false)
    addNotification('System Reset', 'NOVA OS settings and virtual files restored to factory defaults', 'settings')
  }

  return (
    <div className="flex h-full bg-neutral-900/90 text-neutral-200 select-none backdrop-blur-xl relative">
      {/* Sidebar Navigation */}
      <div className="w-52 border-r border-white/10 bg-black/20 flex flex-col p-3 space-y-1 text-xs">
        <div className="px-3 py-2 font-bold text-white text-sm mb-1">Settings</div>

        {/* User Profile item at top */}
        <button
          onClick={() => {
            soundService.playClick()
            setActiveSection('profile')
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            activeSection === 'profile' ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User size={15} /> <span>User Profile</span>
        </button>

        <button
          onClick={() => {
            soundService.playClick()
            setActiveSection('appearance')
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            activeSection === 'appearance' ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Palette size={15} /> <span>Appearance</span>
        </button>

        <button
          onClick={() => {
            soundService.playClick()
            setActiveSection('wallpaper')
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            activeSection === 'wallpaper' ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Image size={15} /> <span>Wallpaper</span>
        </button>

        <button
          onClick={() => {
            soundService.playClick()
            setActiveSection('dock')
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            activeSection === 'dock' ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders size={15} /> <span>Dock & Desktop</span>
        </button>

        <button
          onClick={() => {
            soundService.playClick()
            setActiveSection('display')
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            activeSection === 'display' ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Monitor size={15} /> <span>Display & Night Light</span>
        </button>

        <button
          onClick={() => {
            soundService.playClick()
            setActiveSection('sound')
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            activeSection === 'sound' ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Volume2 size={15} /> <span>Sound Effects</span>
        </button>

        <button
          onClick={() => {
            soundService.playClick()
            setActiveSection('security')
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            activeSection === 'security' ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield size={15} /> <span>Security & Lock</span>
        </button>

        <button
          onClick={() => {
            soundService.playClick()
            setActiveSection('notifications')
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            activeSection === 'notifications' ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bell size={15} /> <span>Notifications</span>
        </button>

        <button
          onClick={() => {
            soundService.playClick()
            setActiveSection('storage')
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            activeSection === 'storage' ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <HardDrive size={15} /> <span>Storage</span>
        </button>

        <button
          onClick={() => {
            soundService.playClick()
            setActiveSection('about')
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
            activeSection === 'about' ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Info size={15} /> <span>About NOVA OS</span>
        </button>
      </div>

      {/* Main Settings Panel */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
        {/* User Profile Section */}
        {activeSection === 'profile' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-base font-bold text-white mb-1">User Profile</h3>
              <p className="text-neutral-400 text-xs">
                Manage your NOVA identity, lock screen profile card, and avatar customizations.
              </p>
            </div>

            {/* Profile Overview Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-neutral-900/40 border border-white/15 flex items-center gap-4 shadow-xl">
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 p-[2px] shadow-lg flex items-center justify-center overflow-hidden">
                  {settings.userAvatar && (settings.userAvatar.startsWith('data:image/') || settings.userAvatar.startsWith('http')) ? (
                    <img src={settings.userAvatar} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                  ) : settings.userAvatar === 'avatar-bot' ? (
                    <div className="w-full h-full bg-neutral-900 rounded-2xl flex items-center justify-center">
                      <Bot size={28} className="text-cyan-300" />
                    </div>
                  ) : settings.userAvatar === 'avatar-compass' ? (
                    <div className="w-full h-full bg-neutral-900 rounded-2xl flex items-center justify-center">
                      <Compass size={28} className="text-purple-300" />
                    </div>
                  ) : settings.userAvatar === 'avatar-sparkles' ? (
                    <div className="w-full h-full bg-neutral-900 rounded-2xl flex items-center justify-center">
                      <Sparkles size={28} className="text-amber-300" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-neutral-900 rounded-2xl flex items-center justify-center">
                      <User size={28} className="text-cyan-300" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate">
                    {settings.username || 'Commander Nova'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Administrator
                  </span>
                </div>
                <p className="text-neutral-300 text-xs mt-0.5 truncate">
                  {settings.userBio || 'Cosmic Navigator & System Architect'}
                </p>
                <p className="text-[11px] text-cyan-300/80 font-mono mt-1">
                  &ldquo;{settings.userGreeting || 'Welcome back to NOVA OS'}&rdquo;
                </p>
              </div>
            </div>

            {/* Profile Identity Form */}
            <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Display Name</label>
                <input
                  type="text"
                  value={settings.username || ''}
                  placeholder="e.g. Commander Nova"
                  onChange={(e) => updateSettings({ username: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Profile Bio / Description</label>
                <input
                  type="text"
                  value={settings.userBio || ''}
                  placeholder="e.g. Cosmic Navigator & System Architect"
                  onChange={(e) => updateSettings({ userBio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Lock Screen Greeting</label>
                <input
                  type="text"
                  value={settings.userGreeting || ''}
                  placeholder="e.g. Welcome back to NOVA OS"
                  onChange={(e) => updateSettings({ userGreeting: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Avatar Selection</h4>
                  <p className="text-[11px] text-neutral-400">Choose a cosmic avatar preset or upload your custom photo.</p>
                </div>
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer transition shadow-md shadow-blue-600/20">
                  <Upload size={13} />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleUploadCustomAvatar}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {avatarPresets.map((preset) => {
                  const Icon = preset.icon
                  const isSelected = settings.userAvatar === preset.id
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        soundService.playClick()
                        updateSettings({ userAvatar: preset.id })
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/50 scale-102'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${preset.bg} flex items-center justify-center shadow-md mb-2`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <span className="text-xs font-medium text-white">{preset.name}</span>
                      {isSelected && <span className="text-[9px] text-blue-300 font-mono mt-0.5">Active</span>}
                    </button>
                  )
                })}
              </div>

              {settings.userAvatar && (settings.userAvatar.startsWith('data:image/') || settings.userAvatar.startsWith('http')) && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 mt-2 text-xs">
                  <span className="text-blue-200">Custom user photo is active</span>
                  <button
                    onClick={() => {
                      soundService.playClick()
                      updateSettings({ userAvatar: 'avatar-nova' })
                    }}
                    className="text-red-400 hover:text-red-300 text-[11px] font-medium"
                  >
                    Reset to Preset
                  </button>
                </div>
              )}
            </div>

            {/* Profile Accent Color */}
            <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
              <label className="text-xs font-semibold text-neutral-300">Profile Accent Hue</label>
              <div className="flex items-center gap-3">
                {accentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      soundService.playClick()
                      updateSettings({ profileAccentColor: opt.id })
                    }}
                    style={{ backgroundColor: opt.color }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition shadow-md ${
                      settings.profileAccentColor === opt.id ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110' : 'hover:scale-105'
                    }`}
                    title={opt.name}
                  >
                    {settings.profileAccentColor === opt.id && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Appearance Section */}
        {activeSection === 'appearance' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Appearance</h3>
              <p className="text-neutral-400 text-xs">Customize the color scheme and visual tone of NOVA OS.</p>
            </div>

            {/* Light / Dark Mode selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300">Theme Mode</label>
              <div className="grid grid-cols-3 gap-3">
                {(['dark', 'light', 'auto'] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      soundService.playClick()
                      updateSettings({ theme: mode })
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition capitalize ${
                      settings.theme === mode
                        ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {mode === 'dark' && <Moon size={20} className="mb-1 text-purple-400" />}
                    {mode === 'light' && <Sun size={20} className="mb-1 text-amber-400" />}
                    {mode === 'auto' && <Sparkles size={20} className="mb-1 text-blue-400" />}
                    <span>{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300">Accent Color</label>
              <div className="flex items-center gap-3">
                {accentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      soundService.playClick()
                      updateSettings({ accentColor: opt.id })
                    }}
                    style={{ backgroundColor: opt.color }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition shadow-md ${
                      settings.accentColor === opt.id ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110' : 'hover:scale-105'
                    }`}
                    title={opt.name}
                  >
                    {settings.accentColor === opt.id && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Mouse Cursor Theme */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <MousePointer size={14} className="text-cyan-400" />
                  <span>Pointer Cursor Theme</span>
                </label>
                <span className="text-[11px] text-neutral-400 capitalize font-mono">
                  {settings.cursorStyle || 'default'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'default' as CursorStyle, label: 'System Default', desc: 'Standard Arrow' },
                  { id: 'glow-cyan' as CursorStyle, label: 'Neon Cyan', desc: 'Glow Effect' },
                  { id: 'amber-retro' as CursorStyle, label: 'Amber Retro', desc: 'Warm Classic' },
                  { id: 'cyberpunk' as CursorStyle, label: 'Cyberpunk', desc: 'High Tech Red' },
                  { id: 'precision' as CursorStyle, label: 'Precision', desc: 'Crosshair Dot' },
                ].map((c) => {
                  const isActive = (settings.cursorStyle || 'default') === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        soundService.playClick()
                        updateSettings({ cursorStyle: c.id })
                      }}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition ${
                        isActive
                          ? 'border-cyan-400 bg-cyan-500/10 text-white font-semibold shadow-sm'
                          : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs">{c.label}</span>
                      <span className="text-[10px] text-neutral-400">{c.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div>
                <div className="font-semibold text-white">Reduce Motion</div>
                <div className="text-[11px] text-neutral-400">Minimize animations and transition effects</div>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Wallpaper Section */}
        {activeSection === 'wallpaper' && (
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Desktop Wallpaper</h3>
                <p className="text-neutral-400 text-xs">Choose from built-in high dynamic range wallpapers or upload your own.</p>
              </div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer transition shadow-md shadow-blue-600/20">
                <Upload size={13} />
                <span>Upload Custom</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleUploadCustomWallpaper}
                  className="hidden"
                />
              </label>
            </div>

            {/* Live Desktop Preview */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-2xl p-3 flex flex-col justify-between select-none">
              <div
                className="absolute inset-0 -z-10"
                style={{
                  backgroundColor: '#090919',
                  backgroundImage: settings.customWallpaperUrl
                    ? `url(${settings.customWallpaperUrl})`
                    : (WALLPAPERS.find((w) => w.id === settings.wallpaperId) || WALLPAPERS[0]).style,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {/* Mini Menu Bar */}
              <div className="h-4 bg-black/40 backdrop-blur-md rounded-md flex items-center justify-between px-2 text-[9px] text-white/80">
                <span>NOVA OS</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {/* Mini Window Preview */}
              <div className="self-center w-48 h-20 bg-neutral-900/85 border border-white/20 rounded-lg shadow-lg flex flex-col overflow-hidden">
                <div className="h-3 bg-neutral-800 flex items-center px-1.5 gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[7px] text-neutral-400 ml-2">Preview</span>
                </div>
                <div className="p-2 text-[8px] text-neutral-400">Desktop Preview</div>
              </div>
              {/* Mini Dock */}
              <div className="self-center h-5 px-3 bg-black/50 backdrop-blur-lg border border-white/20 rounded-lg flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-3 h-3 rounded bg-white/20" />
                ))}
              </div>
            </div>

            {settings.customWallpaperUrl && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-blue-200">Custom user wallpaper is currently active</span>
                </div>
                <button
                  onClick={() => {
                    soundService.playClick()
                    updateSettings({ wallpaperId: 'nova-aurora', customWallpaperUrl: undefined })
                    addNotification('Wallpaper Reset', 'Reverted to built-in Nova Aurora theme.', 'settings')
                  }}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 font-medium text-[11px]"
                >
                  <Trash2 size={12} />
                  <span>Remove Custom</span>
                </button>
              </div>
            )}

            {/* Category Filter Tabs */}
            <div className="flex gap-1 p-1 bg-black/30 rounded-xl border border-white/10 w-fit text-xs">
              {(['all', 'dynamic', 'gradient'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    soundService.playClick()
                    setWallpaperFilter(tab)
                  }}
                  className={`px-3 py-1 rounded-lg capitalize transition font-medium ${
                    wallpaperFilter === tab
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Wallpapers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {WALLPAPERS.filter((wp) => wallpaperFilter === 'all' || wp.type === wallpaperFilter).map((wp) => {
                const isSelected = settings.wallpaperId === wp.id && !settings.customWallpaperUrl
                return (
                  <div
                    key={wp.id}
                    onClick={() => {
                      soundService.playClick()
                      updateSettings({ wallpaperId: wp.id, customWallpaperUrl: undefined })
                    }}
                    className={`group relative aspect-video rounded-xl overflow-hidden cursor-pointer border transition-all duration-200 shadow-md ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500 scale-[1.02]'
                        : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                    }`}
                    style={{ background: wp.thumbnail }}
                  >
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex items-center justify-between">
                      <span className="text-[11px] text-white font-medium drop-shadow-sm">{wp.name}</span>
                      {isSelected && <Check size={14} className="text-blue-400 font-bold" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Dock Section */}
        {activeSection === 'dock' && (
          <div className="space-y-5 max-w-md">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Dock & Desktop</h3>
              <p className="text-neutral-400 text-xs">Configure the dock magnification and desktop shortcuts.</p>
            </div>

            {/* Dock Size */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300">Dock Icon Size</label>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      soundService.playClick()
                      updateSettings({ dockSize: s })
                    }}
                    className={`p-2 rounded-xl border text-center capitalize transition ${
                      settings.dockSize === s
                        ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Magnification Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div>
                <div className="font-semibold text-white">Dock Magnification</div>
                <div className="text-[11px] text-neutral-400">Magnify icons on pointer hover</div>
              </div>
              <input
                type="checkbox"
                checked={settings.dockMagnification}
                onChange={(e) => updateSettings({ dockMagnification: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Desktop Icons Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div>
                <div className="font-semibold text-white">Show Desktop Icons</div>
                <div className="text-[11px] text-neutral-400">Display files and shortcuts on desktop</div>
              </div>
              <input
                type="checkbox"
                checked={settings.desktopIconsVisible}
                onChange={(e) => updateSettings({ desktopIconsVisible: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Display & Night Light Section */}
        {activeSection === 'display' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Display & Night Light</h3>
              <p className="text-neutral-400 text-xs">
                Adjust display brightness, blue light filter warmth, and rendering performance.
              </p>
            </div>

            {/* Display Brightness */}
            <div className="space-y-2 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Sun size={14} className="text-amber-400" /> Display Brightness
                </span>
                <span className="font-mono text-neutral-400">{settings.brightness}%</span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                value={settings.brightness}
                onChange={(e) => updateSettings({ brightness: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Night Light Toggle */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Eye size={14} className="text-amber-500" /> Night Light (Blue Light Filter)
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Shifts display colors toward the warmer end of the spectrum to reduce eye strain
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.nightLight}
                  onChange={(e) => updateSettings({ nightLight: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
              </div>

              {settings.nightLight && (
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-300">Color Temperature / Warmth</span>
                    <span className="font-mono text-amber-400">
                      {settings.nightLightTemperature || 45}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={settings.nightLightTemperature || 45}
                    onChange={(e) => updateSettings({ nightLightTemperature: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Performance Mode */}
            <div className="space-y-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Zap size={14} className="text-cyan-400" /> Rendering Performance Mode
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Configure graphics compositor fidelity and backdrop blur depth
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  {
                    id: 'high' as PerformanceMode,
                    label: 'High',
                    badge: 'Full Fidelity',
                    desc: 'Max glass blur & 60 FPS transitions',
                  },
                  {
                    id: 'balanced' as PerformanceMode,
                    label: 'Balanced',
                    badge: 'Optimal',
                    desc: 'Standard liquid glass & animations',
                  },
                  {
                    id: 'low' as PerformanceMode,
                    label: 'Efficiency',
                    badge: 'Low Power',
                    desc: 'Reduced glass blur & simple shadows',
                  },
                ].map((m) => {
                  const isActive = (settings.performanceMode || 'balanced') === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        soundService.playClick()
                        updateSettings({ performanceMode: m.id })
                      }}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition ${
                        isActive
                          ? 'border-blue-500 bg-blue-500/15 text-white font-semibold'
                          : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs font-bold text-white">{m.label}</span>
                      <span className="text-[10px] text-blue-300 font-mono mt-0.5">{m.badge}</span>
                      <span className="text-[9px] text-neutral-400 mt-1 leading-tight">{m.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Immersive Pointer Capture (Pointer Lock API) */}
            <div className="space-y-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <MousePointer size={14} className="text-cyan-400" />
                    <span>Hardware Pointer Lock API</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Direct mouse movement capture for full 360-degree rotation in 3D applications
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isPointerLockSupported
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {isPointerLockSupported ? 'API Supported' : 'Unavailable'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-neutral-300">
                  Status: <span className="text-white font-mono">{isPointerLocked ? 'Captured (HUD Active • Press ESC)' : 'Normal System Cursor'}</span>
                </div>
                <button
                  onClick={() => {
                    soundService.playClick()
                    requestPointerLock()
                  }}
                  disabled={!isPointerLockSupported}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/30 font-medium transition text-xs disabled:opacity-50"
                >
                  Test Mouse Capture
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security & Lock Screen Section */}
        {activeSection === 'security' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Security & Lock Screen</h3>
              <p className="text-neutral-400 text-xs">
                Manage cryptographic PIN authentication, lock screen wallpaper, and session inactivity rules.
              </p>
            </div>

            {/* Privacy Gate Warning Callout */}
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold text-blue-200 block mb-0.5">
                  Client-Side Privacy Barrier Notice
                </span>
                <span className="text-neutral-300 text-[11px]">
                  NOVA OS secures your session using Web Crypto PBKDF2 (HMAC-SHA-256 with 100,000 iterations and a 128-bit cryptographic salt). Passwords are never stored in plaintext. This provides an effective local privacy barrier in your browser, but does not provide physical machine disk encryption.
                </span>
              </div>
            </div>

            {/* Lock Screen Wallpaper Configuration */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Lock Screen Wallpaper</h4>
                  <p className="text-[11px] text-neutral-400">
                    Select a dedicated lock screen background distinct from your desktop.
                  </p>
                </div>
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer transition shadow-md shadow-blue-600/20">
                  <Upload size={13} />
                  <span>Upload Custom</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleUploadLockWallpaper}
                    className="hidden"
                  />
                </label>
              </div>

              {settings.customLockWallpaperUrl && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                  <span className="text-blue-200">Custom lock wallpaper is active</span>
                  <button
                    onClick={() => {
                      soundService.playClick()
                      updateSettings({
                        lockWallpaperId: settings.wallpaperId,
                        customLockWallpaperUrl: undefined,
                        lockWallpaperType: 'dynamic',
                      })
                      addNotification('Lock Wallpaper Reset', 'Reverted to system default wallpaper.', 'settings')
                    }}
                    className="text-red-400 hover:text-red-300 text-[11px] font-medium"
                  >
                    Remove Custom
                  </button>
                </div>
              )}

              {/* Category Filter Tabs */}
              <div className="flex gap-1 p-1 bg-black/30 rounded-xl border border-white/10 w-fit text-xs">
                {(['all', 'dynamic', 'gradient'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      soundService.playClick()
                      setLockWallpaperFilter(tab)
                    }}
                    className={`px-3 py-1 rounded-lg capitalize transition font-medium ${
                      lockWallpaperFilter === tab
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Wallpapers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {WALLPAPERS.filter((wp) => lockWallpaperFilter === 'all' || wp.type === lockWallpaperFilter).map((wp) => {
                  const isSelected =
                    (settings.lockWallpaperId || settings.wallpaperId) === wp.id &&
                    !settings.customLockWallpaperUrl
                  return (
                    <button
                      key={wp.id}
                      onClick={() => {
                        soundService.playClick()
                        updateSettings({
                          lockWallpaperId: wp.id,
                          customLockWallpaperUrl: undefined,
                          lockWallpaperType: wp.type as any,
                        })
                      }}
                      className={`relative aspect-video rounded-xl overflow-hidden border text-left transition ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500 scale-[1.02]'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ background: wp.thumbnail }}
                    >
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                        <span className="text-[10px] text-white font-medium truncate">{wp.name}</span>
                        {isSelected && <Check size={12} className="text-blue-400" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Inactivity Auto-Lock Timer */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Clock size={14} className="text-cyan-400" />
                    <span>Automatic Inactivity Lock</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Automatically lock the operating system when idle
                  </div>
                </div>
                <select
                  value={settings.autoLockTimeout ?? 5}
                  onChange={(e) => {
                    soundService.playClick()
                    updateSettings({ autoLockTimeout: Number(e.target.value) as AutoLockTimeout })
                  }}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {autoLockOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-neutral-800 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PIN Requirement Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Lock size={14} className="text-blue-400" />
                  <span>Require PIN to Unlock System</span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  When enabled, entering your cryptographic PIN is required to unlock NOVA OS
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.lockScreenEnabled}
                onChange={(e) => updateSettings({ lockScreenEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Cryptographic PIN Change Form */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Key size={14} className="text-amber-400" />
                  <span>Change Security PIN</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPinFields((p) => !p)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {showPinFields ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showPinFields ? 'Hide PIN' : 'Show PIN'}</span>
                </button>
              </div>

              <form onSubmit={handleUpdatePin} className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">New PIN (4–8 digits)</label>
                    <input
                      type={showPinFields ? 'text' : 'password'}
                      maxLength={8}
                      placeholder="••••"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-center tracking-widest text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Confirm New PIN</label>
                    <input
                      type={showPinFields ? 'text' : 'password'}
                      maxLength={8}
                      placeholder="••••"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-center tracking-widest text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {pinMessage && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      pinMessage.isError
                        ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                        : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    {pinMessage.isError ? <AlertCircle size={14} /> : <CheckCheck size={14} />}
                    <span>{pinMessage.text}</span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isHashing || !newPin || !confirmPin}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium text-xs transition shadow-md shadow-blue-600/20"
                  >
                    {isHashing ? 'Hashing (PBKDF2)...' : 'Update Security PIN'}
                  </button>
                </div>
              </form>
            </div>

            {/* Emergency Recovery Key */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-purple-400" />
                    <span>Emergency Recovery Key</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Use this key if you forget your PIN to unlock and reset the lock screen
                  </div>
                </div>
                <button
                  onClick={handleRegenerateRecoveryKey}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                  title="Generate New Recovery Key"
                >
                  <RefreshCw size={12} />
                  <span>Regenerate</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/15 font-mono text-cyan-300 text-xs tracking-wider select-all font-semibold text-center">
                  {settings.recoveryKey || 'NOVA-8492-7201-9482'}
                </div>
                <button
                  onClick={handleCopyRecoveryKey}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition"
                >
                  {copiedKey ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Lock Now Action Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  soundService.playClick()
                  lockSystem()
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/25"
              >
                <Lock size={14} />
                <span>Lock Screen Now</span>
              </button>
              <span className="text-[11px] text-neutral-400 font-mono">Shortcut: Ctrl + Alt + L</span>
            </div>
          </div>
        )}

        {/* Sound Section */}
        {activeSection === 'sound' && (
          <div className="space-y-5 max-w-md">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Sound Preferences</h3>
              <p className="text-neutral-400 text-xs">Control system sounds and audio synthesis volume.</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div>
                <div className="font-semibold text-white">System Sound Effects</div>
                <div className="text-[11px] text-neutral-400">Window clicks, startup chime, notifications</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between">
                <span className="font-semibold text-white">Output Volume</span>
                <span className="font-mono text-neutral-400">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSoundTest}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
            >
              Test Startup Chime
            </button>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="space-y-5 max-w-md">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Notification Center</h3>
              <p className="text-neutral-400 text-xs">Configure alerts and Do Not Disturb schedule.</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div>
                <div className="font-semibold text-white">Do Not Disturb</div>
                <div className="text-[11px] text-neutral-400">Silence banner notifications</div>
              </div>
              <input
                type="checkbox"
                checked={settings.doNotDisturb}
                onChange={(e) => updateSettings({ doNotDisturb: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Storage Section */}
        {activeSection === 'storage' && (
          <div className="space-y-5 max-w-lg">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Virtual Storage</h3>
              <p className="text-neutral-400 text-xs">IndexedDB persistent filesystem allocation breakdown.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-white font-semibold">NOVA Virtual SSD</span>
                <span className="text-neutral-400">{usedMB} MB used of 100 MB</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex">
                <div className="h-full bg-blue-500" style={{ width: `${Math.max(4, Math.min(100, Number(usedMB)))}%` }} />
              </div>

              <div className="flex gap-4 text-[11px] text-neutral-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Files ({nodes.length} items)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white/20" />
                  <span>Available Storage</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        {activeSection === 'about' && (
          <div className="space-y-6 max-w-lg">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-blue-500/20">
                N
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">NOVA OS</h3>
                <p className="text-xs text-neutral-400">Version 2.0 (Tahoe Edition)</p>
                <p className="text-[11px] text-neutral-500 mt-1">Browser-Based Web Operating System</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Virtual Processor</span>
                <span className="text-white font-medium">Nova Neural Octa-Core (V8 Engine)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Memory</span>
                <span className="text-white font-medium">16 GB Unified Virtual RAM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Graphics</span>
                <span className="text-white font-medium">WebGL 2.0 Hardware Accelerated</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Persistence</span>
                <span className="text-white font-medium">IndexedDB Local Storage</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition font-medium"
              >
                <RotateCcw size={14} /> Reset NOVA OS Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-800 border border-white/10 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-sm">Reset All OS Data?</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              This will restore all settings, notes, calendar events, and virtual files to their initial defaults. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-neutral-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleFullReset}
                className="px-4 py-1.5 rounded-lg text-xs bg-red-600 hover:bg-red-500 text-white font-medium shadow-md"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
