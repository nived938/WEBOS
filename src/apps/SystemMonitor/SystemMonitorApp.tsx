import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Cpu, HardDrive, Activity, XOctagon, Zap } from 'lucide-react'

interface ProcessItem {
  pid: number
  name: string
  cpu: number
  memoryMb: number
  status: 'running' | 'sleeping'
}

const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 101, name: 'Compositor Engine (LiquidGlass)', cpu: 4.8, memoryMb: 142, status: 'running' },
  { pid: 102, name: 'Window Manager (Workspaces)', cpu: 1.2, memoryMb: 68, status: 'running' },
  { pid: 104, name: 'Finder VFS Storage Agent', cpu: 0.5, memoryMb: 45, status: 'sleeping' },
  { pid: 108, name: 'Audio Sound Service', cpu: 0.2, memoryMb: 24, status: 'sleeping' },
  { pid: 112, name: 'Spotlight Search Indexer', cpu: 0.8, memoryMb: 36, status: 'running' },
]

export const SystemMonitorApp: React.FC<AppInstanceProps> = () => {
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(24).fill(15))
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES)
  const [ramUsedMb, setRamUsedMb] = useState(315)

  useEffect(() => {
    const interval = setInterval(() => {
      const nextCpu = Math.floor(Math.random() * 25) + 10
      setCpuHistory((prev) => [...prev.slice(1), nextCpu])

      // Random jitter on process cpu
      setProcesses((prev) =>
        prev.map((p) => ({
          ...p,
          cpu: Number((p.cpu + (Math.random() * 0.6 - 0.3)).toFixed(1)),
        }))
      )
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  const killProcess = (pid: number) => {
    soundService.play('buttonClick')
    setProcesses((prev) => prev.filter((p) => p.pid !== pid))
  }

  const currentCpu = cpuHistory[cpuHistory.length - 1]

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-emerald-400" />
          <span className="font-semibold text-white text-xs">NOVA System & Process Monitor</span>
        </div>
        <span className="text-[10px] text-neutral-400 font-mono">Kernel 2.5.0-browser</span>
      </div>

      {/* Top Cards: CPU & RAM */}
      <div className="p-4 grid grid-cols-2 gap-4 border-b border-white/10 bg-black/20">
        {/* CPU Box */}
        <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Cpu size={14} className="text-blue-400" /> CPU Load
            </span>
            <span className="text-xs font-mono font-bold text-blue-400">{currentCpu}%</span>
          </div>

          <div className="h-14 flex items-end gap-1">
            {cpuHistory.map((val, idx) => (
              <div
                key={idx}
                style={{ height: `${val}%` }}
                className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t transition-all duration-300"
              />
            ))}
          </div>
        </div>

        {/* RAM Box */}
        <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <HardDrive size={14} className="text-purple-400" /> RAM Memory
            </span>
            <span className="text-xs font-mono font-bold text-purple-400">
              {(ramUsedMb / 1024).toFixed(2)} GB / 8.00 GB
            </span>
          </div>

          <div>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-1">
              <div
                style={{ width: `${(ramUsedMb / 1024 / 8) * 100}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              />
            </div>
            <span className="text-[10px] text-neutral-400">3.9% of virtual heap consumed</span>
          </div>
        </div>
      </div>

      {/* Process Table */}
      <div className="flex-1 overflow-y-auto p-4">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10 text-neutral-400 text-[11px] pb-2">
              <th className="pb-2 font-semibold">PID</th>
              <th className="pb-2 font-semibold">Process Name</th>
              <th className="pb-2 font-semibold">CPU %</th>
              <th className="pb-2 font-semibold">Memory</th>
              <th className="pb-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-neutral-300">
            {processes.map((proc) => (
              <tr key={proc.pid} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5 text-neutral-500">{proc.pid}</td>
                <td className="py-2.5 font-medium text-white">{proc.name}</td>
                <td className="py-2.5 text-blue-400">{proc.cpu}%</td>
                <td className="py-2.5 text-purple-400">{proc.memoryMb} MB</td>
                <td className="py-2.5 text-right">
                  <button
                    onClick={() => killProcess(proc.pid)}
                    className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-colors text-[10px]"
                  >
                    End Task
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
