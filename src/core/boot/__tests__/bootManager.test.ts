import { describe, it, expect, beforeEach } from 'vitest'
import {
  bootManager,
  DEFAULT_BOOT_PROFILES,
  DEFAULT_PROFILES,
  type SavedWindowState,
} from '../bootManager'

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

describe('Boot Manager - Profiles and Sessions', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides default boot profiles covering standard operating modes', () => {
    const profiles = bootManager.getBootProfiles()
    expect(profiles.length).toBeGreaterThanOrEqual(4)
    expect(profiles.some((p) => p.id === 'boot-normal')).toBe(true)
    expect(profiles.some((p) => p.id === 'boot-gaming')).toBe(true)
    expect(profiles.some((p) => p.id === 'boot-work')).toBe(true)
    expect(profiles.some((p) => p.id === 'boot-minimal')).toBe(true)
  })

  it('correctly retrieves and switches active user profile', () => {
    const initialProfiles = bootManager.getProfiles()
    expect(initialProfiles.length).toBeGreaterThanOrEqual(1)

    const targetId = initialProfiles[0].id
    bootManager.setActiveProfile(targetId)
    const active = bootManager.getActiveProfile()
    expect(active.id).toBe(targetId)
    expect(active.isDefault).toBe(true)
  })

  it('serializes, restores, and clears desktop session state', () => {
    const mockWindows: SavedWindowState[] = [
      {
        appId: 'terminal',
        title: 'Terminal - bash',
        x: 100,
        y: 100,
        width: 700,
        height: 450,
        isMinimized: false,
        isMaximized: false,
        workspaceId: 1,
      },
      {
        appId: 'notes',
        title: 'Notes',
        x: 250,
        y: 180,
        width: 600,
        height: 400,
        isMinimized: false,
        isMaximized: false,
        workspaceId: 1,
      },
    ]

    bootManager.saveSession({
      timestamp: Date.now(),
      profileId: 'user-commander',
      activeWorkspace: 1,
      windows: mockWindows,
    })

    const restored = bootManager.getSavedSession()
    expect(restored).not.toBeNull()
    expect(restored?.windows.length).toBe(2)
    expect(restored?.windows[0].appId).toBe('terminal')
    expect(restored?.activeWorkspace).toBe(1)

    bootManager.clearSession()
    const cleared = bootManager.getSavedSession()
    expect(cleared).toBeNull()
  })

  it('manages session restoration modes', () => {
    bootManager.setRestoreMode('clean')
    expect(bootManager.getRestoreMode()).toBe('clean')

    bootManager.setRestoreMode('always')
    expect(bootManager.getRestoreMode()).toBe('always')
  })
})
