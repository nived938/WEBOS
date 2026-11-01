import { describe, it, expect } from 'vitest'
import { migrateSettings, DEFAULT_SETTINGS } from '../settingsStore'

describe('settingsStore - migrateSettings', () => {
  it('returns DEFAULT_SETTINGS when passed null or non-object', () => {
    expect(migrateSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(migrateSettings(undefined)).toEqual(DEFAULT_SETTINGS)
    expect(migrateSettings('invalid-json')).toEqual(DEFAULT_SETTINGS)
    expect(migrateSettings(12345)).toEqual(DEFAULT_SETTINGS)
  })

  it('preserves existing v2 user settings while populating new defaults', () => {
    const legacySavedSettings = {
      theme: 'light',
      accentColor: 'rose',
      wallpaperId: 'wp-nebula',
      dockSize: 'large',
      volume: 0.5,
    }

    const migrated = migrateSettings(legacySavedSettings)

    // Legacy values preserved
    expect(migrated.theme).toBe('light')
    expect(migrated.accentColor).toBe('rose')
    expect(migrated.wallpaperId).toBe('wp-nebula')
    expect(migrated.dockSize).toBe('large')
    expect(migrated.volume).toBe(0.5)

    // New values properly defaulted
    expect(migrated.cursorStyle).toBe('default')
    expect(migrated.performanceMode).toBe('high')
    expect(migrated.nightLight).toBe(false)
    expect(migrated.nightLightTemperature).toBe(45)
    expect(migrated.lockScreenEnabled).toBe(true)
    expect(migrated.lockPin).toBe('1234')
  })

  it('sanitizes invalid values and falls back safely', () => {
    const corruptedSettings = {
      theme: 'neon-psychedelic', // invalid theme
      volume: 999, // out of range
      brightness: -50, // out of range
      nightLightTemperature: 500, // out of range
      cursorStyle: 'super-rainbow-sparkles', // invalid cursor
      performanceMode: 'ultra-overclock', // invalid mode
    }

    const migrated = migrateSettings(corruptedSettings)

    expect(migrated.theme).toBe('dark') // defaulted
    expect(migrated.volume).toBe(1) // clamped to max 1
    expect(migrated.brightness).toBe(30) // clamped to min 30
    expect(migrated.nightLightTemperature).toBe(100) // clamped to max 100
    expect(migrated.cursorStyle).toBe('default') // defaulted
    expect(migrated.performanceMode).toBe('high') // defaulted
  })
})
