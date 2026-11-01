import React, { useState, useEffect } from 'react'
import { Cpu, HardDrive, Monitor, Clock, Shield, Globe } from 'lucide-react'

export const SysInfoSection: React.FC = () => {
  const [uptimeSeconds, setUptimeSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatUptime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const screenResolution =
    typeof window !== 'undefined'
      ? `${window.screen?.width || window.innerWidth} × ${window.screen?.height || window.innerHeight}`
      : '1920 × 1080'

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">System Information</h3>
        <p className="text-neutral-400 text-xs">
          Hardware telemetry, virtual processor specs, graphics engine, and kernel uptime.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 divide-y divide-white/5 text-xs">
        <div className="flex justify-between py-2.5 items-center">
          <div className="flex items-center gap-2 text-neutral-400">
            <Cpu size={15} className="text-blue-400" />
            <span>Virtual Processor</span>
          </div>
          <span className="text-white font-medium">Nova Neural Octa-Core (V8 JIT Engine)</span>
        </div>

        <div className="flex justify-between py-2.5 items-center">
          <div className="flex items-center gap-2 text-neutral-400">
            <HardDrive size={15} className="text-purple-400" />
            <span>Memory Architecture</span>
          </div>
          <span className="text-white font-medium">16 GB Unified Virtual RAM</span>
        </div>

        <div className="flex justify-between py-2.5 items-center">
          <div className="flex items-center gap-2 text-neutral-400">
            <Monitor size={15} className="text-cyan-400" />
            <span>Graphics Hardware</span>
          </div>
          <span className="text-white font-medium">WebGL 2.0 Hardware Accelerated</span>
        </div>

        <div className="flex justify-between py-2.5 items-center">
          <div className="flex items-center gap-2 text-neutral-400">
            <Monitor size={15} className="text-emerald-400" />
            <span>Display Resolution</span>
          </div>
          <span className="text-white font-mono">{screenResolution}</span>
        </div>

        <div className="flex justify-between py-2.5 items-center">
          <div className="flex items-center gap-2 text-neutral-400">
            <Clock size={15} className="text-amber-400" />
            <span>Kernel Session Uptime</span>
          </div>
          <span className="text-amber-300 font-mono font-semibold">{formatUptime(uptimeSeconds)}</span>
        </div>

        <div className="flex justify-between py-2.5 items-center">
          <div className="flex items-center gap-2 text-neutral-400">
            <Globe size={15} className="text-rose-400" />
            <span>Host Environment</span>
          </div>
          <span className="text-white font-medium">Web Browser Execution Container</span>
        </div>
      </div>
    </div>
  )
}
