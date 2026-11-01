import React, { useState } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  FileSpreadsheet,
  Activity,
  Cpu,
  Layers,
  Clock,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import type { TelemetrySnapshot } from '../types'

interface PerformanceTabProps {
  history: TelemetrySnapshot[]
  isPaused: boolean
  onTogglePause: () => void
  onClearHistory: () => void
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({
  history,
  isPaused,
  onTogglePause,
  onClearHistory,
}) => {
  const [timeRange, setTimeRange] = useState<'30s' | '1m' | '5m' | '15m'>('1m')

  // Slice history based on selected time range (assuming ~1s samples)
  const rangePoints = timeRange === '30s' ? 30 : timeRange === '1m' ? 60 : timeRange === '5m' ? 120 : 180
  const displayHistory = history.slice(-rangePoints)

  // Export JSON
  const exportJson = () => {
    soundService.playClick()
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `nova_performance_${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Export CSV
  const exportCsv = () => {
    soundService.playClick()
    const headers = ['Timestamp', 'FPS', 'JSHeapUsedMb', 'JSHeapTotalMb', 'StorageUsedMb', 'RunningWindows', 'LongTasks']
    const rows = history.map((h) => [
      new Date(h.timestamp).toISOString(),
      h.fps,
      h.jsHeapUsedMb ?? '',
      h.jsHeapTotalMb ?? '',
      h.storageUsedMb ?? '',
      h.runningWindows,
      h.longTasksCount,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', encodeURI(csvContent))
    downloadAnchor.setAttribute('download', `nova_performance_${Date.now()}.csv`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const latestFps = displayHistory[displayHistory.length - 1]?.fps || 60
  const latestHeap = displayHistory[displayHistory.length - 1]?.jsHeapUsedMb || 0
  const latestWindows = displayHistory[displayHistory.length - 1]?.runningWindows || 0
  const latestLongTasks = displayHistory[displayHistory.length - 1]?.longTasksCount || 0

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/10">
        {/* Time Range Selectors */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl">
          {(['30s', '1m', '5m', '15m'] as const).map((range) => (
            <button
              key={range}
              onClick={() => {
                soundService.playClick()
                setTimeRange(range)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                timeRange === range
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePause}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              isPaused
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'Resume Stream' : 'Pause Stream'}
          </button>

          <button
            onClick={() => {
              soundService.playClick()
              onClearHistory()
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Buffer
          </button>

          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-cyan-300 hover:bg-white/10 text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-emerald-300 hover:bg-white/10 text-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Graph 1: Frame Rate (FPS) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Frame Rate (FPS)
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400">{latestFps} FPS</span>
        </div>

        <div className="h-28 flex items-end gap-1 bg-black/30 p-2 rounded-xl border border-white/5">
          {displayHistory.map((pt, idx) => (
            <div
              key={idx}
              style={{ height: `${Math.min(100, (pt.fps / 60) * 100)}%` }}
              className={`flex-1 rounded-t transition-all duration-300 ${
                pt.fps >= 50 ? 'bg-emerald-500' : pt.fps >= 30 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              title={`${pt.fps} FPS at ${new Date(pt.timestamp).toLocaleTimeString()}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1.5 px-1">
          <span>-{timeRange}</span>
          <span>Target: 60 FPS</span>
          <span>Now</span>
        </div>
      </div>

      {/* Graph 2: JavaScript Heap Memory */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" /> JavaScript Heap Memory Allocation
          </span>
          <span className="text-xs font-mono font-bold text-blue-400">
            {latestHeap ? `${latestHeap} MB` : 'Sandboxed'}
          </span>
        </div>

        <div className="h-28 flex items-end gap-1 bg-black/30 p-2 rounded-xl border border-white/5">
          {displayHistory.map((pt, idx) => {
            const val = pt.jsHeapUsedMb || 0
            const maxVal = pt.jsHeapTotalMb || 100
            const heightPercent = maxVal > 0 ? (val / maxVal) * 100 : 30
            return (
              <div
                key={idx}
                style={{ height: `${Math.max(4, Math.min(100, heightPercent))}%` }}
                className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t transition-all duration-300"
                title={`${val} MB / ${maxVal} MB`}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1.5 px-1">
          <span>-{timeRange}</span>
          <span>Bounded Ring Buffer</span>
          <span>Now</span>
        </div>
      </div>

      {/* Graph 3: Multitasking & Long Tasks Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Open Windows Count */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Active Windows Stream
            </span>
            <span className="text-xs font-mono font-bold text-purple-400">{latestWindows} Windows</span>
          </div>

          <div className="h-20 flex items-end gap-1 bg-black/30 p-2 rounded-xl border border-white/5">
            {displayHistory.map((pt, idx) => (
              <div
                key={idx}
                style={{ height: `${Math.min(100, (pt.runningWindows / 12) * 100)}%` }}
                className="flex-1 bg-purple-500/80 rounded-t transition-all duration-300"
              />
            ))}
          </div>
        </div>

        {/* Long Tasks Count */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Main-Thread Long Tasks (50ms+)
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">{latestLongTasks} Total</span>
          </div>

          <div className="h-20 flex items-end gap-1 bg-black/30 p-2 rounded-xl border border-white/5">
            {displayHistory.map((pt, idx) => (
              <div
                key={idx}
                style={{ height: `${Math.min(100, (pt.longTasksCount / 20) * 100)}%` }}
                className="flex-1 bg-amber-500/80 rounded-t transition-all duration-300"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
