import React from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import type { AccentColor, ThemeMode } from '@/types'
import { Sun, Moon, Sparkles, Check, Eye, Sliders, Sunset } from 'lucide-react'

export const AppearanceSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()

  const accentOptions: { id: AccentColor; name: string; color: string }[] = [
    { id: 'blue', name: 'Cosmic Blue', color: '#3b82f6' },
    { id: 'purple', name: 'Midnight Purple', color: '#8b5cf6' },
    { id: 'emerald', name: 'Emerald Wave', color: '#10b981' },
    { id: 'orange', name: 'Radiant Orange', color: '#f97316' },
    { id: 'rose', name: 'Cyber Rose', color: '#f43f5e' },
    { id: 'amber', name: 'Solar Amber', color: '#f59e0b' },
  ]

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Appearance</h3>
        <p className="text-neutral-400 text-xs">
          Customize the color scheme, theme mode, system font scaling, and display temperatures.
        </p>
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
                  ? 'border-blue-500 bg-blue-500/10 text-white font-bold ring-2 ring-blue-500/30'
                  : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {mode === 'dark' && <Moon size={20} className="mb-1 text-purple-400" />}
              {mode === 'light' && <Sun size={20} className="mb-1 text-amber-400" />}
              {mode === 'auto' && <Sparkles size={20} className="mb-1 text-blue-400" />}
              <span className="text-xs">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color picker */}
      <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
        <label className="text-xs font-semibold text-neutral-300">Accent Color</label>
        <div className="flex items-center gap-3 pt-1">
          {accentOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                soundService.playClick()
                updateSettings({ accentColor: opt.id })
              }}
              style={{ backgroundColor: opt.color }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-md ${
                settings.accentColor === opt.id ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110' : 'hover:scale-105'
              }`}
              title={opt.name}
            >
              {settings.accentColor === opt.id && <Check size={16} className="text-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* Font & Text Scaling */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
            <Sliders size={14} className="text-cyan-400" />
            <span>Font & Text Scaling</span>
          </label>
          <span className="font-mono text-cyan-300 text-xs px-2 py-0.5 rounded-md bg-white/10">
            {settings.accessibilitySettings.textScale}%
          </span>
        </div>
        <input
          type="range"
          min={80}
          max={130}
          step={5}
          value={settings.accessibilitySettings.textScale}
          onChange={(e) =>
            updateSettings({
              accessibilitySettings: {
                ...settings.accessibilitySettings,
                textScale: Number(e.target.value),
              },
            })
          }
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500">
          <span>80% (Compact)</span>
          <span>100% (Default)</span>
          <span>130% (Large)</span>
        </div>
      </div>

      {/* Night Light & Warm Temperature */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sunset size={16} className="text-amber-400" />
            <div>
              <div className="font-semibold text-white text-xs">Night Light Mode</div>
              <div className="text-[11px] text-neutral-400">Warmer screen hues for reduced eye strain</div>
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
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300 text-[11px]">Color Warmth</span>
              <span className="font-mono text-amber-300 text-[11px]">{settings.nightLightTemperature || 3400}K</span>
            </div>
            <input
              type="range"
              min={2000}
              max={6500}
              step={100}
              value={settings.nightLightTemperature || 3400}
              onChange={(e) => updateSettings({ nightLightTemperature: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* High Contrast */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2.5">
          <Eye size={16} className="text-emerald-400" />
          <div>
            <div className="font-semibold text-white text-xs">High Contrast Mode</div>
            <div className="text-[11px] text-neutral-400">Sharpen borders, window outlines, and text readability</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.accessibilitySettings.highContrast}
          onChange={(e) =>
            updateSettings({
              accessibilitySettings: {
                ...settings.accessibilitySettings,
                highContrast: e.target.checked,
              },
            })
          }
          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
        />
      </div>
    </div>
  )
}
