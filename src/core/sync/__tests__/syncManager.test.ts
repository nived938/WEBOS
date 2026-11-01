import { describe, it, expect, beforeEach } from 'vitest'
import { syncManager, DEFAULT_SYNC_CONFIG } from '../syncManager'

describe('SyncManager Cloud Sync', () => {
  beforeEach(() => {
    syncManager.saveConfig(DEFAULT_SYNC_CONFIG)
  })

  it('should initialize with default config disabled', () => {
    const config = syncManager.getConfig()
    expect(config.enabled).toBe(false)
    expect(config.conflictPolicy).toBe('local-wins')
  })

  it('should prevent sync execution when disabled', async () => {
    const result = await syncManager.syncNow({
      version: 1,
      timestamp: Date.now(),
      userId: 'test-user',
      settingsHash: 'abc',
      payloadData: '{}',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('disabled')
  })

  it('should successfully sync when enabled', async () => {
    syncManager.saveConfig({ enabled: true })

    const result = await syncManager.syncNow({
      version: 1,
      timestamp: Date.now(),
      userId: 'test-user',
      settingsHash: 'abc',
      payloadData: '{}',
    })

    expect(result.success).toBe(true)
    expect(result.syncedAt).toBeGreaterThan(0)
    expect(syncManager.getConfig().lastSyncTime).toBeDefined()
  })

  it('should resolve conflicts according to selected policy', () => {
    const older = 1000
    const newer = 2000

    expect(syncManager.resolveConflict(older, newer, 'local-wins')).toBe('local')
    expect(syncManager.resolveConflict(older, newer, 'remote-wins')).toBe('remote')
    expect(syncManager.resolveConflict(newer, older, 'manual')).toBe('local')
    expect(syncManager.resolveConflict(older, newer, 'manual')).toBe('remote')
  })
})
