import React from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import { LIQUID_GLASS_PRESETS } from '@/core/theme/liquidGlass'
import type { LiquidGlassPreset } from '@/types'
import {
  Droplets,
  Sparkles,
  Check,
  Zap,
  Sliders,
  Layers,
  Sun,
  Eye,
} from 'lucide-react'

export const LiquidGlassSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()

  const presets: { id: LiquidGlassPreset; name: string; desc: string }[] = [
    { id: 'clear', name: 'Clear Glass', desc: 'High transparency with pristine clarity' },
    { id: 'frosted', name: 'Frosted Glass', desc: 'Classic matte dispersion and soft ambient glow' },
    { id: 'deep', name: 'Deep Space', desc: 'Heavy darkness with luminous edge highlights' },
    { id: 'liquid', name: 'Liquid Fluid', desc: 'Hyper-vibrant saturation with liquid reflection' },
    { id: 'crystal', name: 'Crystal Prism', desc: 'Refractive sharp specular highlights' },
    { id: 'dark', name: 'Stealth Obsidian', desc: 'Near-opaque midnight substrate' },
    { id: 'colored', name: 'Cosmic Tinted', desc: 'Infused with active system accent luminescence' },
    { id: 'minimal', name: 'Minimal Modern', desc: 'Ultra-light blur optimized for maximum frame rates' },
  ]

  const tintOptions: { id: 'auto' | 'blue' | 'purple' | 'white' | 'black' | 'custom'; label: string }[] = [
    { id: 'auto', label: 'Auto (System)' },
    { id: 'blue', label: 'Cyber Blue' },
    { id: 'purple', label: 'Deep Purple' },
    { id: 'white', label: 'Opal White' },
    { id: 'black', label: 'Obsidian' },
    { id: 'custom', label: 'Custom Tint' },
  ]

  const applyPreset = (presetId: LiquidGlassPreset) => {
    soundService.playClick()
    const presetValues = LIQUID_GLASS_PRESETS[presetId] || {}
    updateSettings({
      liquidGlass: {
        ...settings.liquidGlass,
        ...presetValues,
        preset: presetId,
      },
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1">Liquid Glass Design System</h3>
          <p className="text-neutral-400 text-xs">
            Fine-tune real-time backdrop blur, optical saturation, specular sheen, and surface refraction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-300 font-medium">Master Glass Engine</span>
          <input
            type="checkbox"
            checked={settings.liquidGlass.enabled}
            onChange={(e) =>
              updateSettings({
                liquidGlass: {
                  ...settings.liquidGlass,
                  enabled: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Live Interactive Glass Preview Card */}
      <div className="relative h-44 rounded-2xl overflow-hidden border border-white/20 p-4 flex flex-col justify-between shadow-2xl">
        {/* Vibrant backdrop gradient behind glass */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-purple-700 via-cyan-500 to-amber-500 animate-pulse duration-1000" />
        <div className="absolute inset-0 -z-10 bg-radial-at-c from-transparent via-black/30 to-black/70" />

        <div className="flex items-center justify-between text-xs text-white/90">
          <span className="font-bold flex items-center gap-1.5">
            <Droplets size={14} className="text-cyan-300" /> Liquid Glass Surface
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md">
            Preset: {settings.liquidGlass.preset}
          </span>
        </div>

        {/* The floating glass tile */}
        <div
          className="self-center w-full max-w-md p-4 rounded-xl flex items-center justify-between text-white shadow-xl transition-all"
          style={{
            background:
              settings.liquidGlass.tint === 'white'
                ? `rgba(255, 255, 255, ${settings.liquidGlass.opacity / 100})`
                : settings.liquidGlass.tint === 'black'
                ? `rgba(0, 0, 0, ${settings.liquidGlass.opacity / 100})`
                : settings.liquidGlass.tint === 'blue'
                ? `rgba(14, 165, 233, ${settings.liquidGlass.opacity / 100})`
                : settings.liquidGlass.tint === 'purple'
                ? `rgba(168, 85, 247, ${settings.liquidGlass.opacity / 100})`
                : settings.liquidGlass.customTintColor
                ? `${settings.liquidGlass.customTintColor}`
                : `rgba(25, 30, 48, ${settings.liquidGlass.opacity / 100})`,
            backdropFilter: `blur(${settings.liquidGlass.blur}px) saturate(${settings.liquidGlass.saturation}%) brightness(${settings.liquidGlass.brightness}%)`,
            WebkitBackdropFilter: `blur(${settings.liquidGlass.blur}px) saturate(${settings.liquidGlass.saturation}%) brightness(${settings.liquidGlass.brightness}%)`,
            border: `${settings.liquidGlass.borderVisibility > 0 ? 1 : 0}px solid rgba(255, 255, 255, ${settings.liquidGlass.borderVisibility / 100})`,
            borderRadius: `${settings.liquidGlass.cornerRadius}px`,
          }}
        >
          <div>
            <div className="font-bold text-xs">Simulated Refractive Panel</div>
            <div className="text-[10px] text-white/80">
              Opacity: {settings.liquidGlass.opacity}% &bull; Blur: {settings.liquidGlass.blur}px &bull; Sat: {settings.liquidGlass.saturation}%
            </div>
          </div>
          <Sparkles size={18} className="text-cyan-200" />
        </div>

        <div className="text-[9px] text-white/70 text-right">
          Rendering dynamic CSS backdrop-filter filters
        </div>
      </div>

      {/* Glass Presets Grid */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
          <Layers size={14} className="text-cyan-400" />
          <span>Optic Presets ({presets.length})</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((p) => {
            const isSelected = settings.liquidGlass.preset === p.id
            return (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/20 text-white font-bold ring-2 ring-cyan-500/30'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">{p.name}</div>
                  <div className="text-[10px] text-neutral-400 mt-1 line-clamp-2">{p.desc}</div>
                </div>
                {isSelected && <span className="text-[9px] text-cyan-300 font-mono mt-2 self-end">Selected</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Fine-grained Sliders */}
      <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="text-xs font-semibold text-white">Manual Optical Parameters</h4>

        {/* Opacity Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300">Surface Opacity</span>
            <span className="font-mono text-cyan-300">{settings.liquidGlass.opacity}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={90}
            step={2}
            value={settings.liquidGlass.opacity}
            onChange={(e) =>
              updateSettings({
                liquidGlass: {
                  ...settings.liquidGlass,
                  opacity: Number(e.target.value),
                },
              })
            }
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* Blur Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300">Backdrop Blur Dispersion</span>
            <span className="font-mono text-cyan-300">{settings.liquidGlass.blur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={2}
            value={settings.liquidGlass.blur}
            onChange={(e) =>
              updateSettings({
                liquidGlass: {
                  ...settings.liquidGlass,
                  blur: Number(e.target.value),
                },
              })
            }
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* Saturation Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300">Chromatic Saturation Boost</span>
            <span className="font-mono text-cyan-300">{settings.liquidGlass.saturation}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={200}
            step={5}
            value={settings.liquidGlass.saturation}
            onChange={(e) =>
              updateSettings({
                liquidGlass: {
                  ...settings.liquidGlass,
                  saturation: Number(e.target.value),
                },
              })
            }
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* Brightness Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300">Surface Luminance / Brightness</span>
            <span className="font-mono text-cyan-300">{settings.liquidGlass.brightness}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={150}
            step={5}
            value={settings.liquidGlass.brightness}
            onChange={(e) =>
              updateSettings({
                liquidGlass: {
                  ...settings.liquidGlass,
                  brightness: Number(e.target.value),
                },
              })
            }
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* Border Visibility Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300">Edge Border Specular Visibility</span>
            <span className="font-mono text-cyan-300">{settings.liquidGlass.borderVisibility}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={settings.liquidGlass.borderVisibility}
            onChange={(e) =>
              updateSettings({
                liquidGlass: {
                  ...settings.liquidGlass,
                  borderVisibility: Number(e.target.value),
                },
              })
            }
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* Corner Radius Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300">Window & Panel Corner Curvature</span>
            <span className="font-mono text-cyan-300">{settings.liquidGlass.cornerRadius}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={2}
            value={settings.liquidGlass.cornerRadius}
            onChange={(e) =>
              updateSettings({
                liquidGlass: {
                  ...settings.liquidGlass,
                  cornerRadius: Number(e.target.value),
                },
              })
            }
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Glass Tint & Performance Mode */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <label className="text-xs font-semibold text-neutral-300">Glass Color Tint</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {tintOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                soundService.playClick()
                updateSettings({
                  liquidGlass: {
                    ...settings.liquidGlass,
                    tint: opt.id,
                  },
                })
              }}
              className={`p-2 rounded-xl border text-center text-xs font-medium transition ${
                settings.liquidGlass.tint === opt.id
                  ? 'border-cyan-400 bg-cyan-500/20 text-white font-bold'
                  : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            <div>
              <div className="font-semibold text-white text-xs">Performance Mode (Reduced GPU Blur)</div>
              <div className="text-[11px] text-neutral-400">Lowers blur complexity to optimize battery & mobile FPS</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.liquidGlass.performanceMode}
            onChange={(e) =>
              updateSettings({
                liquidGlass: {
                  ...settings.liquidGlass,
                  performanceMode: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
