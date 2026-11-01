import React from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import {
  AppWindow,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Layout,
  Check,
} from 'lucide-react'

export const WindowSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()

  const minimizeEffects: { id: 'genie' | 'scale' | 'fade'; label: string; desc: string }[] = [
    { id: 'genie', label: 'Genie Suck', desc: 'macOS-style non-linear warping vacuum into dock' },
    { id: 'scale', label: 'Geometric Scale', desc: 'Smooth proportional zoom into target icon' },
    { id: 'fade', label: 'Instant Fade', desc: 'Minimal opacity dissolve' },
  ]

  const titlebarStyles: { id: 'mac' | 'windows' | 'compact'; label: string; desc: string }[] = [
    { id: 'mac', label: 'macOS Traffic Lights', desc: 'Colored pills on left, centered window title' },
    { id: 'windows', label: 'Windows Modern', desc: 'Left title text, Min/Max/Close on right' },
    { id: 'compact', label: 'Compact Minimal', desc: 'Slim 32px height for high information density' },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Window Management</h3>
        <p className="text-neutral-400 text-xs">
          Control window frame chrome, edge snapping, minimize acoustics, and drop shadow depths.
        </p>
      </div>

      {/* Titlebar Style */}
      <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
        <label className="text-xs font-semibold text-neutral-300">Titlebar Chrome Design</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {titlebarStyles.map((style) => {
            const isSelected = settings.windowManagerSettings.titlebarStyle === style.id
            return (
              <button
                key={style.id}
                onClick={() => {
                  soundService.playClick()
                  updateSettings({
                    windowManagerSettings: {
                      ...settings.windowManagerSettings,
                      titlebarStyle: style.id,
                    },
                  })
                }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/20 text-white font-semibold'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">{style.label}</div>
                  <div className="text-[10px] text-neutral-400 mt-1 leading-relaxed">{style.desc}</div>
                </div>
                {isSelected && <span className="text-[10px] text-blue-300 font-mono mt-2 self-end">Selected</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Minimize Transition Effect */}
      <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
        <label className="text-xs font-semibold text-neutral-300">Minimize Animation Effect</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {minimizeEffects.map((effect) => {
            const isSelected = settings.windowManagerSettings.minimizeEffect === effect.id
            return (
              <button
                key={effect.id}
                onClick={() => {
                  soundService.playClick()
                  updateSettings({
                    windowManagerSettings: {
                      ...settings.windowManagerSettings,
                      minimizeEffect: effect.id,
                    },
                  })
                }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/20 text-white font-semibold'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">{effect.label}</div>
                  <div className="text-[10px] text-neutral-400 mt-1">{effect.desc}</div>
                </div>
                {isSelected && <span className="text-[10px] text-cyan-300 font-mono mt-2 self-end">Active</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Snapping & Double Click */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div>
            <div className="font-semibold text-white text-xs">Edge & Corner Snapping</div>
            <div className="text-[11px] text-neutral-400">Snap to half/quarter desktop on edge drag</div>
          </div>
          <input
            type="checkbox"
            checked={settings.windowManagerSettings.snapEnabled}
            onChange={(e) =>
              updateSettings({
                windowManagerSettings: {
                  ...settings.windowManagerSettings,
                  snapEnabled: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <label className="text-xs font-semibold text-neutral-300">Double-Click Titlebar</label>
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            {(['maximize', 'minimize'] as const).map((action) => (
              <button
                key={action}
                onClick={() => {
                  soundService.playClick()
                  updateSettings({
                    windowManagerSettings: {
                      ...settings.windowManagerSettings,
                      doubleClickAction: action,
                    },
                  })
                }}
                className={`py-1.5 rounded-xl border text-center text-xs capitalize transition ${
                  settings.windowManagerSettings.doubleClickAction === action
                    ? 'border-blue-500 bg-blue-500/20 text-white font-bold'
                    : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shadow Depth Slider */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-neutral-300">Window Elevation Shadow Depth</label>
          <span className="font-mono text-cyan-300 text-xs px-2 py-0.5 rounded-md bg-white/10">
            {settings.windowManagerSettings.shadowDepth}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={settings.windowManagerSettings.shadowDepth}
          onChange={(e) =>
            updateSettings({
              windowManagerSettings: {
                ...settings.windowManagerSettings,
                shadowDepth: Number(e.target.value),
              },
            })
          }
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500">
          <span>0% (Flat 2D)</span>
          <span>65% (Balanced)</span>
          <span>100% (High Altitude Float)</span>
        </div>
      </div>
    </div>
  )
}
