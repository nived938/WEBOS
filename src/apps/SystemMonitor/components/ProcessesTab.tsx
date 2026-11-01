import React, { useState, useMemo } from 'react'
import {
  Search,
  ArrowUpDown,
  XCircle,
  Eye,
  Minimize2,
  Maximize2,
  Layers,
  Clock,
  HardDrive,
  Info,
  CheckCircle2,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import type { ProcessItem } from '../types'

interface ProcessesTabProps {
  processes: ProcessItem[]
  onFocusWindow: (windowId: string) => void
  onMinimizeWindow: (windowId: string) => void
  onRestoreWindow: (windowId: string) => void
  onCloseWindow: (windowId: string) => void
}

export const ProcessesTab: React.FC<ProcessesTabProps> = ({
  processes,
  onFocusWindow,
  onMinimizeWindow,
  onRestoreWindow,
  onCloseWindow,
}) => {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'windowCount' | 'duration' | 'memory'>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [selectedProcess, setSelectedProcess] = useState<ProcessItem | null>(null)

  const filteredProcesses = useMemo(() => {
    return processes
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.appId.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        let valA: string | number = a.name
        let valB: string | number = b.name

        if (sortBy === 'status') {
          valA = a.status
          valB = b.status
        } else if (sortBy === 'windowCount') {
          valA = a.windowCount
          valB = b.windowCount
        } else if (sortBy === 'duration') {
          valA = a.startTime
          valB = b.startTime
        } else if (sortBy === 'memory') {
          valA = a.estimatedMemoryMb
          valB = b.estimatedMemoryMb
        }

        if (valA < valB) return sortAsc ? -1 : 1
        if (valA > valB) return sortAsc ? 1 : -1
        return 0
      })
  }, [processes, search, sortBy, sortAsc])

  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(column)
      setSortAsc(true)
    }
  }

  const formatDuration = (startTime: number) => {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000))
    const mins = Math.floor(elapsedSeconds / 60)
    const secs = elapsedSeconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-5">
      {/* Top Search & Toolbar */}
      <div className="flex items-center justify-between pb-4 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search active processes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div className="text-xs text-neutral-400 font-mono">
          {filteredProcesses.length} Virtual OS Process{filteredProcesses.length === 1 ? '' : 'es'}
        </div>
      </div>

      {/* Process Table Header */}
      <div className="bg-white/5 border border-white/10 rounded-t-xl grid grid-cols-12 px-4 py-2 text-[11px] font-semibold text-neutral-400 select-none">
        <div
          className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-white"
          onClick={() => toggleSort('name')}
        >
          <span>Application Name</span>
          <ArrowUpDown className="w-3 h-3" />
        </div>
        <div
          className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-white"
          onClick={() => toggleSort('status')}
        >
          <span>Status</span>
          <ArrowUpDown className="w-3 h-3" />
        </div>
        <div
          className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-white"
          onClick={() => toggleSort('duration')}
        >
          <span>Uptime</span>
          <ArrowUpDown className="w-3 h-3" />
        </div>
        <div
          className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-white"
          onClick={() => toggleSort('memory')}
        >
          <span>Est. Memory</span>
          <ArrowUpDown className="w-3 h-3" />
        </div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Process Table Rows */}
      <div className="flex-1 overflow-y-auto border-x border-b border-white/10 rounded-b-xl divide-y divide-white/5 bg-black/20">
        {filteredProcesses.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs">
            No running virtual applications match your query.
          </div>
        ) : (
          filteredProcesses.map((proc) => (
            <div
              key={proc.id}
              className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-white/5 text-xs text-neutral-200 transition-colors group"
            >
              {/* Name & ID */}
              <div className="col-span-4 flex items-center gap-2.5 min-w-0 pr-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-[10px]"
                  style={{ backgroundColor: proc.accentColor || '#3b82f6' }}
                >
                  {proc.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <span className="font-medium text-white block truncate">{proc.name}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">id: {proc.appId}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="col-span-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    proc.status === 'focused'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : proc.status === 'minimized'
                      ? 'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      proc.status === 'focused'
                        ? 'bg-emerald-400 animate-pulse'
                        : proc.status === 'minimized'
                        ? 'bg-neutral-400'
                        : 'bg-blue-400'
                    }`}
                  />
                  {proc.status}
                </span>
              </div>

              {/* Uptime */}
              <div className="col-span-2 text-neutral-400 font-mono text-[11px]">
                {formatDuration(proc.startTime)}
              </div>

              {/* Memory Estimate */}
              <div className="col-span-2 text-neutral-300 font-mono text-[11px]">
                ~{proc.estimatedMemoryMb} MB
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-1.5">
                <button
                  title="Focus Application"
                  onClick={() => {
                    soundService.playClick()
                    onFocusWindow(proc.id)
                  }}
                  className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-cyan-300 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {proc.status === 'minimized' ? (
                  <button
                    title="Restore Window"
                    onClick={() => {
                      soundService.playClick()
                      onRestoreWindow(proc.id)
                    }}
                    className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-emerald-300 transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    title="Minimize Window"
                    onClick={() => {
                      soundService.playClick()
                      onMinimizeWindow(proc.id)
                    }}
                    className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-amber-300 transition-colors"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  title="Process Details"
                  onClick={() => setSelectedProcess(proc)}
                  className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-purple-300 transition-colors"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                <button
                  title="Close Virtual Application"
                  onClick={() => {
                    soundService.play('buttonClick')
                    onCloseWindow(proc.id)
                  }}
                  className="p-1 rounded hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Process Details Modal */}
      {selectedProcess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1d29] border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: selectedProcess.accentColor || '#3b82f6' }}
                >
                  {selectedProcess.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedProcess.name}</h3>
                  <span className="text-[11px] text-neutral-400 font-mono">AppId: {selectedProcess.appId}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProcess(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Virtual Window ID:</span>
                <span className="text-neutral-200 font-mono">{selectedProcess.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Category:</span>
                <span className="text-neutral-200">{selectedProcess.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Execution State:</span>
                <span className="text-emerald-400 font-medium capitalize">{selectedProcess.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Active Duration:</span>
                <span className="text-neutral-200 font-mono">{formatDuration(selectedProcess.startTime)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Memory Weight Estimate:</span>
                <span className="text-neutral-200 font-mono">~{selectedProcess.estimatedMemoryMb} MB</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  onCloseWindow(selectedProcess.id)
                  setSelectedProcess(null)
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs transition-colors"
              >
                Close Application
              </button>
              <button
                onClick={() => setSelectedProcess(null)}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 text-xs transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
