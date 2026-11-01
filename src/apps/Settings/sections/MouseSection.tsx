import React from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import type { CursorPreset, CursorSize } from '@/types'
import {
  MousePointer,
  Sparkles,
  Check,
  Upload,
  Layers,
  Activity,
  Sliders,
  Move,
  Type,
  Ban,
  HelpCircle,
} from 'lucide-react'

export const MouseSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()
  const { addNotification } = useNotifications()

  const cursorPresets: { id: CursorPreset; name: string; desc: string }[] = [
    { id: 'nova-default', name: 'NOVA Default', desc: 'Cosmic holographic pointer with cyan accent' },
    { id: 'windows-modern', name: 'Windows Modern', desc: 'Sleek black & white dual-tone outline' },
    { id: 'windows-classic', name: 'Windows Classic', desc: 'Timeless crisp 90s monochrome arrow' },
    { id: 'macos-inspired', name: 'macOS-inspired', desc: 'Refined smooth black cursor with drop shadow' },
    { id: 'ubuntu-inspired', name: 'Ubuntu-inspired', desc: 'Warm aubergine & orange Linux arrow' },
    { id: 'retro-pixel', name: 'Retro Pixel', desc: '8-bit pixelated arcade cursor' },
    { id: 'gaming-neon', name: 'Gaming Neon', desc: 'Hyper-vibrant RGB glow cursor' },
    { id: 'minimal-white', name: 'Minimal White', desc: 'Clean pure white geometric needle' },
    { id: 'minimal-black', name: 'Minimal Black', desc: 'Stealth matte obsidian arrow' },
    { id: 'custom', name: 'Custom User SVG', desc: 'User-uploaded custom vector or bitmap image' },
  ]

  const cursorSizes: CursorSize[] = [16, 24, 32, 40, 48, 64]

  const handleUploadCustomCursor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addNotification('Invalid Format', 'Please upload a PNG or SVG cursor image.', 'settings')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      updateSettings({
        cursorSettings: {
          ...settings.cursorSettings,
          preset: 'custom',
          customUrl: dataUrl,
        },
      })
      soundService.playClick()
      addNotification('Custom Cursor Loaded', `Loaded custom pointer from "${file.name}"`, 'settings')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1">Mouse & Cursor Engine</h3>
          <p className="text-neutral-400 text-xs">
            Personalize cursor styles, size, luminescence, click ripple effects, and hardware pointer settings.
          </p>
        </div>
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer transition">
          <Upload size={13} />
          <span>Upload SVG/PNG</span>
          <input
            type="file"
            accept="image/svg+xml,image/png"
            onChange={handleUploadCustomCursor}
            className="hidden"
          />
        </label>
      </div>

      {/* Preset Selector */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
          <MousePointer size={14} className="text-cyan-400" />
          <span>Cursor Presets ({cursorPresets.length})</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {cursorPresets.map((preset) => {
            const isSelected = settings.cursorSettings.preset === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => {
                  soundService.playClick()
                  updateSettings({
                    cursorSettings: {
                      ...settings.cursorSettings,
                      preset: preset.id,
                    },
                  })
                }}
                className={`p-3 rounded-2xl border text-left transition flex items-start justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-500/40 text-white font-semibold'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">{preset.name}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">{preset.desc}</div>
                </div>
                {isSelected && <Check size={14} className="text-cyan-400 shrink-0 mt-0.5" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-neutral-300">Pointer Size Scale</label>
          <span className="font-mono text-cyan-300 text-xs px-2 py-0.5 rounded-md bg-white/10">
            {settings.cursorSettings.size}px
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2 pt-1">
          {cursorSizes.map((size) => (
            <button
              key={size}
              onClick={() => {
                soundService.playClick()
                updateSettings({
                  cursorSettings: {
                    ...settings.cursorSettings,
                    size,
                  },
                })
              }}
              className={`py-2 rounded-xl border text-center font-mono text-xs transition ${
                settings.cursorSettings.size === size
                  ? 'border-cyan-400 bg-cyan-500/20 text-white font-bold'
                  : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              {size}px
            </button>
          ))}
        </div>
      </div>

      {/* Color Customization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
          <label className="text-xs font-semibold text-neutral-300">Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.cursorSettings.color}
              onChange={(e) =>
                updateSettings({
                  cursorSettings: {
                    ...settings.cursorSettings,
                    color: e.target.value,
                  },
                })
              }
              className="w-10 h-8 rounded-lg bg-transparent border border-white/20 cursor-pointer"
            />
            <span className="font-mono text-xs text-neutral-300 uppercase">
              {settings.cursorSettings.color}
            </span>
          </div>
        </div>

        <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
          <label className="text-xs font-semibold text-neutral-300">Outline Contour Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.cursorSettings.outlineColor}
              onChange={(e) =>
                updateSettings({
                  cursorSettings: {
                    ...settings.cursorSettings,
                    outlineColor: e.target.value,
                  },
                })
              }
              className="w-10 h-8 rounded-lg bg-transparent border border-white/20 cursor-pointer"
            />
            <span className="font-mono text-xs text-neutral-300 uppercase">
              {settings.cursorSettings.outlineColor}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Effects Toggles */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="text-xs font-semibold text-white">Visual Feedback & Luminescence</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <span className="text-xs text-neutral-300">Drop Shadow</span>
            <input
              type="checkbox"
              checked={settings.cursorSettings.shadow}
              onChange={(e) =>
                updateSettings({
                  cursorSettings: {
                    ...settings.cursorSettings,
                    shadow: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <span className="text-xs text-neutral-300">Neon Glow Filter</span>
            <input
              type="checkbox"
              checked={settings.cursorSettings.glow}
              onChange={(e) =>
                updateSettings({
                  cursorSettings: {
                    ...settings.cursorSettings,
                    glow: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <span className="text-xs text-neutral-300">Mouse Trails</span>
            <input
              type="checkbox"
              checked={settings.cursorSettings.trail}
              onChange={(e) =>
                updateSettings({
                  cursorSettings: {
                    ...settings.cursorSettings,
                    trail: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <span className="text-xs text-neutral-300">Click Ripple Pulse</span>
            <input
              type="checkbox"
              checked={settings.cursorSettings.clickEffect}
              onChange={(e) =>
                updateSettings({
                  cursorSettings: {
                    ...settings.cursorSettings,
                    clickEffect: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
          </label>
        </div>
      </div>

      {/* Interactive Cursor Test Playground */}
      <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-tr from-cyan-950/20 via-neutral-900/40 to-blue-950/20 border border-cyan-500/20">
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Interactive Cursor Playground</span>
          </h4>
          <p className="text-[11px] text-neutral-400">
            Hover over different elements below to verify all cursor transformations in real time.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <button
            onClick={() => soundService.playClick()}
            className="p-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 text-white text-xs text-center cursor-pointer transition"
          >
            Hover Me (Pointer)
          </button>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-neutral-300 text-xs text-center cursor-text flex items-center justify-center gap-1.5">
            <Type size={13} />
            <span>Text Area</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-neutral-300 text-xs text-center cursor-move flex items-center justify-center gap-1.5">
            <Move size={13} />
            <span>Move Grip</span>
          </div>

          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center cursor-not-allowed flex items-center justify-center gap-1.5">
            <Ban size={13} />
            <span>Not Allowed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
