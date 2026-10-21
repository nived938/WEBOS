import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Activity, Cpu, HardDrive, Wifi, ShieldCheck, XCircle } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface ProcessItem {
  id: number
  name: string
  cpu: number
  memory: number
  threads: number
}

const INITIAL_PROCESSES: ProcessItem[] = [
  { id: 101, name: 'NOVA WindowManager', cpu: 2.1, memory: 48.2, threads: 4 },
  { id: 102, name: 'Vite Client HMR', cpu: 0.8, memory: 28.4, threads: 2 },
  { id: 103, name: 'Three.js 3D Pipeline', cpu: 4.6, memory: 72.1, threads: 3 },
  { id: 104, name: 'WebAudio Synth Engine', cpu: 1.2, memory: 16.0, threads: 1 },
  { id: 105, name: 'VFS Storage Daemon', cpu: 0.4, memory: 12.8, threads: 2 },
  { id: 106, name: 'Spotlight Indexer', cpu: 0.3, memory: 9.6, threads: 1 },
]

export const SysInfoApp: React.FC<AppInstanceProps> = () => {
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES)
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 18, 14, 22, 19, 25, 20, 16, 24, 18])
  const [memPercent, setMemPercent] = useState<number>(38)

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live CPU fluctuation
      const nextCpu = Math.floor(Math.random() * 25) + 10
      setCpuHistory(prev => [...prev.slice(1), nextCpu])
      setMemPercent(prev => Math.min(85, Math.max(25, prev + (Math.random() * 2 - 1))))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const killProcess = (id: number) => {
    soundService.playClick()
    setProcesses(prev => prev.filter(p => p.id !== id))
  }

  const avgCpu = Math.round(cpuHistory[cpuHistory.length - 1] || 15)

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Header Metrics Summary */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-800/80 border-b border-white/10">
        <div className="flex items-center space-x-3 bg-neutral-950/60 p-2.5 rounded-xl border border-white/5">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">CPU Usage</div>
            <div className="text-lg font-bold font-mono text-white">{avgCpu}% <span className="text-[10px] text-emerald-400 font-normal">Normal</span></div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-neutral-950/60 p-2.5 rounded-xl border border-white/5">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Memory Heap</div>
            <div className="text-lg font-bold font-mono text-white">{Math.round(memPercent)}% <span className="text-[10px] text-neutral-400 font-normal">of 8 GB</span></div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-neutral-950/60 p-2.5 rounded-xl border border-white/5">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Kernel Health</div>
            <div className="text-lg font-bold font-mono text-emerald-400">Optimal <span className="text-[10px] text-neutral-400 font-normal">60 FPS</span></div>
          </div>
        </div>
      </div>

      {/* Real-time CPU Sparkline Chart */}
      <div className="p-4 bg-neutral-950/40 border-b border-white/5 flex items-center justify-between">
        <div className="text-xs font-semibold text-neutral-300">Live Load History (10s window)</div>
        <div className="flex items-end space-x-1.5 h-12">
          {cpuHistory.map((val, i) => (
            <div
              key={i}
              style={{ height: `${val * 1.5}px` }}
              className="w-3 bg-blue-500/60 hover:bg-blue-400 rounded-t-sm transition-all duration-300"
              title={`${val}%`}
            />
          ))}
        </div>
      </div>

      {/* Running Processes Table */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Active Processes ({processes.length})
        </div>

        <div className="bg-neutral-950/70 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
          <div className="grid grid-cols-12 px-3 py-2 text-[10px] font-semibold uppercase text-neutral-400 bg-white/5">
            <span className="col-span-5">Process Name</span>
            <span className="col-span-2 text-right">PID</span>
            <span className="col-span-2 text-right">CPU %</span>
            <span className="col-span-2 text-right">RAM (MB)</span>
            <span className="col-span-1 text-right">Action</span>
          </div>

          {processes.map(proc => (
            <div key={proc.id} className="grid grid-cols-12 items-center px-3 py-2 text-xs hover:bg-white/5 transition-colors">
              <span className="col-span-5 font-medium text-white truncate">{proc.name}</span>
              <span className="col-span-2 text-right font-mono text-neutral-400">{proc.id}</span>
              <span className="col-span-2 text-right font-mono text-blue-400">{proc.cpu}%</span>
              <span className="col-span-2 text-right font-mono text-purple-400">{proc.memory.toFixed(1)}</span>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => killProcess(proc.id)}
                  className="text-neutral-500 hover:text-red-400 p-0.5"
                  title="Kill process"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
