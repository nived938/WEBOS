export type SyncProviderType = 'local' | 'webdav' | 'mock-cloud'
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'
export type SyncConflictPolicy = 'local-wins' | 'remote-wins' | 'manual'

export interface SyncConfig {
  enabled: boolean
  provider: SyncProviderType
  endpointUrl?: string
  authToken?: string
  lastSyncTime?: number
  conflictPolicy: SyncConflictPolicy
  autoSyncIntervalMinutes: number
}

export interface SyncPayload {
  version: number
  timestamp: number
  userId: string
  settingsHash: string
  payloadData: string // encrypted or serialized JSON
}

export interface SyncResult {
  success: boolean
  syncedAt: number
  itemsUpdated: number
  error?: string
}
