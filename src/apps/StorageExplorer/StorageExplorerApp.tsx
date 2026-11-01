import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { HardDrive, Trash2, PieChart, FileText, Image, Video, Music } from 'lucide-react'

interface StorageCategory {
  name: string
  sizeMb: number
  color: string
}

const CATEGORIES: StorageCategory[] = [
  { name: 'System Core & Kernels', sizeMb: 124, color: 'bg-blue-500' },
  { name: 'Installed Packages', sizeMb: 280, color: 'bg-purple-500' },
  { name: 'User Documents & Files', sizeMb: 95, color: 'bg-emerald-500' },
  { name: 'Media & Wallpapers', sizeMb: 160, color: 'bg-amber-500' },
  { name: 'IndexedDB Cache', sizeMb: 45, color: 'bg-rose-500' },
]

export const StorageExplorerApp: React.FC<AppInstanceProps> = () => {
  const [categories, setCategories] = useState<StorageCategory[]>(CATEGORIES)
  const totalUsedMb = categories.reduce((acc, c) => acc + c.sizeMb, 0)
  const totalCapacityMb = 2048 // 2GB virtual allotment

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive size={16} className="text-purple-400" />
          <span className="font-semibold text-white text-xs">VFS Storage Analyzer & Treemap</span>
        </div>
        <span className="text-xs text-neutral-400 font-mono">
          {totalUsedMb} MB used of {totalCapacityMb} MB
        </span>
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="p-6 border-b border-white/10 bg-black/20">
        <div className="w-full h-5 rounded-full overflow-hidden flex bg-white/10 p-0.5">
          {categories.map((c) => {
            const widthPct = (c.sizeMb / totalCapacityMb) * 100
            return (
              <div
                key={c.name}
                style={{ width: `${widthPct}%` }}
                className={`${c.color} h-full first:rounded-l-full last:rounded-r-full transition-all`}
                title={`${c.name}: ${c.sizeMb} MB`}
              />
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {categories.map((c) => (
            <div key={c.name} className="flex items-center gap-1.5 text-xs">
              <span className={`w-3 h-3 rounded-full ${c.color}`} />
              <span className="text-neutral-300">{c.name}</span>
              <span className="text-neutral-500 font-mono font-bold">({c.sizeMb} MB)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Breakdown Details */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          Storage Allocations
        </h3>
        {categories.map((c) => (
          <div
            key={c.name}
            className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${c.color}`} />
              <span className="text-xs font-semibold text-white">{c.name}</span>
            </div>
            <span className="font-mono text-xs text-neutral-300 font-bold">{c.sizeMb} MB</span>
          </div>
        ))}
      </div>
    </div>
  )
}
