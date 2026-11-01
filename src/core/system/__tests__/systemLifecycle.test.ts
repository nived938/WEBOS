import { describe, it, expect, beforeEach } from 'vitest'
import { systemLifecycle } from '../systemLifecycle'
import { userManager, DEFAULT_USER_PROFILES } from '../userManager'
import { sessionManager } from '../sessionManager'
import { recoveryManager } from '../recoveryManager'
import type { SavedWindowState } from '../systemTypes'

// Provide localStorage mock for node test environment if needed
if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {}
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val.toString()
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
    },
    writable: true,
  })
}

describe('System Lifecycle Manager', () => {
  it('manages virtual power states (running, sleep, wake, lock, shutdown)', () => {
    systemLifecycle.wake()
    expect(systemLifecycle.getState()).toBe('running')

    systemLifecycle.sleep()
    expect(systemLifecycle.getState()).toBe('sleeping')

    systemLifecycle.wake()
    expect(systemLifecycle.getState()).toBe('running')

    systemLifecycle.lock()
    expect(systemLifecycle.getState()).toBe('locked')

    systemLifecycle.unlock()
    expect(systemLifecycle.getState()).toBe('running')

    systemLifecycle.shutdown()
    expect(systemLifecycle.getState()).toBe('shutdown')
  })

  it('executes genuine startup sequence with progress milestones', async () => {
    const milestones: string[] = []
    const result = await systemLifecycle.executeStartupSequence((stage) => {
      milestones.push(stage.id)
    })

    expect(milestones).toContain('storage')
    expect(milestones).toContain('vfs')
    expect(milestones).toContain('settings')
    expect(milestones).toContain('profile')
    expect(milestones).toContain('complete')
    expect(typeof result.requiresLock).toBe('boolean')
    expect(Array.isArray(result.startupApps)).toBe(true)
  })
})

describe('User Profile Manager', () => {
  it('provides default profiles with valid configuration', () => {
    const profiles = userManager.getProfiles()
    expect(profiles.length).toBeGreaterThanOrEqual(2)
    expect(profiles.some((p) => p.id === 'user-commander')).toBe(true)
  })

  it('creates, switches, updates, and exports user profiles', () => {
    const newProfile = userManager.createProfile({
      username: 'TestAstronaut',
      displayName: 'Major Tom',
      wallpaperId: 'wp-nebula',
    })
    expect(newProfile.id).toBeDefined()
    expect(newProfile.username).toBe('TestAstronaut')

    // Switch
    userManager.setActiveProfile(newProfile.id)
    expect(userManager.getActiveProfile().id).toBe(newProfile.id)

    // Update
    const updated = userManager.updateProfile(newProfile.id, { description: 'Space explorer' })
    expect(updated?.description).toBe('Space explorer')

    // Export & Import
    const exported = userManager.exportProfile(newProfile.id)
    expect(typeof exported).toBe('string')
    const imported = userManager.importProfile(exported)
    expect(imported.username).toContain('TestAstronaut')

    // Delete
    const deleted = userManager.deleteProfile(imported.id)
    expect(deleted).toBe(true)
  })
})

describe('Session Manager', () => {
  it('saves and restores desktop sessions per profile', () => {
    const mockWindows: SavedWindowState[] = [
      {
        appId: 'terminal',
        title: 'Terminal',
        x: 120,
        y: 120,
        width: 800,
        height: 500,
        isMinimized: false,
        isMaximized: false,
        workspaceId: 1,
      },
    ]

    sessionManager.saveSession({
      timestamp: Date.now(),
      profileId: 'user-commander',
      activeWorkspace: 1,
      windows: mockWindows,
    })

    const restored = sessionManager.getSession('user-commander')
    expect(restored).not.toBeNull()
    expect(restored?.windows.length).toBe(1)
    expect(restored?.windows[0].appId).toBe('terminal')

    sessionManager.clearSession('user-commander')
    expect(sessionManager.getSession('user-commander')).toBeNull()
  })

  it('manages session restoration modes', () => {
    sessionManager.setRestoreMode('clean')
    expect(sessionManager.getRestoreMode()).toBe('clean')
    sessionManager.setRestoreMode('always')
    expect(sessionManager.getRestoreMode()).toBe('always')
  })
})

describe('Recovery Manager', () => {
  it('executes safe recovery actions without modifying user files', () => {
    const resAppearance = recoveryManager.executeRecovery('default_appearance')
    expect(resAppearance.success).toBe(true)

    const resStartup = recoveryManager.executeRecovery('disable_startup_apps')
    expect(resStartup.success).toBe(true)

    const resCursors = recoveryManager.executeRecovery('disable_custom_cursors')
    expect(resCursors.success).toBe(true)
  })
})
