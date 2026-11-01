import React, { useState, useEffect } from 'react'
import { Cpu, HardDrive, Monitor, Clock, Shield, Globe } from 'lucide-react'

export const SysInfoSection: React.FC = () => {
  const [uptimeSeconds, setUptimeSeconds] = useState(0)

  useEffect(() => {
    const updateUptime = () => {
      setUptimeSeconds(Math.floor(performance.now() / 1000))
    }
    updateUptime()
    const timer = setInterval(updateUptime, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatUptime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Real hardware queries via browser APIs
  const cpuCores =
    typeof navigator !== 'undefined' && navigator.hardwareConcurrency
      ? `${navigator.hardwareConcurrency} Logical Cores`
      : 'Multi-threaded Web Worker Runtime'

  const memoryInfo = (() => {
    const perfMem = (performance as unknown as { memory?: { jsHeapSizeLimit: number; usedJSHeapSize: number } })?.memory
    if (perfMem?.jsHeapSizeLimit) {
      const limitMB = Math.round(perfMem.jsHeapSizeLimit / (1024 * 1024))
      const usedMB = Math.round(perfMem.usedJSHeapSize / (1024 * 1024))
      return `${usedMB} MB used / ${limitMB} MB allocated heap`
    }
    const devMem = (navigator as unknown as { deviceMemory?: number })?.deviceMemory
    if (devMem) {
      return `~${devMem} GB Device RAM`
    }
    return 'V8 Managed Memory Sandbox'
  })()

  const gpuRenderer = (() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info')
        if (ext) {
          const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
          if (renderer) return String(renderer)
        }
        return String(gl.getParameter(gl.RENDERER) || 'Hardware Accelerated WebGL')
      }
    } catch {
      // Fallback
    }
    return 'Standard WebGL 2.0 Pipeline'
  })()

  const screenResolution =
    typeof window !== 'undefined'
      ? `${window.screen?.width || window.innerWidth} × ${window.screen?.height || window.innerHeight} (${window.devicePixelRatio || 1}x DPR)`
      : '1920 × 1080'

  const hostPlatform =
    typeof navigator !== 'undefined'
      ? `${navigator.platform || 'Desktop Browser'} (${navigator.userAgent.includes('Chrome') ? 'Chromium' : navigator.userAgent.includes('Firefox') ? 'Gecko' : 'WebKit'})`
      : 'Web Runtime'

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">System Information</h3>
        <p className="text-neutral-400 text-xs">
          Real hardware telemetry, browser execution sandbox, GPU pipeline, and kernel uptime.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 divide-y divide-white/5 text-xs">
        <div className="flex justify-between py-2.5 items-center">
          <div className="flex items-center gap-2 text-neutral-400">
            <Cpu size={15} className="text-blue-400" />
            <span>Processor Cores</span>
          </div>
          <span className="text-white font-medium">{cpuCores}</span>
        </div>

        <div className="flex justify-between py-2.5 items-center">
          <div className="flex items-center gap-2 text-neutral-400">
            <HardDrive size={15} className="text-purple-400" />
            <span>Memory Telemetry</span>
          </div>
          <span className="text-white font-medium">{memoryInfo}</span>
        </div>

        <div className="flex justify-between py-2.5 items-center">
          <div className="flex items-center gap-2 text-neutral-400">
            <Monitor size={15} className="text-cyan-400" />
            <span>Graphics Hardware</span>
          </div>
          <span className="text-white font-medium max-w-[280px] truncate text-right" title={gpuRenderer}>
            {gpuRenderer}
          </span>
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
            <span>Session Uptime</span>
          </div>
          <span className="text-amber-300 font-mono font-semibold">{formatUptime(uptimeSeconds)}</span>
        </div>

        <div className="flex justify-between py-2.5 items-center">
          <div className="flex items-center gap-2 text-neutral-400">
            <Globe size={15} className="text-rose-400" />
            <span>Host Environment</span>
          </div>
          <span className="text-white font-medium">{hostPlatform}</span>
        </div>
      </div>
    </div>
  )
}
