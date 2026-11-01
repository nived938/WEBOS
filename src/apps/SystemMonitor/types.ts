import type { AppId } from '@/types'

export type SystemMonitorTab =
  | 'overview'
  | 'processes'
  | 'performance'
  | 'memory'
  | 'storage'
  | 'network'
  | 'applications'
  | 'gpu'
  | 'startup'
  | 'logs'

export interface ProcessItem {
  id: string
  appId: AppId
  name: string
  category: string
  status: 'active' | 'focused' | 'minimized' | 'background'
  windowCount: number
  startTime: number
  lastActive: number
  estimatedMemoryMb: number
  iconName?: string
  accentColor?: string
}

export interface TelemetrySnapshot {
  timestamp: number
  fps: number
  jsHeapUsedMb: number | null
  jsHeapTotalMb: number | null
  storageUsedMb: number | null
  storageQuotaMb: number | null
  runningWindows: number
  activeAppId: string | null
  longTasksCount: number
}

export interface NetworkResourceEntry {
  id: string
  name: string
  initiatorType: string
  durationMs: number
  transferSizeKb: number
  startTime: number
  isSuccess: boolean
}

export interface GpuCapabilities {
  webglVersion: string
  vendor: string
  renderer: string
  unmaskedRenderer: string
  maxTextureSize: number
  maxViewportDims: [number, number]
  supportedExtensionsCount: number
  extensions: string[]
  contextLost: boolean
}

export interface SystemLogEntry {
  id: string
  timestamp: number
  level: 'info' | 'warn' | 'error' | 'debug'
  source: string
  message: string
}
