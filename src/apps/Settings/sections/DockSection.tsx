import React from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import type { DockPosition, DockAppearance } from '@/types'
import {
  Sliders,
  Check,
  Sparkles,
  Layers,
  Eye,
  Maximize,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'

export const DockSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()

  const positionOptions: { id: DockPosition; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'bottom', label: 'Bottom (Default)', icon: ArrowDown },
    { id: 'left', label: 'Left Side', icon: ArrowLeft },
    { id: 'right', label: 'Right Side', icon: ArrowRight },
  ]

  const appearanceOptions: { id: DockAppearance; label: string; desc: string }[] = [
    { id: 'floating', label: 'Floating Glass', desc: 'macOS-style elevated rounded bar with blur' },
    { id: 'liquid-glass', label: 'Liquid Glass', desc: 'Hyper-vibrant high-refraction fluid bar' },
    { id: 'frosted', label: 'Frosted Glass', desc: 'Matte dispersion blur with light inner border' },
    { id: 'transparent', label: 'Transparent', desc: 'Zero background; pure free-floating app icons' },
    { id: 'solid', label: 'Solid Obsidian', desc: 'Opaque deep space finish with sharp border' },
    { id: 'minimal', label: 'Ultra Minimal', desc: 'Subtle hairline indicator and compact footprint' },
  ]

  const sizeOptions: { id: 'small' | 'medium' | 'large'; label: string; px: number }[] = [
    { id: 'small', label: 'Small', px: 40 },
    { id: 'medium', label: 'Medium', px: 52 },
    { id: 'large', label: 'Large', px: 64 },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Dock & Navigation</h3>
        <p className="text-neutral-400 text-xs">
          Control Dock placement, optical glass styling, icon dimensions, magnification curve, and behavior.
        </p>
      </div>

      {/* Dock Position Selection */}
      <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
        <label className="text-xs font-semibold text-neutral-300">Dock Screen Alignment</label>
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {positionOptions.map((pos) => {
            const Icon = pos.icon
            const isSelected = settings.dockSettings.position === pos.id
            return (
              <button
                key={pos.id}
                onClick={() => {
                  soundService.playClick()
                  updateSettings({
                    dockSettings: {
                      ...settings.dockSettings,
                      position: pos.id,
                    },
                  })
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/20 text-white font-semibold'
                    : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={18} className="mb-1" />
                <span className="text-xs">{pos.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Dock Appearance Style */}
      <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
        <label className="text-xs font-semibold text-neutral-300">Dock Visual Appearance</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {appearanceOptions.map((app) => {
            const isSelected = settings.dockSettings.appearance === app.id
            return (
              <button
                key={app.id}
                onClick={() => {
                  soundService.playClick()
                  updateSettings({
                    dockSettings: {
                      ...settings.dockSettings,
                      appearance: app.id,
                    },
                  })
                }}
                className={`p-3 rounded-2xl border text-left transition flex items-start justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/40 text-white font-semibold'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">{app.label}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{app.desc}</div>
                </div>
                {isSelected && <Check size={14} className="text-blue-400 shrink-0 mt-0.5" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Dock Size & Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
          <label className="text-xs font-semibold text-neutral-300">Base Icon Size</label>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {sizeOptions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  soundService.playClick()
                  updateSettings({
                    dockSize: s.id,
                    dockSettings: {
                      ...settings.dockSettings,
                      iconSize: s.px,
                    },
                  })
                }}
                className={`py-2 rounded-xl border text-center text-xs font-medium transition ${
                  settings.dockSize === s.id
                    ? 'border-blue-500 bg-blue-500/20 text-white font-bold'
                    : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                <div>{s.label}</div>
                <div className="text-[10px] text-neutral-400 font-mono">{s.px}px</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-neutral-300">Dock Icon Spacing</label>
            <span className="font-mono text-cyan-300 text-xs px-2 py-0.5 rounded-md bg-white/10">
              {settings.dockSettings.iconSpacing}px
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={24}
            step={2}
            value={settings.dockSettings.iconSpacing}
            onChange={(e) =>
              updateSettings({
                dockSettings: {
                  ...settings.dockSettings,
                  iconSpacing: Number(e.target.value),
                },
              })
            }
            className="w-full accent-blue-500 cursor-pointer pt-2"
          />
          <div className="flex justify-between text-[10px] text-neutral-500">
            <span>4px (Dense)</span>
            <span>10px (Default)</span>
            <span>24px (Wide)</span>
          </div>
        </div>
      </div>

      {/* Magnification Controls */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-white text-xs">Dock Icon Magnification</div>
            <div className="text-[11px] text-neutral-400">Magnify icons smoothly when hovering over the dock</div>
          </div>
          <input
            type="checkbox"
            checked={settings.dockMagnification}
            onChange={(e) =>
              updateSettings({
                dockMagnification: e.target.checked,
                dockSettings: {
                  ...settings.dockSettings,
                  magnification: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
          />
        </div>

        {settings.dockMagnification && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300">Magnification Scale</span>
              <span className="font-mono text-cyan-300">{settings.dockSettings.magnificationScale}x</span>
            </div>
            <input
              type="range"
              min={1.1}
              max={1.8}
              step={0.05}
              value={settings.dockSettings.magnificationScale}
              onChange={(e) =>
                updateSettings({
                  dockSettings: {
                    ...settings.dockSettings,
                    magnificationScale: Number(e.target.value),
                  },
                })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Dock Behavior Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div>
            <div className="font-semibold text-white text-xs">Automatically Hide Dock</div>
            <div className="text-[11px] text-neutral-400">Reveals when pointer nears screen edge</div>
          </div>
          <input
            type="checkbox"
            checked={settings.dockAutoHide}
            onChange={(e) =>
              updateSettings({
                dockAutoHide: e.target.checked,
                dockSettings: {
                  ...settings.dockSettings,
                  autoHide: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div>
            <div className="font-semibold text-white text-xs">Show App Name Tooltips</div>
            <div className="text-[11px] text-neutral-400">Display labels on hovered dock icons</div>
          </div>
          <input
            type="checkbox"
            checked={settings.dockSettings.showLabels}
            onChange={(e) =>
              updateSettings({
                dockSettings: {
                  ...settings.dockSettings,
                  showLabels: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div>
            <div className="font-semibold text-white text-xs">Running App Indicators</div>
            <div className="text-[11px] text-neutral-400">Luminous dots below active apps</div>
          </div>
          <input
            type="checkbox"
            checked={settings.dockSettings.showRunningIndicators}
            onChange={(e) =>
              updateSettings({
                dockSettings: {
                  ...settings.dockSettings,
                  showRunningIndicators: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
