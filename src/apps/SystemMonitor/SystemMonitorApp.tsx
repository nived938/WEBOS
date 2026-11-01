import React, { useState, useEffect, useMemo, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import {
  Activity,
  Layers,
  TrendingUp,
  Cpu,
  HardDrive,
  Wifi,
  AppWindow,
  Monitor,
  Rocket,
  FileText,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import type {
  SystemMonitorTab,
  ProcessItem,
  TelemetrySnapshot,
  GpuCapabilities,
  NetworkResourceEntry,
  SystemLogEntry,
} from './types'
import { telemetryService } from './utils/telemetry'
import { OverviewTab } from './components/OverviewTab'
import { ProcessesTab } from './components/ProcessesTab'
import { PerformanceTab } from './components/PerformanceTab'
import { MemoryTab } from './components/MemoryTab'
import { StorageTab } from './components/StorageTab'
import { NetworkTab } from './components/NetworkTab'
import { ApplicationsTab } from './components/ApplicationsTab'
import { GpuTab } from './components/GpuTab'
import { StartupAppsTab } from './components/StartupAppsTab'
import { SystemLogsTab } from './components/SystemLogsTab'

const NAVIGATION_ITEMS: { id: SystemMonitorTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'processes', label: 'Processes', icon: Layers },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'memory', label: 'Memory', icon: Cpu },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'network', label: 'Network', icon: Wifi },
  { id: 'applications', label: 'Applications', icon: AppWindow },
  { id: 'gpu', label: 'GPU & Graphics', icon: Monitor },
  { id: 'startup', label: 'Startup Apps', icon: Rocket },
  { id: 'logs', label: 'System Logs', icon: FileText },
]

export const SystemMonitorApp: React.FC<AppInstanceProps> = () => {
  const {
    windows,
    runningAppIds,
    activeWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
    closeWindow,
  } = useWindowManager()

  const [activeTab, setActiveTab] = useState<SystemMonitorTab>('overview')
  const [isPaused, setIsPaused] = useState(false)

  // Live telemetry state
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>({
    timestamp: Date.now(),
    fps: 60,
    jsHeapUsedMb: null,
    jsHeapTotalMb: null,
    storageUsedMb: null,
    storageQuotaMb: null,
    runningWindows: windows.length,
    activeAppId: activeWindow?.appId || null,
    longTasksCount: 0,
  })

  // Bounded circular history buffer (max 180 points = 3 minutes at 1s intervals)
  const [history, setHistory] = useState<TelemetrySnapshot[]>([])

  // Hardware / Graphics capabilities
  const [gpuInfo, setGpuInfo] = useState<GpuCapabilities>(() => telemetryService.getGpuInfo())
  const [cpuCores] = useState<number>(() => telemetryService.getCpuCores())
  const [deviceMemory] = useState<number | null>(() => telemetryService.getDeviceMemoryEstimate())
  const [connectionInfo, setConnectionInfo] = useState(() => telemetryService.getConnectionInfo())
  const [networkEntries, setNetworkEntries] = useState<NetworkResourceEntry[]>([])

  // Logs stream
  const [logs, setLogs] = useState<SystemLogEntry[]>([
    {
      id: 'log-1',
      timestamp: Date.now() - 60000,
      level: 'info',
      source: 'Kernel',
      message: 'NOVA System Monitor telemetry agent attached to window compositor.',
    },
    {
      id: 'log-2',
      timestamp: Date.now() - 45000,
      level: 'info',
      source: 'WebGL',
      message: 'Hardware accelerated WebGL pipeline initialized.',
    },
    {
      id: 'log-3',
      timestamp: Date.now() - 30000,
      level: 'debug',
      source: 'Storage',
      message: 'StorageManager estimate queried successfully.',
    },
  ])

  // Process item mapping from live WindowManager windows
  const processes: ProcessItem[] = useMemo(() => {
    return windows.map((w) => {
      const regApp = APPS_REGISTRY[w.appId]
      const isFocused = w.isFocused
      const isMinimized = w.isMinimized
      const status: ProcessItem['status'] = isFocused
        ? 'focused'
        : isMinimized
        ? 'minimized'
        : 'active'

      return {
        id: w.id,
        appId: w.appId,
        name: regApp ? regApp.title : w.title || w.appId,
        category: regApp ? regApp.category : 'System',
        status,
        windowCount: 1,
        startTime: (w.initialArgs?.launchTime as number) || Date.now() - 15000,
        lastActive: Date.now(),
        estimatedMemoryMb: Math.round(18 + (w.appId.startsWith('game_') ? 35 : 8)),
        accentColor: regApp?.accentColor || '#3b82f6',
      }
    })
  }, [windows])

  // Sample telemetry interval
  useEffect(() => {
    if (isPaused) return

    let isMounted = true
    const interval = setInterval(async () => {
      const fps = telemetryService.getFps()
      const heap = telemetryService.getJsHeap()
      const storage = await telemetryService.getStorageEstimate()
      const longTasks = telemetryService.getLongTasksCount()
      const net = telemetryService.getNetworkEntries(30)
      const conn = telemetryService.getConnectionInfo()

      if (!isMounted) return

      setNetworkEntries(net)
      setConnectionInfo(conn)

      const snap: TelemetrySnapshot = {
        timestamp: Date.now(),
        fps,
        jsHeapUsedMb: heap.usedMb,
        jsHeapTotalMb: heap.totalMb,
        storageUsedMb: storage.usedMb,
        storageQuotaMb: storage.quotaMb,
        runningWindows: windows.length,
        activeAppId: activeWindow?.appId || null,
        longTasksCount: longTasks,
      }

      setTelemetry(snap)
      setHistory((prev) => {
        const next = [...prev, snap]
        return next.length > 180 ? next.slice(-180) : next
      })

      // Add log when windows change
      if (windows.length > 0 && Math.random() < 0.15) {
        setLogs((prev) => [
          ...prev.slice(-99),
          {
            id: `log-${Date.now()}`,
            timestamp: Date.now(),
            level: 'info',
            source: 'Compositor',
            message: `Sampled FPS: ${fps} | Windows: ${windows.length} | JS Heap: ${heap.usedMb || 0}MB`,
          },
        ])
      }
    }, 1000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [isPaused, windows.length, activeWindow?.appId])

  return (
    <div className="flex h-full bg-[#11121a]/95 text-neutral-200 font-sans select-none overflow-hidden backdrop-blur-2xl">
      {/* Ubuntu-inspired Navigation Sidebar */}
      <div className="w-56 bg-black/40 border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide">NOVA MONITOR</h2>
              <span className="text-[10px] text-neutral-400 font-mono">System & Processes</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundService.playClick()
                    setActiveTab(item.id)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer Quick Telemetry Badge */}
        <div className="p-3 border-t border-white/10 bg-black/20 m-2 rounded-xl">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-neutral-400 font-medium">Renderer FPS</span>
            <span className="text-emerald-400 font-mono font-bold">{telemetry.fps}</span>
          </div>
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, (telemetry.fps / 60) * 100)}%` }}
              className={`h-full ${telemetry.fps >= 50 ? 'bg-emerald-400' : 'bg-amber-400'}`}
            />
          </div>
        </div>
      </div>

      {/* Main Tab Content Display Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
        {activeTab === 'overview' && (
          <OverviewTab
            currentTelemetry={telemetry}
            history={history}
            gpuInfo={gpuInfo}
            cpuCores={cpuCores}
            deviceMemory={deviceMemory}
            activeAppsCount={runningAppIds.length}
            openWindowsCount={windows.length}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'processes' && (
          <ProcessesTab
            processes={processes}
            onFocusWindow={focusWindow}
            onMinimizeWindow={minimizeWindow}
            onRestoreWindow={restoreWindow}
            onCloseWindow={closeWindow}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceTab
            history={history}
            isPaused={isPaused}
            onTogglePause={() => {
              soundService.playClick()
              setIsPaused(!isPaused)
            }}
            onClearHistory={() => setHistory([])}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryTab currentTelemetry={telemetry} deviceMemory={deviceMemory} />
        )}

        {activeTab === 'storage' && (
          <StorageTab storageUsedMb={telemetry.storageUsedMb} storageQuotaMb={telemetry.storageQuotaMb} />
        )}

        {activeTab === 'network' && (
          <NetworkTab networkEntries={networkEntries} connectionInfo={connectionInfo} />
        )}

        {activeTab === 'applications' && (
          <ApplicationsTab runningAppIds={runningAppIds} openWindowsCount={windows.length} />
        )}

        {activeTab === 'gpu' && <GpuTab gpuInfo={gpuInfo} runningAppIds={runningAppIds} />}

        {activeTab === 'startup' && <StartupAppsTab />}

        {activeTab === 'logs' && (
          <SystemLogsTab logs={logs} onClearLogs={() => setLogs([])} />
        )}
      </div>
    </div>
  )
}
