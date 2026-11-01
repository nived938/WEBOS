import type { AppId } from '@/types'

export type SystemPowerState =
  | 'initializing'
  | 'booting'
  | 'running'
  | 'locked'
  | 'sleeping'
  | 'restarting'
  | 'shutdown'
  | 'recovery'

export interface StartupStageInfo {
  id: string
  name: string
  progress: number // 0 to 100
  detail: string
}

export interface UserProfile {
  id: string
  username: string
  displayName: string
  avatar: string
  description?: string
  wallpaperId: string
  lockWallpaperId?: string
  themeId: string
  accentColor: string
  cursorPackId?: string
  dockPosition: 'bottom' | 'left' | 'right'
  startupApps: AppId[]
  preferredWorkspace: number
  isDefault: boolean
  lastActive: number
  customPreferences?: Record<string, unknown>
}

export interface SavedWindowState {
  appId: AppId
  title: string
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isMaximized: boolean
  workspaceId: number
}

export interface SavedDesktopSession {
  timestamp: number
  profileId: string
  activeWorkspace: number
  windows: SavedWindowState[]
  dockApps?: AppId[]
  iconPositions?: Record<string, { x: number; y: number }>
}

export type SessionRestoreMode = 'always' | 'ask' | 'clean'

export interface StartupAppConfig {
  appId: AppId
  name: string
  enabled: boolean
  delayMs: number
  priority: number
}

export interface RecoveryAction {
  id: 'default_appearance' | 'disable_startup_apps' | 'disable_custom_cursors' | 'restore_last_valid_session' | 'repair_settings' | 'safe_reboot'
  label: string
  description: string
}
