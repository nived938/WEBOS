import React from 'react'
import {
  Layers,
  AppWindow,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  PieChart,
} from 'lucide-react'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { soundService } from '@/core/audio/soundService'
import type { AppId } from '@/types'

interface ApplicationsTabProps {
  runningAppIds: AppId[]
  openWindowsCount: number
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  runningAppIds,
  openWindowsCount,
}) => {
  const { openApp, windows } = useWindowManager()

  const allApps = Object.values(APPS_REGISTRY)

  // Calculate category distribution of registered apps
  const categoryCounts = allApps.reduce<Record<string, number>>((acc, app) => {
    acc[app.category] = (acc[app.category] || 0) + 1
    return acc
  }, {})

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-6">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Registered Apps */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <AppWindow className="w-4 h-4 text-cyan-400" /> App Ecosystem
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-500/20 text-cyan-300">
              Registered
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-white font-mono">{allApps.length}</span>
            <span className="text-xs text-neutral-400 ml-1">Native Apps</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">APPS_REGISTRY catalog</span>
        </div>

        {/* Currently Running Apps */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Running Instances
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300">
              Active
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-white font-mono">{runningAppIds.length}</span>
            <span className="text-xs text-neutral-400 ml-1">Apps Active</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">WindowManager state</span>
        </div>

        {/* Open Windows Count */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Open Windows
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-purple-500/20 text-purple-300">
              Composited
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-white font-mono">{openWindowsCount}</span>
            <span className="text-xs text-neutral-400 ml-1">Viewport Windows</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">Virtual DOM render pipeline</span>
        </div>
      </div>

      {/* Active Running Applications List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" /> Active Running Applications ({runningAppIds.length})
        </h3>

        {runningAppIds.length === 0 ? (
          <div className="py-6 text-center text-neutral-500 text-xs">
            No virtual applications are currently open on the desktop.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {runningAppIds.map((appId) => {
              const app = APPS_REGISTRY[appId]
              const appWindows = windows.filter((w) => w.appId === appId)
              if (!app) return null

              return (
                <div
                  key={appId}
                  className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                      style={{ backgroundColor: app.accentColor || '#3b82f6' }}
                    >
                      {app.title.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-semibold text-white block truncate">{app.title}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {appWindows.length} window{appWindows.length === 1 ? '' : 's'} open
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundService.playClick()
                      openApp(appId)
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
                    title="Launch Another Window"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-cyan-400" /> Ecosystem Category Distribution
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <div key={cat} className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[11px] text-neutral-400 block">{cat}</span>
              <span className="text-lg font-bold text-white font-mono">{count} Apps</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
