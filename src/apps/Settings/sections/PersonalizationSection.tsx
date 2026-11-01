import React from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { WALLPAPERS } from '@/core/settings/wallpapers'
import { BUILTIN_THEMES } from '@/core/theme/themes'
import type { AccentColor } from '@/types'
import {
  User,
  Bot,
  Compass,
  Sparkles,
  Upload,
  Check,
  ChevronRight,
  Palette,
  Image as ImageIcon,
  Sliders,
  Droplets,
} from 'lucide-react'

interface PersonalizationSectionProps {
  onNavigateSection?: (sectionId: string) => void
}

export const PersonalizationSection: React.FC<PersonalizationSectionProps> = ({ onNavigateSection }) => {
  const { settings, updateSettings } = useSettings()
  const { addNotification } = useNotifications()

  const accentOptions: { id: AccentColor; name: string; color: string }[] = [
    { id: 'blue', name: 'Cosmic Blue', color: '#3b82f6' },
    { id: 'purple', name: 'Midnight Purple', color: '#8b5cf6' },
    { id: 'emerald', name: 'Emerald Wave', color: '#10b981' },
    { id: 'orange', name: 'Radiant Orange', color: '#f97316' },
    { id: 'rose', name: 'Cyber Rose', color: '#f43f5e' },
    { id: 'amber', name: 'Solar Amber', color: '#f59e0b' },
  ]

  const avatarPresets = [
    { id: 'avatar-nova', name: 'Astronaut', icon: User, color: 'text-cyan-400', bg: 'from-blue-600 to-cyan-500' },
    { id: 'avatar-bot', name: 'Android', icon: Bot, color: 'text-emerald-400', bg: 'from-emerald-600 to-teal-500' },
    { id: 'avatar-compass', name: 'Navigator', icon: Compass, color: 'text-purple-400', bg: 'from-purple-600 to-indigo-500' },
    { id: 'avatar-sparkles', name: 'Nebula', icon: Sparkles, color: 'text-amber-400', bg: 'from-amber-600 to-rose-500' },
  ]

  const handleUploadCustomAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addNotification('Invalid Format', 'Please upload a PNG, JPG, WebP, or SVG image.', 'settings')
      return
    }
    if (file.size > 2.5 * 1024 * 1024) {
      addNotification('File Exceeds Limit', 'Avatar image should be under 2.5MB.', 'settings')
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

  const activeTheme =
    settings.customThemes.find((t) => t.id === settings.activeThemeId) ||
    BUILTIN_THEMES.find((t) => t.id === settings.activeThemeId) ||
    BUILTIN_THEMES[0]

  const activeWallpaper =
    WALLPAPERS.find((w) => w.id === settings.wallpaperId) || WALLPAPERS[0]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Personalization Center</h3>
        <p className="text-neutral-400 text-xs">
          Customize your NOVA OS identity, active themes, wallpapers, glass translucency, and desktop feel.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-neutral-900/40 border border-white/15 flex items-center gap-4 shadow-xl backdrop-blur-md">
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

      {/* Quick Visual Overview: Theme & Wallpaper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Active Theme Card */}
        <div
          onClick={() => onNavigateSection?.('themes')}
          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-blue-400" />
              <span className="font-semibold text-white text-xs">Active Theme</span>
            </div>
            <ChevronRight size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">{activeTheme.name}</div>
              <div className="text-[10px] text-neutral-400 line-clamp-1">{activeTheme.description}</div>
            </div>
            <div className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full border border-black/40" style={{ backgroundColor: activeTheme.windowBackground }} />
              <span className="w-4 h-4 rounded-full border border-black/40" style={{ backgroundColor: activeTheme.selectionColor }} />
            </div>
          </div>
        </div>

        {/* Active Wallpaper Card */}
        <div
          onClick={() => onNavigateSection?.('wallpaper')}
          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-purple-400" />
              <span className="font-semibold text-white text-xs">Desktop Wallpaper</span>
            </div>
            <ChevronRight size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">
                {settings.customWallpaperUrl ? 'Custom Image' : activeWallpaper.name}
              </div>
              <div className="text-[10px] text-neutral-400 capitalize">
                {settings.customWallpaperUrl ? 'User Upload' : activeWallpaper.type} &bull; {settings.wallpaperSettings.position}
              </div>
            </div>
            <div
              className="w-10 h-6 rounded-md border border-white/20"
              style={{
                backgroundColor: activeWallpaper.fallbackColor || '#090919',
                backgroundImage: settings.customWallpaperUrl ? `url(${settings.customWallpaperUrl})` : activeWallpaper.style,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => onNavigateSection?.('liquidglass')}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center gap-2"
        >
          <Droplets size={14} className="text-cyan-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-white truncate">Liquid Glass</div>
            <div className="text-[9px] text-neutral-400 truncate">{settings.liquidGlass.preset} preset</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateSection?.('dock')}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center gap-2"
        >
          <Sliders size={14} className="text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-white truncate">Dock & Bar</div>
            <div className="text-[9px] text-neutral-400 truncate">{settings.dockSettings.position} &bull; {settings.dockSettings.appearance}</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateSection?.('appearance')}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center gap-2"
        >
          <Palette size={14} className="text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-white truncate">Appearance</div>
            <div className="text-[9px] text-neutral-400 truncate">{settings.theme} mode</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateSection?.('mouse')}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center gap-2"
        >
          <Compass size={14} className="text-purple-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-white truncate">Mouse Pointer</div>
            <div className="text-[9px] text-neutral-400 truncate">{settings.cursorSettings.size}px &bull; {settings.cursorSettings.preset}</div>
          </div>
        </button>
      </div>

      {/* Profile Identity Form */}
      <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="font-semibold text-white text-xs">Identity & Greetings</h4>
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-neutral-300">Display Name</label>
          <input
            type="text"
            value={settings.username || ''}
            placeholder="e.g. Commander Nova"
            onChange={(e) => updateSettings({ username: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-neutral-300">Profile Bio / Description</label>
          <input
            type="text"
            value={settings.userBio || ''}
            placeholder="e.g. Cosmic Navigator & System Architect"
            onChange={(e) => updateSettings({ userBio: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-neutral-300">Lock Screen Greeting</label>
          <input
            type="text"
            value={settings.userGreeting || ''}
            placeholder="e.g. Welcome back to NOVA OS"
            onChange={(e) => updateSettings({ userGreeting: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Avatar Selection */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white text-xs">Avatar Preset or Custom</h4>
            <p className="text-[11px] text-neutral-400">Select an astronaut icon or upload your personal avatar image.</p>
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
  )
}
