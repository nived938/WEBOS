import type { SavedDesktopSession, SessionRestoreMode } from './systemTypes'

const SESSION_STORAGE_KEY_PREFIX = 'nova_saved_session_v3_'
const RESTORE_MODE_KEY = 'nova_session_restore_mode_v3'

class SessionManager {
  public getRestoreMode(): SessionRestoreMode {
    if (typeof localStorage === 'undefined') return 'always'
    try {
      const mode = localStorage.getItem(RESTORE_MODE_KEY) as SessionRestoreMode
      if (mode === 'always' || mode === 'ask' || mode === 'clean') return mode
      return 'always'
    } catch {
      return 'always'
    }
  }

  public setRestoreMode(mode: SessionRestoreMode): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(RESTORE_MODE_KEY, mode)
    } catch {
      // Ignore
    }
  }

  public saveSession(session: SavedDesktopSession): void {
    if (typeof localStorage === 'undefined') return
    try {
      // Sanitize window state to never persist sensitive passwords or temporary errors
      const sanitizedWindows = session.windows.map((w) => ({
        appId: w.appId,
        title: w.title,
        x: Math.max(0, Math.min(3000, w.x)),
        y: Math.max(0, Math.min(2000, w.y)),
        width: Math.max(300, Math.min(2560, w.width)),
        height: Math.max(200, Math.min(1440, w.height)),
        isMinimized: Boolean(w.isMinimized),
        isMaximized: Boolean(w.isMaximized),
        workspaceId: typeof w.workspaceId === 'number' ? w.workspaceId : 1,
      }))

      const key = `${SESSION_STORAGE_KEY_PREFIX}${session.profileId}`
      const cleanSession: SavedDesktopSession = {
        timestamp: Date.now(),
        profileId: session.profileId,
        activeWorkspace: session.activeWorkspace,
        windows: sanitizedWindows,
        dockApps: session.dockApps,
        iconPositions: session.iconPositions,
      }

      localStorage.setItem(key, JSON.stringify(cleanSession))
    } catch {
      // Ignore
    }
  }

  public getSession(profileId: string = 'user-commander'): SavedDesktopSession | null {
    if (typeof localStorage === 'undefined') return null
    try {
      const key = `${SESSION_STORAGE_KEY_PREFIX}${profileId}`
      const raw = localStorage.getItem(key)
      if (!raw) return null
      const parsed = JSON.parse(raw) as SavedDesktopSession
      return parsed
    } catch {
      return null
    }
  }

  public clearSession(profileId: string = 'user-commander'): void {
    if (typeof localStorage === 'undefined') return
    try {
      const key = `${SESSION_STORAGE_KEY_PREFIX}${profileId}`
      localStorage.removeItem(key)
    } catch {
      // Ignore
    }
  }
}

export const sessionManager = new SessionManager()
