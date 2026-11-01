import React from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import {
  Activity,
  Sliders,
  Sparkles,
  Zap,
  PlayCircle,
  EyeOff,
} from 'lucide-react'

export const AnimationsSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">System Animations</h3>
        <p className="text-neutral-400 text-xs">
          Configure transition velocity, desktop motion responsiveness, and spring physics.
        </p>
      </div>

      {/* Animation Speed Slider */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" />
            <span>Global Animation Velocity</span>
          </label>
          <span className="font-mono text-cyan-300 text-xs px-2 py-0.5 rounded-md bg-white/10">
            {settings.animationSettings.speed}x
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2.0}
          step={0.1}
          value={settings.animationSettings.speed}
          onChange={(e) =>
            updateSettings({
              animationSettings: {
                ...settings.animationSettings,
                speed: Number(e.target.value),
              },
            })
          }
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500">
          <span>0.5x (Relaxed Cinematic)</span>
          <span>1.0x (Standard)</span>
          <span>2.0x (Hyper Speed)</span>
        </div>
      </div>

      {/* Animation Toggles */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="text-xs font-semibold text-white">Motion Effects</h4>

        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div>
              <div className="font-semibold text-white text-xs">Window Open/Close Transitions</div>
              <div className="text-[11px] text-neutral-400">Smooth scale & opacity interpolation</div>
            </div>
            <input
              type="checkbox"
              checked={settings.animationSettings.windowTransitions}
              onChange={(e) =>
                updateSettings({
                  animationSettings: {
                    ...settings.animationSettings,
                    windowTransitions: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div>
              <div className="font-semibold text-white text-xs">Dock App Launch Bounce</div>
              <div className="text-[11px] text-neutral-400">Playful spring bounce indicator when app opens</div>
            </div>
            <input
              type="checkbox"
              checked={settings.animationSettings.dockBounce}
              onChange={(e) =>
                updateSettings({
                  animationSettings: {
                    ...settings.animationSettings,
                    dockBounce: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div>
              <div className="font-semibold text-white text-xs">Desktop Dynamic Particles</div>
              <div className="text-[11px] text-neutral-400">Ambient floating particles over desktop wallpapers</div>
            </div>
            <input
              type="checkbox"
              checked={settings.animationSettings.particleEffects}
              onChange={(e) =>
                updateSettings({
                  animationSettings: {
                    ...settings.animationSettings,
                    particleEffects: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div>
              <div className="font-semibold text-white text-xs">Reduced Motion Mode</div>
              <div className="text-[11px] text-neutral-400">Disable non-essential visual transitions</div>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
