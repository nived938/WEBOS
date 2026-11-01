import type { GpuCapabilities, NetworkResourceEntry, TelemetrySnapshot } from '../types'

// Memory info interface for Chromium performance.memory
interface ExtendedPerformance extends Performance {
  memory?: {
    jsHeapSizeLimit: number
    totalJSHeapSize: number
    usedJSHeapSize: number
  }
}

class TelemetryCollector {
  private lastFrameTime = performance.now()
  private frameCount = 0
  private currentFps = 60
  private longTasksCount = 0
  private observer: PerformanceObserver | null = null
  private animationFrameId: number | null = null

  constructor() {
    this.initFpsLoop()
    this.initLongTaskObserver()
  }

  private initFpsLoop() {
    if (typeof window === 'undefined') return

    const loop = (time: number) => {
      this.frameCount++
      const delta = time - this.lastFrameTime
      if (delta >= 1000) {
        this.currentFps = Math.round((this.frameCount * 1000) / delta)
        this.frameCount = 0
        this.lastFrameTime = time
      }
      this.animationFrameId = requestAnimationFrame(loop)
    }

    this.animationFrameId = requestAnimationFrame(loop)
  }

  private initLongTaskObserver() {
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return

    try {
      if (PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
        this.observer = new PerformanceObserver((list) => {
          this.longTasksCount += list.getEntries().length
        })
        this.observer.observe({ entryTypes: ['longtask'] })
      }
    } catch {
      // Longtask observer not supported or permission denied
    }
  }

  public getFps(): number {
    return this.currentFps
  }

  public getLongTasksCount(): number {
    return this.longTasksCount
  }

  public getJsHeap(): { usedMb: number | null; totalMb: number | null; limitMb: number | null } {
    if (typeof performance === 'undefined') {
      return { usedMb: null, totalMb: null, limitMb: null }
    }
    const perf = performance as ExtendedPerformance
    if (perf.memory) {
      return {
        usedMb: Math.round((perf.memory.usedJSHeapSize / 1024 / 1024) * 10) / 10,
        totalMb: Math.round((perf.memory.totalJSHeapSize / 1024 / 1024) * 10) / 10,
        limitMb: Math.round((perf.memory.jsHeapSizeLimit / 1024 / 1024) * 10) / 10,
      }
    }
    return { usedMb: null, totalMb: null, limitMb: null }
  }

  public async getStorageEstimate(): Promise<{ usedMb: number | null; quotaMb: number | null }> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate()
        return {
          usedMb: est.usage ? Math.round((est.usage / 1024 / 1024) * 10) / 10 : 0,
          quotaMb: est.quota ? Math.round((est.quota / 1024 / 1024) * 10) / 10 : 0,
        }
      } catch {
        return { usedMb: null, quotaMb: null }
      }
    }
    return { usedMb: null, quotaMb: null }
  }

  public getCpuCores(): number {
    return typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4
  }

  public getDeviceMemoryEstimate(): number | null {
    if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
      return (navigator as { deviceMemory?: number }).deviceMemory ?? null
    }
    return null
  }

  public getConnectionInfo(): {
    effectiveType: string
    downlinkMbps: number | null
    rttMs: number | null
  } {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as {
        connection?: { effectiveType?: string; downlink?: number; rtt?: number }
      }).connection
      if (conn) {
        return {
          effectiveType: conn.effectiveType || 'unknown',
          downlinkMbps: conn.downlink || null,
          rttMs: conn.rtt || null,
        }
      }
    }
    return { effectiveType: 'unknown', downlinkMbps: null, rttMs: null }
  }

  public getGpuInfo(): GpuCapabilities {
    const fallback: GpuCapabilities = {
      webglVersion: 'Not Available',
      vendor: 'Generic WebGL',
      renderer: 'Software Compositor',
      unmaskedRenderer: 'Hardware Accelerated Browser Canvas',
      maxTextureSize: 4096,
      maxViewportDims: [4096, 4096],
      supportedExtensionsCount: 0,
      extensions: [],
      contextLost: false,
    }

    if (typeof document === 'undefined') return fallback

    try {
      const canvas = document.createElement('canvas')
      const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null
      if (!gl) return fallback

      const isWebgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096
      const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) || [4096, 4096]
      const extensions = gl.getSupportedExtensions() || []

      // Clean up WebGL context safely
      const loseContext = gl.getExtension('WEBGL_lose_context')
      if (loseContext) loseContext.loseContext()

      return {
        webglVersion: isWebgl2 ? 'WebGL 2.0 (OpenGL ES 3.0)' : 'WebGL 1.0 (OpenGL ES 2.0)',
        vendor: String(vendor || 'Standard GPU Vendor'),
        renderer: String(renderer || 'Standard WebGL Engine'),
        unmaskedRenderer: String(renderer || 'Hardware Accelerated Display Pipeline'),
        maxTextureSize: Number(maxTextureSize),
        maxViewportDims: [maxViewportDims[0] || 4096, maxViewportDims[1] || 4096],
        supportedExtensionsCount: extensions.length,
        extensions,
        contextLost: gl.isContextLost ? gl.isContextLost() : false,
      }
    } catch {
      return fallback
    }
  }

  public getNetworkEntries(max = 50): NetworkResourceEntry[] {
    if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
      return []
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    return resources
      .slice(-max)
      .reverse()
      .map((r, i) => ({
        id: `res-${r.startTime}-${i}`,
        name: r.name.split('/').pop()?.split('?')[0] || r.name,
        initiatorType: r.initiatorType || 'other',
        durationMs: Math.round(r.duration * 10) / 10,
        transferSizeKb: r.transferSize ? Math.round((r.transferSize / 1024) * 10) / 10 : 0,
        startTime: Math.round(r.startTime),
        isSuccess: r.duration > 0,
      }))
  }

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

export const telemetryService = new TelemetryCollector()
