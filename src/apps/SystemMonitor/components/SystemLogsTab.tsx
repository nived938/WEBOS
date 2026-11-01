import React, { useState, useMemo } from 'react'
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import type { SystemLogEntry } from '../types'

interface SystemLogsTabProps {
  logs: SystemLogEntry[]
  onClearLogs: () => void
}

export const SystemLogsTab: React.FC<SystemLogsTabProps> = ({ logs, onClearLogs }) => {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all')

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (levelFilter !== 'all' && log.level !== levelFilter) return false
      if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !log.source.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      return true
    })
  }, [logs, search, levelFilter])

  const exportLogs = () => {
    soundService.playClick()
    const content = filteredLogs
      .map((l) => `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.level.toUpperCase()}] [${l.source}]: ${l.message}`)
      .join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nova_system_logs_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-5 space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search system event logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
            {(['all', 'info', 'warn', 'error', 'debug'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  soundService.playClick()
                  setLevelFilter(lvl)
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase font-mono transition-colors ${
                  levelFilter === lvl ? 'bg-cyan-500 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={exportLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>

          <button
            onClick={() => {
              soundService.playClick()
              onClearLogs()
            }}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Output Console */}
      <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 overflow-y-auto font-mono text-xs space-y-1.5">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-neutral-500">
            No system log records found matching the active filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString()
            const isWarn = log.level === 'warn'
            const isError = log.level === 'error'
            const isDebug = log.level === 'debug'

            return (
              <div
                key={log.id}
                className={`flex items-start gap-2.5 px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors ${
                  isError
                    ? 'text-rose-400 bg-rose-500/10'
                    : isWarn
                    ? 'text-amber-300 bg-amber-500/10'
                    : isDebug
                    ? 'text-neutral-500'
                    : 'text-neutral-300'
                }`}
              >
                {isError ? (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                ) : isWarn ? (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                ) : isDebug ? (
                  <Bug className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                )}

                <span className="text-neutral-500 shrink-0 select-none">[{timeStr}]</span>
                <span className="font-semibold text-neutral-400 shrink-0">[{log.source}]</span>
                <span className="break-all">{log.message}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
