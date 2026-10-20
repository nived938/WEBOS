import React from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { soundService } from '@/core/audio/soundService'
import {
  Wifi,
  Bluetooth,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Sliders,
  Airplay,
  BellOff,
  Music,
  Monitor,
} from 'lucide-react'

interface ControlCenterProps {
  isOpen: boolean
  onClose: () => void
}

export const ControlCenter: React.FC<ControlCenterProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, toggleTheme } = useSettings()
  const { openApp } = useWindowManager()

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed top-9 right-2 z-50 w-80 bg-neutral-900/80 backdrop-blur-3xl border border-white/20 rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-xs text-neutral-200 select-none animate-in fade-in zoom-in-95 duration-150 space-y-3"
    >
      {/* 2x2 Grid of Connectivity Toggles */}
      <div className="grid grid-cols-2 gap-2">
        {/* Wi-Fi Card */}
        <button
          onClick={() => {
            soundService.playClick()
            updateSettings({ wifiEnabled: !settings.wifiEnabled })
          }}
          className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 transition text-left"
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              settings.wifiEnabled ? 'bg-blue-600 text-white' : 'bg-white/10 text-neutral-400'
            }`}
          >
            <Wifi size={16} />
          </div>
          <div>
            <div className="font-semibold text-white">Wi-Fi</div>
            <div className="text-[10px] text-neutral-400">
              {settings.wifiEnabled ? 'Nova-Guest 5G' : 'Off'}
            </div>
          </div>
        </button>

        {/* Bluetooth Card */}
        <button
          onClick={() => {
            soundService.playClick()
            updateSettings({ bluetoothEnabled: !settings.bluetoothEnabled })
          }}
          className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 transition text-left"
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              settings.bluetoothEnabled ? 'bg-blue-600 text-white' : 'bg-white/10 text-neutral-400'
            }`}
          >
            <Bluetooth size={16} />
          </div>
          <div>
            <div className="font-semibold text-white">Bluetooth</div>
            <div className="text-[10px] text-neutral-400">
              {settings.bluetoothEnabled ? 'AirPods Pro' : 'Off'}
            </div>
          </div>
        </button>

        {/* Do Not Disturb */}
        <button
          onClick={() => {
            soundService.playClick()
            updateSettings({ doNotDisturb: !settings.doNotDisturb })
          }}
          className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 transition text-left"
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              settings.doNotDisturb ? 'bg-purple-600 text-white' : 'bg-white/10 text-neutral-400'
            }`}
          >
            <BellOff size={16} />
          </div>
          <div>
            <div className="font-semibold text-white">Focus</div>
            <div className="text-[10px] text-neutral-400">
              {settings.doNotDisturb ? 'Do Not Disturb' : 'Off'}
            </div>
          </div>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={() => {
            soundService.playClick()
            toggleTheme()
          }}
          className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 transition text-left"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
            {settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </div>
          <div>
            <div className="font-semibold text-white">Theme</div>
            <div className="text-[10px] text-neutral-400 capitalize">{settings.theme}</div>
          </div>
        </button>
      </div>

      {/* Display Brightness Slider */}
      <div className="p-3 rounded-2xl bg-white/10 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-neutral-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Monitor size={13} /> <span>Display Brightness</span>
          </div>
          <span className="font-mono">{settings.brightness}%</span>
        </div>
        <input
          type="range"
          min={40}
          max={100}
          value={settings.brightness}
          onChange={(e) => updateSettings({ brightness: Number(e.target.value) })}
          className="w-full accent-blue-500 cursor-pointer"
        />
      </div>

      {/* Sound Volume Slider */}
      <div className="p-3 rounded-2xl bg-white/10 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-neutral-300">
          <div className="flex items-center gap-1.5 font-medium">
            {settings.volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span>Sound Volume</span>
          </div>
          <span className="font-mono">{Math.round(settings.volume * 100)}%</span>
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

      {/* Now Playing Widget */}
      <div
        onClick={() => {
          openApp('music')
          onClose()
        }}
        className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/15 cursor-pointer transition"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Music size={16} />
          </div>
          <div className="truncate">
            <div className="font-semibold text-white truncate">Cosmic Drift</div>
            <div className="text-[10px] text-neutral-400 truncate">Nova Sound Lab</div>
          </div>
        </div>
        <span className="text-[10px] text-neutral-400 font-medium">Music App</span>
      </div>
    </div>
  )
}
