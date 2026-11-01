import type { SyncConfig, SyncPayload, SyncResult, SyncStatus } from './syncTypes'

const SYNC_CONFIG_KEY = 'nova_cloud_sync_config_v1'

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  enabled: false,
  provider: 'mock-cloud',
  conflictPolicy: 'local-wins',
  autoSyncIntervalMinutes: 15,
}

class SyncManager {
  private config: SyncConfig = DEFAULT_SYNC_CONFIG
  private status: SyncStatus = 'idle'
  private listeners: Set<(status: SyncStatus) => void> = new Set()

  constructor() {
    this.loadConfig()
  }

  private loadConfig() {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(SYNC_CONFIG_KEY)
      if (saved) {
        this.config = { ...DEFAULT_SYNC_CONFIG, ...JSON.parse(saved) }
      }
    } catch {
      this.config = DEFAULT_SYNC_CONFIG
    }
  }

  public saveConfig(updates: Partial<SyncConfig>) {
    this.config = { ...this.config, ...updates }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(this.config))
      } catch {
        // Ignored
      }
    }
  }

  public getConfig(): SyncConfig {
    return { ...this.config }
  }

  public getStatus(): SyncStatus {
    return this.status
  }

  public subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private setStatus(newStatus: SyncStatus) {
    this.status = newStatus
    this.listeners.forEach((l) => l(newStatus))
  }

  public async syncNow(localPayload: SyncPayload): Promise<SyncResult> {
    if (!this.config.enabled) {
      return { success: false, syncedAt: Date.now(), itemsUpdated: 0, error: 'Sync is disabled' }
    }

    this.setStatus('syncing')

    try {
      // Simulate remote sync endpoint network handshake
      await new Promise((resolve) => setTimeout(resolve, 300))

      this.saveConfig({ lastSyncTime: Date.now() })
      this.setStatus('success')
      return {
        success: true,
        syncedAt: Date.now(),
        itemsUpdated: 1,
      }
    } catch (err: unknown) {
      this.setStatus('error')
      return {
        success: false,
        syncedAt: Date.now(),
        itemsUpdated: 0,
        error: err instanceof Error ? err.message : 'Unknown sync failure',
      }
    } finally {
      setTimeout(() => {
        if (this.status !== 'syncing') {
          this.setStatus('idle')
        }
      }, 2000)
    }
  }

  public resolveConflict(
    localTimestamp: number,
    remoteTimestamp: number,
    policy: SyncConfig['conflictPolicy']
  ): 'local' | 'remote' {
    if (policy === 'local-wins') return 'local'
    if (policy === 'remote-wins') return 'remote'
    return localTimestamp >= remoteTimestamp ? 'local' : 'remote'
  }
}

export const syncManager = new SyncManager()
