import React from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import {
  PanelTop,
  Clock,
  Battery,
  Wifi,
  Volume2,
  User,
  Sliders,
} from 'lucide-react'

export const PanelsSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Taskbar & Menu Bar Panels</h3>
        <p className="text-neutral-400 text-xs">
          Configure the top system status bar, digital clock formats, tray icons, and backdrop blur dispersion.
        </p>
      </div>

      {/* Clock Configuration */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
          <Clock size={14} className="text-cyan-400" />
          <span>Menu Bar Digital Clock</span>
        </label>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {(['12h', '24h'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => {
                soundService.playClick()
                updateSettings({
                  panelSettings: {
                    ...settings.panelSettings,
                    clockFormat: fmt,
                  },
                })
              }}
              className={`py-2 rounded-xl border text-xs font-semibold transition ${
                settings.panelSettings.clockFormat === fmt
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              {fmt === '12h' ? '12-Hour (02:45 PM)' : '24-Hour (14:45)'}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div>
            <div className="text-xs font-medium text-white">Display Seconds</div>
            <div className="text-[10px] text-neutral-400">Show continuous ticking seconds counter</div>
          </div>
          <input
            type="checkbox"
            checked={settings.panelSettings.showSeconds}
            onChange={(e) =>
              updateSettings({
                panelSettings: {
                  ...settings.panelSettings,
                  showSeconds: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Status Tray Indicators */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="text-xs font-semibold text-white">Status Tray Indicators</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <div className="flex items-center gap-2">
              <Battery size={14} className="text-emerald-400" />
              <span className="text-xs text-neutral-300">Battery Status</span>
            </div>
            <input
              type="checkbox"
              checked={settings.panelSettings.showBattery}
              onChange={(e) =>
                updateSettings({
                  panelSettings: {
                    ...settings.panelSettings,
                    showBattery: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <div className="flex items-center gap-2">
              <Wifi size={14} className="text-blue-400" />
              <span className="text-xs text-neutral-300">Wi-Fi Telemetry</span>
            </div>
            <input
              type="checkbox"
              checked={settings.panelSettings.showWifi}
              onChange={(e) =>
                updateSettings({
                  panelSettings: {
                    ...settings.panelSettings,
                    showWifi: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-purple-400" />
              <span className="text-xs text-neutral-300">Volume Quick Control</span>
            </div>
            <input
              type="checkbox"
              checked={settings.panelSettings.showSound}
              onChange={(e) =>
                updateSettings({
                  panelSettings: {
                    ...settings.panelSettings,
                    showSound: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <div className="flex items-center gap-2">
              <User size={14} className="text-amber-400" />
              <span className="text-xs text-neutral-300">User Account Tile</span>
            </div>
            <input
              type="checkbox"
              checked={settings.panelSettings.showUser}
              onChange={(e) =>
                updateSettings({
                  panelSettings: {
                    ...settings.panelSettings,
                    showUser: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
          </label>
        </div>
      </div>

      {/* Panel Blur Depth */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-neutral-300">Menu Bar Glass Blur Depth</label>
          <span className="font-mono text-cyan-300 text-xs px-2 py-0.5 rounded-md bg-white/10">
            {settings.panelSettings.blurDepth}px
          </span>
        </div>
        <input
          type="range"
          min={8}
          max={40}
          step={2}
          value={settings.panelSettings.blurDepth}
          onChange={(e) =>
            updateSettings({
              panelSettings: {
                ...settings.panelSettings,
                blurDepth: Number(e.target.value),
              },
            })
          }
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500">
          <span>8px (Subtle)</span>
          <span>20px (Balanced)</span>
          <span>40px (Deep Frost)</span>
        </div>
      </div>
    </div>
  )
}
