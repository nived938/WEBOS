import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { telemetryService } from '../utils/telemetry'

describe('System Monitor - Telemetry Collector', () => {
  it('returns valid CPU core count from navigator or fallback', () => {
    const cores = telemetryService.getCpuCores()
    expect(typeof cores).toBe('number')
    expect(cores).toBeGreaterThanOrEqual(1)
  })

  it('safely queries GPU info with fallback when WebGL is absent or simulated', () => {
    const gpu = telemetryService.getGpuInfo()
    expect(gpu).toBeDefined()
    expect(gpu.maxTextureSize).toBeGreaterThan(0)
    expect(Array.isArray(gpu.extensions)).toBe(true)
    expect(typeof gpu.webglVersion).toBe('string')
  })

  it('retrieves JS heap information without crashing', () => {
    const heap = telemetryService.getJsHeap()
    expect(heap).toBeDefined()
    expect(heap).toHaveProperty('usedMb')
    expect(heap).toHaveProperty('totalMb')
    expect(heap).toHaveProperty('limitMb')
  })

  it('retrieves storage estimate gracefully', async () => {
    const storage = await telemetryService.getStorageEstimate()
    expect(storage).toBeDefined()
    expect(storage).toHaveProperty('usedMb')
    expect(storage).toHaveProperty('quotaMb')
  })

  it('retrieves network entries list', () => {
    const entries = telemetryService.getNetworkEntries(10)
    expect(Array.isArray(entries)).toBe(true)
  })
})
