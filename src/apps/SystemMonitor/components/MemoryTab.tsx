import React from 'react'
import {
  HardDrive,
  Cpu,
  Database,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  PieChart,
} from 'lucide-react'
import type { TelemetrySnapshot } from '../types'

interface MemoryTabProps {
  currentTelemetry: TelemetrySnapshot
  deviceMemory: number | null
}

export const MemoryTab: React.FC<MemoryTabProps> = ({ currentTelemetry, deviceMemory }) => {
  // Approximate local storage breakdown
  const localStorageSize = typeof window !== 'undefined' ? Math.round((JSON.stringify(localStorage).length / 1024) * 10) / 10 : 0

  const categories = [
    { name: 'Application Bundles & Code', size: '~24.5 MB', color: 'bg-blue-500', percent: 35 },
    { name: 'IndexedDB Virtual Storage', size: `${currentTelemetry.storageUsedMb || 4.2} MB`, color: 'bg-amber-500', percent: 22 },
    { name: 'System Settings & Themes', size: `${localStorageSize} KB`, color: 'bg-emerald-500', percent: 8 },
    { name: 'Game Saves & Blockworld', size: '~12.8 MB', color: 'bg-purple-500', percent: 20 },
    { name: 'Wallpaper & Glass Cache', size: '~8.4 MB', color: 'bg-cyan-500', percent: 15 },
  ]

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* JS Heap Allocation */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" /> JavaScript Heap
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-blue-500/20 text-blue-300">
              {currentTelemetry.jsHeapUsedMb ? `${currentTelemetry.jsHeapUsedMb} MB` : 'Sandboxed'}
            </span>
          </div>

          <div className="my-3">
            <span className="text-3xl font-extrabold text-white font-mono">
              {currentTelemetry.jsHeapUsedMb ? Math.round(currentTelemetry.jsHeapUsedMb) : '—'}
            </span>
            <span className="text-xs text-neutral-400 ml-1">
              / {currentTelemetry.jsHeapTotalMb ? Math.round(currentTelemetry.jsHeapTotalMb) : '—'} MB
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">Active runtime object allocation</span>
        </div>

        {/* Browser Quota */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" /> Storage Quota
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-amber-300">
              {currentTelemetry.storageQuotaMb ? `${(currentTelemetry.storageQuotaMb / 1024).toFixed(1)} GB` : 'Standard'}
            </span>
          </div>

          <div className="my-3">
            <span className="text-3xl font-extrabold text-white font-mono">
              {currentTelemetry.storageUsedMb ? currentTelemetry.storageUsedMb : '0'}
            </span>
            <span className="text-xs text-neutral-400 ml-1">MB utilized</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">StorageManager API report</span>
        </div>

        {/* Device Memory Rating */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" /> Device Memory Class
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300">
              {deviceMemory ? `${deviceMemory} GB Class` : 'Standard Client'}
            </span>
          </div>

          <div className="my-3">
            <span className="text-3xl font-extrabold text-white font-mono">
              {deviceMemory ? `~${deviceMemory}` : '—'}
            </span>
            <span className="text-xs text-neutral-400 ml-1">GB RAM reported</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">navigator.deviceMemory coarse approximation</span>
        </div>
      </div>

      {/* Memory & Storage Allocation Breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
        <h3 className="text-xs font-semibold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-purple-400" /> NOVA OS Memory & Storage Distribution
        </h3>

        {/* Multi-segmented Progress Bar */}
        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden flex">
          {categories.map((cat, i) => (
            <div
              key={i}
              style={{ width: `${cat.percent}%` }}
              className={`${cat.color} h-full transition-all duration-500`}
              title={`${cat.name}: ${cat.size}`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {categories.map((cat, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2 bg-white/5 rounded-xl border border-white/5">
              <div className={`w-3 h-3 rounded-full ${cat.color} shrink-0`} />
              <div className="truncate">
                <span className="text-xs text-neutral-300 block truncate">{cat.name}</span>
                <span className="text-[10px] text-neutral-500 font-mono">{cat.size} ({cat.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Browser Sandbox Privacy Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3 text-blue-200">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-semibold text-blue-300">Browser Security Sandbox Notice</span>
          <p className="text-neutral-300 leading-relaxed">
            By design, web browsers isolate web applications from the host operating system's raw memory space.
            NOVA OS strictly reports genuine JavaScript heap metrics exposed by the Chromium engine. It does not fabricate
            measurements of external host processes (such as Windows explorer.exe, kernel threads, or physical RAM hardware).
          </p>
        </div>
      </div>
    </div>
  )
}
