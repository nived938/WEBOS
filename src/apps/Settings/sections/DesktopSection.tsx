import React from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import type { DesktopIconSize, DesktopWidgetType } from '@/types'
import {
  LayoutGrid,
  Check,
  Clock,
  Cpu,
  CloudSun,
  StickyNote,
  ListTodo,
  Music,
  Battery,
  Layers,
  Compass,
} from 'lucide-react'

export const DesktopSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()

  const iconSizes: { id: DesktopIconSize; label: string; desc: string }[] = [
    { id: 'small', label: 'Small', desc: '48px compact grid' },
    { id: 'medium', label: 'Medium', desc: '64px standard desktop' },
    { id: 'large', label: 'Large', desc: '80px high visibility' },
  ]

  const widgetDefinitions: { type: DesktopWidgetType; title: string; desc: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { type: 'clock', title: 'Cosmic Clock', desc: 'Minimalist glass time and orbital date display', icon: Clock },
    { type: 'system', title: 'Neural Engine Monitor', desc: 'Simulated real-time CPU & memory telemetry', icon: Cpu },
    { type: 'weather', title: 'Orbital Weather', desc: 'Atmospheric sensor condition report', icon: CloudSun },
    { type: 'shortcuts', title: 'Quick Launch Shortcuts', desc: 'Direct desktop launcher tile for favorite apps', icon: Compass },
    { type: 'notes', title: 'Sticky Memo Pad', desc: 'Instant desktop scratchpad with autosave', icon: StickyNote },
    { type: 'tasks', title: 'Daily Objectives', desc: 'Checkable mini productivity task list', icon: ListTodo },
    { type: 'music', title: 'Cosmic Sound Player', desc: 'Audio synthesizer playback controls widget', icon: Music },
    { type: 'battery', title: 'Power Cell Status', desc: 'Simulated battery charge and drain meter', icon: Battery },
  ]

  const toggleWidget = (type: DesktopWidgetType) => {
    soundService.playClick()
    const existing = settings.desktopWidgets.find((w) => w.type === type)
    let nextWidgets = [...settings.desktopWidgets]

    if (existing) {
      nextWidgets = nextWidgets.map((w) => (w.type === type ? { ...w, enabled: !w.enabled } : w))
    } else {
      nextWidgets.push({
        id: `widget-${type}-${Date.now()}`,
        type,
        title: widgetDefinitions.find((def) => def.type === type)?.title || type,
        enabled: true,
        x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 320) : 800,
        y: 100 + nextWidgets.length * 120,
      })
    }

    updateSettings({
      desktopWidgets: nextWidgets,
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Desktop & Icons</h3>
        <p className="text-neutral-400 text-xs">
          Configure desktop icon dimensions, spacing, label layout, selection accents, and interactive desktop widgets.
        </p>
      </div>

      {/* Show Icons & Auto Arrange */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div>
            <div className="font-semibold text-white text-xs">Show Desktop Icons</div>
            <div className="text-[11px] text-neutral-400">Toggle icon visibility on desktop</div>
          </div>
          <input
            type="checkbox"
            checked={settings.desktopIconsVisible}
            onChange={(e) =>
              updateSettings({
                desktopIconsVisible: e.target.checked,
                desktopSettings: {
                  ...settings.desktopSettings,
                  showIcons: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div>
            <div className="font-semibold text-white text-xs">Snap to Grid</div>
            <div className="text-[11px] text-neutral-400">Align icons automatically to grid cells</div>
          </div>
          <input
            type="checkbox"
            checked={settings.desktopSettings.gridSnap}
            onChange={(e) =>
              updateSettings({
                desktopSettings: {
                  ...settings.desktopSettings,
                  gridSnap: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Icon Size Options */}
      <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
        <label className="text-xs font-semibold text-neutral-300">Desktop Icon Size</label>
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {iconSizes.map((size) => {
            const isSelected = settings.desktopSettings.iconSize === size.id
            return (
              <button
                key={size.id}
                onClick={() => {
                  soundService.playClick()
                  updateSettings({
                    desktopSettings: {
                      ...settings.desktopSettings,
                      iconSize: size.id,
                    },
                  })
                }}
                className={`p-3 rounded-2xl border text-center transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/20 text-white font-semibold'
                    : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-bold text-white">{size.label}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">{size.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Icon Spacing Slider */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-neutral-300">Desktop Icon Grid Spacing</label>
          <span className="font-mono text-cyan-300 text-xs px-2 py-0.5 rounded-md bg-white/10">
            {settings.desktopSettings.iconSpacing}px
          </span>
        </div>
        <input
          type="range"
          min={60}
          max={140}
          step={5}
          value={settings.desktopSettings.iconSpacing}
          onChange={(e) =>
            updateSettings({
              desktopSettings: {
                ...settings.desktopSettings,
                iconSpacing: Number(e.target.value),
              },
            })
          }
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500">
          <span>60px (Compact)</span>
          <span>90px (Default)</span>
          <span>140px (Spacious)</span>
        </div>
      </div>

      {/* Label Position & Selection Color */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
          <label className="text-xs font-semibold text-neutral-300">Icon Label Orientation</label>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {(['bottom', 'right'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => {
                  soundService.playClick()
                  updateSettings({
                    desktopSettings: {
                      ...settings.desktopSettings,
                      labelPosition: pos,
                    },
                  })
                }}
                className={`py-2 rounded-xl border text-xs font-semibold capitalize transition ${
                  settings.desktopSettings.labelPosition === pos
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                {pos === 'bottom' ? 'Bottom (Classic)' : 'Right (Side)'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
          <label className="text-xs font-semibold text-neutral-300">Selection Highlight Color</label>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="color"
              value={settings.desktopSettings.selectionColor}
              onChange={(e) =>
                updateSettings({
                  desktopSettings: {
                    ...settings.desktopSettings,
                    selectionColor: e.target.value,
                  },
                })
              }
              className="w-10 h-8 rounded-lg bg-transparent border border-white/20 cursor-pointer"
            />
            <span className="font-mono text-xs text-neutral-300 uppercase">
              {settings.desktopSettings.selectionColor}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Widgets Center */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Layers size={14} className="text-cyan-400" />
              <span>Interactive Desktop Widgets</span>
            </h4>
            <p className="text-[11px] text-neutral-400">
              Pin live translucent widgets directly onto your desktop workspace.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {widgetDefinitions.map((def) => {
            const Icon = def.icon
            const isEnabled = !!settings.desktopWidgets.find((w) => w.type === def.type && w.enabled)
            return (
              <div
                key={def.type}
                onClick={() => toggleWidget(def.type)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  isEnabled
                    ? 'border-cyan-400 bg-cyan-500/15 text-white'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-2 rounded-lg ${isEnabled ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-neutral-400'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{def.title}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{def.desc}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 pointer-events-none"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
