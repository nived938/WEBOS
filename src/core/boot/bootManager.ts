import type { AppId } from '@/types'
import { soundService } from '@/core/audio/soundService'

export interface StartupAppConfig {
  appId: AppId
  name: string
  enabled: boolean
  delayMs: number
  priority: number
}

export interface UserProfile {
  id: string
  username: string
  avatar: string
  themeId: string
  wallpaperId: string
  isDefault: boolean
  lastActive: number
}

export interface BootProfile {
  id: string
  name: string
  description: string
  startupApps: AppId[]
  reducedMotion: boolean
  performanceMode: 'high' | 'balanced' | 'low'
  isDefault?: boolean
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

export interface SavedSession {
  timestamp: number
  profileId: string
  activeWorkspace: number
  windows: SavedWindowState[]
}

export type SessionRestoreMode = 'always' | 'ask' | 'clean'

const PROFILES_KEY = 'nova_user_profiles_v2'
const BOOT_PROFILES_KEY = 'nova_boot_profiles_v2'
const SESSION_KEY = 'nova_saved_session_v2'
const RESTORE_MODE_KEY = 'nova_session_restore_mode_v2'

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user-commander',
    username: 'Commander Nova',
    avatar: 'avatar-nova',
    themeId: 'nova-dark',
    wallpaperId: 'nova-aurora',
    isDefault: true,
    lastActive: Date.now(),
  },
  {
    id: 'user-developer',
    username: 'Dev Space',
    avatar: 'avatar-dev',
    themeId: 'obsidian',
    wallpaperId: 'obsidian-stealth',
    isDefault: false,
    lastActive: Date.now() - 86400000,
  },
]

export const DEFAULT_BOOT_PROFILES: BootProfile[] = [
  {
    id: 'boot-normal',
    name: 'Normal Desktop Mode',
    description: 'Standard desktop setup with widgets, animations, and default startup applications.',
    startupApps: ['notes'],
    reducedMotion: false,
    performanceMode: 'high',
    isDefault: true,
  },
  {
    id: 'boot-gaming',
    name: 'NOVA Gaming Mode',
    description: 'Optimized Three.js WebGL throughput, launches Gaming Hub, reduces background effects.',
    startupApps: ['games'],
    reducedMotion: true,
    performanceMode: 'high',
  },
  {
    id: 'boot-work',
    name: 'Productivity & Work',
    description: 'Launches Notes, Browser, and Calendar for focused development and research.',
    startupApps: ['notes', 'browser', 'calendar'],
    reducedMotion: false,
    performanceMode: 'balanced',
  },
  {
    id: 'boot-minimal',
    name: 'Minimal Fast Boot',
    description: 'Zero startup apps, instantaneous desktop render, reduced memory footprint.',
    startupApps: [],
    reducedMotion: true,
    performanceMode: 'low',
  },
]

class BootManager {
  private profiles: UserProfile[] = DEFAULT_PROFILES
  private bootProfiles: BootProfile[] = DEFAULT_BOOT_PROFILES

  constructor() {
    this.loadData()
  }

  private loadData() {
    if (typeof localStorage === 'undefined') return
    try {
      const p = localStorage.getItem(PROFILES_KEY)
      this.profiles = p ? JSON.parse(p) : DEFAULT_PROFILES

      const bp = localStorage.getItem(BOOT_PROFILES_KEY)
      this.bootProfiles = bp ? JSON.parse(bp) : DEFAULT_BOOT_PROFILES
    } catch {
      this.profiles = DEFAULT_PROFILES
      this.bootProfiles = DEFAULT_BOOT_PROFILES
    }
  }

  public getProfiles(): UserProfile[] {
    return this.profiles
  }

  public getActiveProfile(): UserProfile {
    return this.profiles.find((p) => p.isDefault) || this.profiles[0]
  }

  public setActiveProfile(id: string) {
    this.profiles = this.profiles.map((p) => ({
      ...p,
      isDefault: p.id === id,
      lastActive: p.id === id ? Date.now() : p.lastActive,
    }))
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(this.profiles))
      }
    } catch {
      // Ignore
    }
  }

  public getBootProfiles(): BootProfile[] {
    return this.bootProfiles
  }

  public getActiveBootProfile(): BootProfile {
    return this.bootProfiles.find((b) => b.isDefault) || this.bootProfiles[0]
  }

  public setActiveBootProfile(id: string) {
    this.bootProfiles = this.bootProfiles.map((b) => ({
      ...b,
      isDefault: b.id === id,
    }))
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(BOOT_PROFILES_KEY, JSON.stringify(this.bootProfiles))
      }
    } catch {
      // Ignore
    }
  }

  public getRestoreMode(): SessionRestoreMode {
    if (typeof localStorage === 'undefined') return 'always'
    try {
      return (localStorage.getItem(RESTORE_MODE_KEY) as SessionRestoreMode) || 'always'
    } catch {
      return 'always'
    }
  }

  public setRestoreMode(mode: SessionRestoreMode) {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(RESTORE_MODE_KEY, mode)
    } catch {
      // Ignore
    }
  }

  public saveSession(session: SavedSession) {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {
      // Ignore
    }
  }

  public getSavedSession(): SavedSession | null {
    if (typeof localStorage === 'undefined') return null
    try {
      const s = localStorage.getItem(SESSION_KEY)
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  }

  public clearSession() {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      // Ignore
    }
  }

  // Recovery Routines
  public executeRecovery(option: 'no_startup_apps' | 'default_theme' | 'reset_layout' | 'clear_session' | 'full_reset') {
    soundService.play('trash')
    if (typeof window === 'undefined') return

    if (option === 'no_startup_apps') {
      localStorage.setItem('nova_startup_apps_v2', JSON.stringify([]))
    } else if (option === 'default_theme') {
      try {
        const settings = JSON.parse(localStorage.getItem('nova_os_settings_v2') || '{}')
        settings.activeThemeId = 'nova-dark'
        settings.wallpaperId = 'nova-aurora'
        localStorage.setItem('nova_os_settings_v2', JSON.stringify(settings))
      } catch {
        // Ignore
      }
    } else if (option === 'reset_layout') {
      localStorage.removeItem('nova_os_desktop_icon_positions_v2')
    } else if (option === 'clear_session') {
      this.clearSession()
    } else if (option === 'full_reset') {
      this.clearSession()
      localStorage.removeItem('nova_os_desktop_icon_positions_v2')
      localStorage.removeItem('nova_startup_apps_v2')
    }
  }
}

export const bootManager = new BootManager()
