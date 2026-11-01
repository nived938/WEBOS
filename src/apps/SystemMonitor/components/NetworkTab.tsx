import React, { useState, useMemo } from 'react'
import {
  Wifi,
  WifiOff,
  Search,
  Filter,
  ArrowDownCircle,
  Clock,
  Layers,
  FileCode,
  Image,
  FileText,
  FileSpreadsheet,
  Info,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import type { NetworkResourceEntry } from '../types'

interface NetworkTabProps {
  networkEntries: NetworkResourceEntry[]
  connectionInfo: {
    effectiveType: string
    downlinkMbps: number | null
    rttMs: number | null
  }
}

export const NetworkTab: React.FC<NetworkTabProps> = ({ networkEntries, connectionInfo }) => {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'script' | 'img' | 'css' | 'fetch' | 'other'>('all')

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

  const filteredEntries = useMemo(() => {
    return networkEntries.filter((entry) => {
      const matchesSearch = entry.name.toLowerCase().includes(search.toLowerCase())
      if (!matchesSearch) return false

      if (filterType === 'all') return true
      if (filterType === 'script') return entry.initiatorType === 'script' || entry.name.endsWith('.js') || entry.name.endsWith('.ts')
      if (filterType === 'img') return entry.initiatorType === 'img' || entry.name.endsWith('.png') || entry.name.endsWith('.jpg') || entry.name.endsWith('.svg') || entry.name.endsWith('.webp')
      if (filterType === 'css') return entry.initiatorType === 'css' || entry.name.endsWith('.css')
      if (filterType === 'fetch') return entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest'
      return entry.initiatorType === 'other'
    })
  }, [networkEntries, search, filterType])

  const totalTransferKb = networkEntries.reduce((acc, e) => acc + e.transferSizeKb, 0)

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-5 space-y-4">
      {/* Network Connection Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Connection State */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />}
              Network Status
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-white uppercase">{connectionInfo.effectiveType}</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">navigator.onLine</span>
        </div>

        {/* Downlink Bandwidth Estimate */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4 text-cyan-400" /> Downlink Speed
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-cyan-500/20 text-cyan-300">
              Browser Est.
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-white font-mono">
              {connectionInfo.downlinkMbps ? `${connectionInfo.downlinkMbps} Mbps` : 'Adaptive'}
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">NetworkInformation API</span>
        </div>

        {/* Round Trip Time */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" /> Latency (RTT)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-500/20 text-purple-300">
              Est.
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-white font-mono">
              {connectionInfo.rttMs ? `~${connectionInfo.rttMs} ms` : 'Low Latency'}
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">Estimated network RTT</span>
        </div>

        {/* Total Resources Loaded */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Tracked Assets
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-amber-300">
              {networkEntries.length} Items
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-white font-mono">
              {(totalTransferKb / 1024).toFixed(2)} MB
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">PerformanceResourceTiming</span>
        </div>
      </div>

      {/* Toolbar: Search and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search loaded network requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
          {(['all', 'script', 'img', 'css', 'fetch', 'other'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                soundService.playClick()
                setFilterType(filter)
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase transition-colors ${
                filterType === filter
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Network Resource Table Header */}
      <div className="bg-white/5 border border-white/10 rounded-t-xl grid grid-cols-12 px-4 py-2 text-[11px] font-semibold text-neutral-400 select-none">
        <div className="col-span-6">Resource Name</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Transfer Size</div>
        <div className="col-span-2 text-right">Duration</div>
      </div>

      {/* Network Resource Table Rows */}
      <div className="flex-1 overflow-y-auto border-x border-b border-white/10 rounded-b-xl divide-y divide-white/5 bg-black/20">
        {filteredEntries.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs">
            No network resource timings match your current filter.
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-12 px-4 py-2 items-center hover:bg-white/5 text-xs text-neutral-200 transition-colors group"
            >
              {/* Name */}
              <div className="col-span-6 flex items-center gap-2 truncate pr-2">
                {entry.initiatorType === 'script' ? (
                  <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                ) : entry.initiatorType === 'img' ? (
                  <Image className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : entry.initiatorType === 'css' ? (
                  <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                ) : (
                  <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span className="font-mono text-[11px] truncate">{entry.name}</span>
              </div>

              {/* Initiator Type */}
              <div className="col-span-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-neutral-300">
                  {entry.initiatorType}
                </span>
              </div>

              {/* Transfer Size */}
              <div className="col-span-2 text-neutral-300 font-mono text-[11px]">
                {entry.transferSizeKb > 0 ? `${entry.transferSizeKb} KB` : 'Cached'}
              </div>

              {/* Duration */}
              <div className="col-span-2 text-right text-neutral-400 font-mono text-[11px]">
                {entry.durationMs} ms
              </div>
            </div>
          ))
        )}
      </div>

      {/* Disclaimers & Integrity Note */}
      <div className="text-[11px] text-neutral-500 border-t border-white/10 pt-2 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span>
          Reports actual browser Resource Timing and NetworkInformation API entries. Hardware Wi-Fi signals or router interfaces outside the browser sandbox are omitted.
        </span>
      </div>
    </div>
  )
}
