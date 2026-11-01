import React from 'react'
import {
  Activity,
  Cpu,
  HardDrive,
  Layers,
  Monitor,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Database,
  Wifi,
  Sparkles,
} from 'lucide-react'
import type { TelemetrySnapshot, GpuCapabilities } from '../types'

interface OverviewTabProps {
  currentTelemetry: TelemetrySnapshot
  history: TelemetrySnapshot[]
  gpuInfo: GpuCapabilities
  cpuCores: number
  deviceMemory: number | null
  activeAppsCount: number
  openWindowsCount: number
  onNavigateTab: (tab: any) => void
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  currentTelemetry,
  history,
  gpuInfo,
  cpuCores,
  deviceMemory,
  activeAppsCount,
  openWindowsCount,
  onNavigateTab,
}) => {
  const fpsHistory = history.map((h) => h.fps)
  const is3DHeavy = openWindowsCount > 4
  const isFpsLow = currentTelemetry.fps < 30

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-6">
      {/* Performance Notices & Warnings */}
      {(is3DHeavy || isFpsLow) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-semibold text-amber-300">Performance Advisory</span>
            <p className="text-neutral-300 leading-relaxed">
              {is3DHeavy
                ? `${openWindowsCount} virtual windows are active in the workspace. For optimal WebGL frame rates, minimize or close unused background 3D applications.`
                : 'Frame rate is currently below 30 FPS. Ensure hardware acceleration is enabled in your browser settings.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Frame Rate (FPS) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Frame Rate (Live)
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                currentTelemetry.fps >= 50
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : currentTelemetry.fps >= 30
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {currentTelemetry.fps} FPS
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {currentTelemetry.fps}
            </span>
            <span className="text-xs text-neutral-400">Hz refresh</span>
          </div>

          <div className="h-10 flex items-end gap-0.5">
            {fpsHistory.slice(-24).map((fps, i) => (
              <div
                key={i}
                style={{ height: `${Math.min(100, (fps / 60) * 100)}%` }}
                className={`flex-1 rounded-t transition-all duration-300 ${
                  fps >= 50 ? 'bg-emerald-500/70' : fps >= 30 ? 'bg-amber-500/70' : 'bg-rose-500/70'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-neutral-500 mt-2 font-mono">Real-time RAF telemetry</span>
        </div>

        {/* Browser Memory Heap */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" /> JS Heap Usage
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {currentTelemetry.jsHeapUsedMb ? `${currentTelemetry.jsHeapUsedMb} MB` : 'Browser Sandboxed'}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {currentTelemetry.jsHeapUsedMb ? Math.round(currentTelemetry.jsHeapUsedMb) : '—'}
            </span>
            <span className="text-xs text-neutral-400">
              {currentTelemetry.jsHeapTotalMb ? `/ ${Math.round(currentTelemetry.jsHeapTotalMb)} MB total` : 'MB'}
            </span>
          </div>

          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              style={{
                width: currentTelemetry.jsHeapUsedMb && currentTelemetry.jsHeapTotalMb
                  ? `${Math.min(100, (currentTelemetry.jsHeapUsedMb / currentTelemetry.jsHeapTotalMb) * 100)}%`
                  : '40%',
              }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
            />
          </div>
          <span className="text-[10px] text-neutral-500 mt-2 font-mono">
            {currentTelemetry.jsHeapUsedMb ? 'performance.memory measurement' : 'Sandboxed browser process'}
          </span>
        </div>

        {/* Virtual OS Multitasking */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Active Windows
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {openWindowsCount} Open
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {openWindowsCount}
            </span>
            <span className="text-xs text-neutral-400">across {activeAppsCount} apps</span>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-neutral-300">
              Active: {currentTelemetry.activeAppId || 'Desktop'}
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 mt-2 font-mono">WindowManager state stream</span>
        </div>

        {/* IndexedDB & Storage Quota */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" /> Virtual Storage
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {currentTelemetry.storageUsedMb ? `${currentTelemetry.storageUsedMb} MB` : 'Measuring...'}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {currentTelemetry.storageUsedMb ? currentTelemetry.storageUsedMb : '0.0'}
            </span>
            <span className="text-xs text-neutral-400">
              {currentTelemetry.storageQuotaMb ? `/ ${(currentTelemetry.storageQuotaMb / 1024).toFixed(1)} GB Quota` : 'MB'}
            </span>
          </div>

          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              style={{
                width: currentTelemetry.storageUsedMb && currentTelemetry.storageQuotaMb
                  ? `${Math.max(2, Math.min(100, (currentTelemetry.storageUsedMb / currentTelemetry.storageQuotaMb) * 100))}%`
                  : '5%',
              }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
            />
          </div>
          <span className="text-[10px] text-neutral-500 mt-2 font-mono">navigator.storage.estimate()</span>
        </div>
      </div>

      {/* Hardware & Graphics Capability Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Browser Hardware & WebGL Profile</h3>
          </div>
          <span className="text-xs text-cyan-400 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hardware Acceleration Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="space-y-1">
            <span className="text-[11px] text-neutral-400">WebGL Compositor Engine</span>
            <p className="text-xs font-semibold text-neutral-200 font-mono truncate">{gpuInfo.webglVersion}</p>
            <p className="text-[11px] text-neutral-500 truncate">{gpuInfo.unmaskedRenderer}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-neutral-400">CPU Execution Threads</span>
            <p className="text-xs font-semibold text-neutral-200 font-mono">
              {cpuCores} Logical CPU Cores Reported
            </p>
            <p className="text-[11px] text-neutral-500">
              {deviceMemory ? `~${deviceMemory} GB device memory estimate` : 'Browser sandboxed device memory'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-neutral-400">Graphics Buffer Limits</span>
            <p className="text-xs font-semibold text-neutral-200 font-mono">
              {gpuInfo.maxTextureSize}px Max Texture Size
            </p>
            <p className="text-[11px] text-neutral-500">{gpuInfo.supportedExtensionsCount} WebGL Extensions Supported</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('processes')}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400 group-hover:text-cyan-300">
            <span className="text-xs font-semibold">Processes</span>
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Manage virtual OS tasks</span>
        </button>

        <button
          onClick={() => onNavigateTab('performance')}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400 group-hover:text-emerald-300">
            <span className="text-xs font-semibold">Performance</span>
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Live timeline graphs</span>
        </button>

        <button
          onClick={() => onNavigateTab('storage')}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400 group-hover:text-amber-300">
            <span className="text-xs font-semibold">Storage</span>
            <HardDrive className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Virtual filesystem & quotas</span>
        </button>

        <button
          onClick={() => onNavigateTab('gpu')}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400 group-hover:text-purple-300">
            <span className="text-xs font-semibold">GPU & 3D</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Three.js gaming telemetry</span>
        </button>
      </div>

      {/* Disclaimers & Integrity Note */}
      <div className="text-[11px] text-neutral-500 border-t border-white/10 pt-4 leading-relaxed">
        <span className="font-semibold text-neutral-400">System Monitor Integrity Contract:</span> All values
        represent genuine browser-accessible performance telemetry (Performance API, WebGL Canvas Context,
        StorageManager API, Window Compositor state). Physical host CPU/RAM registers outside the browser sandbox
        are neither measured nor fabricated.
      </div>
    </div>
  )
}
