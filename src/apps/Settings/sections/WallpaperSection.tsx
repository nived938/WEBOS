import React, { useState } from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { WALLPAPERS } from '@/core/settings/wallpapers'
import type { WallpaperPosition } from '@/types'
import {
  Upload,
  Trash2,
  Check,
  Star,
  Play,
  Maximize2,
  Minimize2,
  Grid,
  Square,
  Sparkles,
} from 'lucide-react'

export const WallpaperSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()
  const { addNotification } = useNotifications()

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'dynamic' | 'gradient'>('all')

  const handleUploadCustomWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addNotification('Invalid Format', 'Please upload a PNG, JPG, WebP, or SVG image.', 'settings')
      return
    }
    if (file.size > 2.5 * 1024 * 1024) {
      addNotification('File Exceeds Limit', 'Image should be under 2.5MB for fast loading.', 'settings')
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

  const handleToggleFavorite = (wallpaperId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    soundService.playClick()
    const currentFavs = settings.wallpaperSettings.favorites || []
    const nextFavs = currentFavs.includes(wallpaperId)
      ? currentFavs.filter((id) => id !== wallpaperId)
      : [...currentFavs, wallpaperId]

    updateSettings({
      wallpaperSettings: {
        ...settings.wallpaperSettings,
        favorites: nextFavs,
      },
    })
  }

  const activeWallpaper =
    WALLPAPERS.find((w) => w.id === settings.wallpaperId) || WALLPAPERS[0]

  const filteredWallpapers = WALLPAPERS.filter((w) => {
    if (categoryFilter === 'all') return true
    return w.type === categoryFilter
  })

  const positionOptions: { id: WallpaperPosition; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'fill', label: 'Fill Screen', icon: Maximize2 },
    { id: 'fit', label: 'Fit Viewport', icon: Minimize2 },
    { id: 'stretch', label: 'Stretch', icon: Square },
    { id: 'center', label: 'Center', icon: Square },
    { id: 'tile', label: 'Tile Pattern', icon: Grid },
  ]

  const slideshowIntervals = [
    { value: 60000, label: '1 minute' },
    { value: 300000, label: '5 minutes' },
    { value: 900000, label: '15 minutes' },
    { value: 1800000, label: '30 minutes' },
    { value: 3600000, label: '1 hour' },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1">Wallpaper Studio</h3>
          <p className="text-neutral-400 text-xs">
            Choose high-res dynamic wallpapers, configure slideshow intervals, or upload custom backdrops.
          </p>
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

      {/* Live Desktop Mini Preview */}
      <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-2xl p-3 flex flex-col justify-between select-none">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundColor: activeWallpaper.fallbackColor || '#090919',
            backgroundImage: settings.customWallpaperUrl
              ? `url(${settings.customWallpaperUrl})`
              : activeWallpaper.style,
            backgroundSize: settings.wallpaperSettings.position === 'tile' ? '200px' : settings.wallpaperSettings.position === 'center' ? 'contain' : settings.wallpaperSettings.position === 'fit' ? 'contain' : 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: settings.wallpaperSettings.position === 'tile' ? 'repeat' : 'no-repeat',
          }}
        />
        {/* Mini Menu Bar */}
        <div className="h-4 bg-black/40 backdrop-blur-md rounded-md flex items-center justify-between px-2 text-[9px] text-white/80">
          <span className="font-semibold">NOVA OS</span>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {/* Mini Window Preview */}
        <div className="self-center w-52 h-20 bg-neutral-900/85 border border-white/20 rounded-lg shadow-lg flex flex-col overflow-hidden backdrop-blur-md">
          <div className="h-3.5 bg-neutral-800 flex items-center px-2 gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[8px] text-neutral-400 ml-2">Wallpaper Preview</span>
          </div>
          <div className="p-2 text-[9px] text-neutral-300">
            {settings.customWallpaperUrl ? 'Custom Image Backdrop' : activeWallpaper.name}
          </div>
        </div>
        {/* Mini Dock */}
        <div className="self-center h-5 px-3 bg-black/50 backdrop-blur-lg border border-white/20 rounded-lg flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-3 h-3 rounded bg-white/25" />
          ))}
        </div>
      </div>

      {/* Active Custom Wallpaper Notice */}
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

      {/* Positioning Controls */}
      <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
        <label className="text-xs font-semibold text-neutral-300">Wallpaper Display Layout</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {positionOptions.map((pos) => {
            const Icon = pos.icon
            const isActive = settings.wallpaperSettings.position === pos.id
            return (
              <button
                key={pos.id}
                onClick={() => {
                  soundService.playClick()
                  updateSettings({
                    wallpaperSettings: {
                      ...settings.wallpaperSettings,
                      position: pos.id,
                    },
                  })
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                  isActive
                    ? 'border-blue-500 bg-blue-500/20 text-white font-semibold'
                    : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} className="mb-1" />
                <span className="text-[11px]">{pos.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Slideshow Settings */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play size={16} className="text-cyan-400" />
            <div>
              <div className="font-semibold text-white text-xs">Dynamic Wallpaper Slideshow</div>
              <div className="text-[11px] text-neutral-400">Automatically rotate through wallpapers</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.wallpaperSettings.slideshow}
            onChange={(e) =>
              updateSettings({
                wallpaperSettings: {
                  ...settings.wallpaperSettings,
                  slideshow: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
          />
        </div>

        {settings.wallpaperSettings.slideshow && (
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <label className="text-[11px] text-neutral-300">Rotation Interval</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {slideshowIntervals.map((intv) => (
                <button
                  key={intv.value}
                  onClick={() => {
                    soundService.playClick()
                    updateSettings({
                      wallpaperSettings: {
                        ...settings.wallpaperSettings,
                        slideshowInterval: intv.value,
                      },
                    })
                  }}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-medium border transition ${
                    settings.wallpaperSettings.slideshowInterval === intv.value
                      ? 'border-cyan-400 bg-cyan-500/20 text-white font-bold'
                      : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  {intv.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Wallpaper Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-neutral-300">
            Built-in Wallpapers ({filteredWallpapers.length})
          </h4>
          <div className="flex gap-1 p-0.5 bg-black/40 rounded-xl border border-white/10 text-xs">
            {(['all', 'dynamic', 'gradient'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  soundService.playClick()
                  setCategoryFilter(tab)
                }}
                className={`px-2.5 py-1 rounded-lg capitalize transition text-[11px] ${
                  categoryFilter === tab ? 'bg-white/15 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredWallpapers.map((w) => {
            const isSelected = settings.wallpaperId === w.id && !settings.customWallpaperUrl
            const isFavorite = settings.wallpaperSettings.favorites?.includes(w.id)
            return (
              <div
                key={w.id}
                onClick={() => {
                  soundService.playClick()
                  updateSettings({
                    wallpaperId: w.id,
                    customWallpaperUrl: undefined,
                  })
                }}
                className={`group relative rounded-xl overflow-hidden border cursor-pointer aspect-video transition-all shadow-md ${
                  isSelected
                    ? 'border-blue-400 ring-2 ring-blue-500/50 scale-[1.02]'
                    : 'border-white/15 hover:border-white/40'
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition" />

                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button
                    onClick={(e) => handleToggleFavorite(w.id, e)}
                    className={`p-1 rounded-full backdrop-blur-md transition ${
                      isFavorite ? 'text-amber-400 bg-black/50' : 'text-white/40 hover:text-white bg-black/30'
                    }`}
                  >
                    <Star size={12} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
                      <Check size={11} />
                    </div>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <div>
                    <span className="text-white font-semibold text-[11px] block truncate">{w.name}</span>
                    <span className="text-neutral-400 text-[9px] capitalize">{w.type}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
