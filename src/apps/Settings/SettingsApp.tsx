import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { useSettings } from '@/core/settings/SettingsContext'
import { WALLPAPERS } from '@/core/settings/wallpapers'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import type { AccentColor, ThemeMode } from '@/types'
import {
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
  Monitor,
  Laptop,
} from 'lucide-react'

export const SettingsApp: React.FC<AppInstanceProps> = () => {
  const { settings, updateSettings, resetSettings } = useSettings()
  const { nodes, resetToDefault } = useFileSystem()
  const { addNotification } = useNotifications()

  const [activeSection, setActiveSection] = useState<
    'appearance' | 'wallpaper' | 'dock' | 'sound' | 'notifications' | 'storage' | 'about'
  >('appearance')

  const [showResetModal, setShowResetModal] = useState(false)

  const accentOptions: { id: AccentColor; name: string; color: string }[] = [
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'purple', name: 'Purple', color: '#8b5cf6' },
    { id: 'emerald', name: 'Emerald', color: '#10b981' },
    { id: 'orange', name: 'Orange', color: '#f97316' },
    { id: 'rose', name: 'Rose', color: '#f43f5e' },
    { id: 'amber', name: 'Amber', color: '#f59e0b' },
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
            <div>
              <h3 className="text-base font-bold text-white mb-1">Desktop Wallpaper</h3>
              <p className="text-neutral-400 text-xs">Choose from built-in high dynamic range wallpapers.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {WALLPAPERS.map((wp) => (
                <div
                  key={wp.id}
                  onClick={() => {
                    soundService.playClick()
                    updateSettings({ wallpaperId: wp.id, customWallpaperUrl: undefined })
                  }}
                  className={`group relative aspect-video rounded-xl overflow-hidden cursor-pointer border transition shadow-md ${
                    settings.wallpaperId === wp.id
                      ? 'border-blue-500 ring-2 ring-blue-500'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                  style={{ background: wp.thumbnail }}
                >
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                    <span className="text-[11px] text-white font-medium">{wp.name}</span>
                    {settings.wallpaperId === wp.id && <Check size={14} className="text-blue-400 font-bold" />}
                  </div>
                </div>
              ))}
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
