import React from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import { Volume2, VolumeX, Bell, Play, Sparkles } from 'lucide-react'

export const SoundSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Sound Preferences</h3>
        <p className="text-neutral-400 text-xs">
          Control synthetic audio acoustics, master output volumes, and system interface sound effects.
        </p>
      </div>

      {/* Master Sound Effects Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2.5">
          <Volume2 size={18} className="text-blue-400" />
          <div>
            <div className="font-semibold text-white text-xs">System Sound Effects</div>
            <div className="text-[11px] text-neutral-400">Window snaps, startup chords, clicks, and trash sounds</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.soundEffects}
          onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Volume Sliders */}
      <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-300 font-medium">Master Output Volume</span>
            <span className="font-mono text-cyan-300">{Math.round(settings.volume * 100)}%</span>
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

        <div className="space-y-1.5 pt-2 border-t border-white/10">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-300 font-medium">UI Acoustic Effects Volume</span>
            <span className="font-mono text-cyan-300">{Math.round(settings.uiSoundsVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.uiSoundsVolume}
            onChange={(e) => updateSettings({ uiSoundsVolume: Number(e.target.value) })}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Audio Synthesis Test Panel */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="text-xs font-semibold text-white">Audio Synthesis Verification</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => soundService.playStartup()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-md shadow-blue-600/20"
          >
            <Play size={13} />
            <span>Startup Chord</span>
          </button>

          <button
            onClick={() => soundService.playTrashEmpty()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
          >
            <Play size={13} />
            <span>Trash Empty</span>
          </button>

          <button
            onClick={() => soundService.playClick()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
          >
            <Play size={13} />
            <span>Click / Snap</span>
          </button>
        </div>
      </div>
    </div>
  )
}
