import React, { useState } from 'react'
import {
  Rocket,
  Check,
  Power,
  Clock,
  Sparkles,
  Layers,
  Settings,
  HelpCircle,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import type { AppId } from '@/types'

export interface StartupAppConfig {
  appId: AppId
  name: string
  enabled: boolean
  delayMs: number
  priority: number
}

const DEFAULT_STARTUP_APPS: StartupAppConfig[] = [
  { appId: 'notes', name: 'Notes', enabled: true, delayMs: 400, priority: 1 },
  { appId: 'finder', name: 'Finder', enabled: false, delayMs: 800, priority: 2 },
  { appId: 'browser', name: 'Browser', enabled: false, delayMs: 1200, priority: 3 },
  { appId: 'systemmonitor', name: 'System Monitor', enabled: false, delayMs: 1500, priority: 4 },
  { appId: 'games', name: 'Gaming Hub', enabled: false, delayMs: 2000, priority: 5 },
]

export const StartupAppsTab: React.FC = () => {
  const [startupApps, setStartupApps] = useState<StartupAppConfig[]>(() => {
    try {
      const saved = localStorage.getItem('nova_startup_apps_v2')
      if (saved) return JSON.parse(saved)
    } catch {
      // Ignore
    }
    return DEFAULT_STARTUP_APPS
  })

  const toggleApp = (appId: AppId) => {
    soundService.playClick()
    setStartupApps((prev) => {
      const updated = prev.map((app) =>
        app.appId === appId ? { ...app, enabled: !app.enabled } : app
      )
      localStorage.setItem('nova_startup_apps_v2', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-6">
      {/* Overview Banner */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">NOVA OS Startup Applications</h3>
            <span className="text-xs text-neutral-400">
              Configure virtual applications that launch automatically when the desktop boots.
            </span>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-300 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
          {startupApps.filter((a) => a.enabled).length} Enabled
        </span>
      </div>

      {/* Apps Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
        {startupApps.map((app) => (
          <div
            key={app.appId}
            className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-xs">
                {app.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">{app.name}</span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Launch Delay: {app.delayMs}ms | Priority: #{app.priority}
                </span>
              </div>
            </div>

            {/* Enable/Disable Toggle */}
            <button
              onClick={() => toggleApp(app.appId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                app.enabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${app.enabled ? 'opacity-100' : 'opacity-0'}`} />
              {app.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-neutral-500 border-t border-white/10 pt-4 leading-relaxed flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0" />
        <span>
          Startup applications run inside the virtual NOVA desktop only. Windows startup items outside the browser are completely untouched.
        </span>
      </div>
    </div>
  )
}
