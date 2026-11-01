import type { UserProfile } from './systemTypes'

const USER_PROFILES_STORAGE_KEY = 'nova_user_profiles_v3'
const ACTIVE_USER_ID_KEY = 'nova_active_user_id_v3'

export const DEFAULT_USER_PROFILES: UserProfile[] = [
  {
    id: 'user-commander',
    username: 'Commander Nova',
    displayName: 'Commander Nova',
    avatar: 'avatar-nova',
    description: 'Lead Navigator & Desktop Architect',
    wallpaperId: 'nova-aurora',
    lockWallpaperId: 'nova-aurora',
    themeId: 'nova-dark',
    accentColor: 'blue',
    cursorPackId: 'cur-nova-default',
    dockPosition: 'bottom',
    startupApps: [],
    preferredWorkspace: 1,
    isDefault: true,
    lastActive: Date.now(),
  },
  {
    id: 'user-dev',
    username: 'Dev Space',
    displayName: 'Dev Space Workspace',
    avatar: 'avatar-bot',
    description: 'Optimized workspace for coding, terminal, and development',
    wallpaperId: 'obsidian-stealth',
    lockWallpaperId: 'obsidian-stealth',
    themeId: 'obsidian',
    accentColor: 'emerald',
    cursorPackId: 'cur-nova-default',
    dockPosition: 'left',
    startupApps: ['terminal'],
    preferredWorkspace: 2,
    isDefault: false,
    lastActive: Date.now() - 3600000,
  },
]

class UserManager {
  private profiles: UserProfile[] = DEFAULT_USER_PROFILES
  private activeUserId: string = 'user-commander'

  constructor() {
    this.loadProfiles()
  }

  private loadProfiles() {
    if (typeof localStorage === 'undefined') return
    try {
      const saved = localStorage.getItem(USER_PROFILES_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.profiles = parsed
        }
      }

      const savedActiveId = localStorage.getItem(ACTIVE_USER_ID_KEY)
      if (savedActiveId && this.profiles.some((p) => p.id === savedActiveId)) {
        this.activeUserId = savedActiveId
      } else {
        const defaultProfile = this.profiles.find((p) => p.isDefault) || this.profiles[0]
        this.activeUserId = defaultProfile ? defaultProfile.id : 'user-commander'
      }
    } catch {
      this.profiles = DEFAULT_USER_PROFILES
      this.activeUserId = 'user-commander'
    }
  }

  private saveProfiles() {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(USER_PROFILES_STORAGE_KEY, JSON.stringify(this.profiles))
      localStorage.setItem(ACTIVE_USER_ID_KEY, this.activeUserId)
    } catch {
      // Ignore
    }
  }

  public getProfiles(): UserProfile[] {
    return this.profiles
  }

  public getActiveProfile(): UserProfile {
    const found = this.profiles.find((p) => p.id === this.activeUserId)
    return found || this.profiles[0] || DEFAULT_USER_PROFILES[0]
  }

  public setActiveProfile(id: string): UserProfile {
    const target = this.profiles.find((p) => p.id === id)
    if (!target) {
      throw new Error(`Profile with ID "${id}" does not exist.`)
    }

    this.activeUserId = id
    this.profiles = this.profiles.map((p) => ({
      ...p,
      isDefault: p.id === id,
      lastActive: p.id === id ? Date.now() : p.lastActive,
    }))
    this.saveProfiles()
    return target
  }

  public createProfile(data: Partial<UserProfile>): UserProfile {
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const username = data.username?.trim() || `User_${this.profiles.length + 1}`
    const displayName = data.displayName?.trim() || username

    const newProfile: UserProfile = {
      id,
      username,
      displayName,
      avatar: data.avatar || 'avatar-nova',
      description: data.description || 'Custom NOVA OS User Profile',
      wallpaperId: data.wallpaperId || 'nova-aurora',
      lockWallpaperId: data.lockWallpaperId || data.wallpaperId || 'nova-aurora',
      themeId: data.themeId || 'nova-dark',
      accentColor: data.accentColor || 'blue',
      cursorPackId: data.cursorPackId || 'cur-nova-default',
      dockPosition: data.dockPosition || 'bottom',
      startupApps: data.startupApps || [],
      preferredWorkspace: data.preferredWorkspace || 1,
      isDefault: false,
      lastActive: Date.now(),
      customPreferences: data.customPreferences || {},
    }

    this.profiles.push(newProfile)
    this.saveProfiles()
    return newProfile
  }

  public updateProfile(id: string, partial: Partial<UserProfile>): UserProfile | null {
    const index = this.profiles.findIndex((p) => p.id === id)
    if (index === -1) return null

    const updated = {
      ...this.profiles[index],
      ...partial,
      id, // protect id
      lastActive: Date.now(),
    }

    this.profiles[index] = updated
    this.saveProfiles()
    return updated
  }

  public deleteProfile(id: string): boolean {
    if (this.profiles.length <= 1) {
      return false // Cannot delete only profile
    }

    this.profiles = this.profiles.filter((p) => p.id !== id)
    if (this.activeUserId === id) {
      this.activeUserId = this.profiles[0].id
      this.profiles[0].isDefault = true
    }
    this.saveProfiles()
    return true
  }

  public exportProfile(id: string): string {
    const profile = this.profiles.find((p) => p.id === id)
    if (!profile) throw new Error(`Profile "${id}" not found.`)
    return JSON.stringify(profile, null, 2)
  }

  public importProfile(jsonString: string): UserProfile {
    try {
      const parsed = JSON.parse(jsonString) as Partial<UserProfile>
      if (!parsed.username) {
        throw new Error('Imported profile missing username.')
      }

      return this.createProfile({
        ...parsed,
        username: `${parsed.username} (Imported)`,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON file format'
      throw new Error(`Profile import failed: ${msg}`)
    }
  }
}

export const userManager = new UserManager()
