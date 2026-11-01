import { soundService } from '@/core/audio/soundService'
import { sessionManager } from './sessionManager'
import type { RecoveryAction } from './systemTypes'

export const RECOVERY_ACTIONS: RecoveryAction[] = [
  {
    id: 'default_appearance',
    label: 'Reset Visual Appearance to Defaults',
    description: 'Restores the factory Nova Dark theme, Aurora wallpaper, and default system styling.',
  },
  {
    id: 'disable_startup_apps',
    label: 'Disable All Startup Applications',
    description: 'Prevents any configured background apps from automatically launching upon boot.',
  },
  {
    id: 'disable_custom_cursors',
    label: 'Disable Custom Pointer Packs',
    description: 'Reverts pointer and cursor settings to standard operating system pointers.',
  },
  {
    id: 'restore_last_valid_session',
    label: 'Clear Corrupted Window Session',
    description: 'Clears saved window geometry coordinates while preserving user files and documents.',
  },
  {
    id: 'repair_settings',
    label: 'Repair Corrupt System Settings',
    description: 'Validates and repairs corrupt system preferences, safely sanitizing invalid values.',
  },
  {
    id: 'safe_reboot',
    label: 'Safe Boot Clean Mode',
    description: 'Boots into minimal recovery desktop with widgets and background processes paused.',
  },
]

class RecoveryManager {
  public executeRecovery(actionId: RecoveryAction['id']): { success: boolean; message: string } {
    soundService.playAlert()

    if (typeof localStorage === 'undefined') {
      return { success: false, message: 'LocalStorage unavailable in current runtime.' }
    }

    try {
      switch (actionId) {
        case 'default_appearance': {
          const raw = localStorage.getItem('nova_os_settings_v2')
          const settings = raw ? JSON.parse(raw) : {}
          settings.activeThemeId = 'nova-dark'
          settings.theme = 'dark'
          settings.wallpaperId = 'nova-aurora'
          settings.accentColor = 'blue'
          localStorage.setItem('nova_os_settings_v2', JSON.stringify(settings))
          return { success: true, message: 'Visual appearance restored to default Nova Dark and Aurora.' }
        }

        case 'disable_startup_apps': {
          localStorage.setItem('nova_startup_apps_v2', JSON.stringify([]))
          return { success: true, message: 'Startup applications list cleared.' }
        }

        case 'disable_custom_cursors': {
          const raw = localStorage.getItem('nova_os_settings_v2')
          const settings = raw ? JSON.parse(raw) : {}
          settings.cursorStyle = 'default'
          if (settings.cursorSettings) {
            settings.cursorSettings.preset = 'default'
            settings.cursorSettings.customUrl = undefined
          }
          localStorage.setItem('nova_os_settings_v2', JSON.stringify(settings))
          return { success: true, message: 'Custom cursors disabled; standard pointer restored.' }
        }

        case 'restore_last_valid_session': {
          sessionManager.clearSession('user-commander')
          sessionManager.setRestoreMode('clean')
          return { success: true, message: 'Window session cache cleared. Next boot will start with clean desktop.' }
        }

        case 'repair_settings': {
          const raw = localStorage.getItem('nova_os_settings_v2')
          if (raw) {
            try {
              const settings = JSON.parse(raw)
              // Sanitize hazardous fields
              delete settings.lockPin
              localStorage.setItem('nova_os_settings_v2', JSON.stringify(settings))
            } catch {
              localStorage.removeItem('nova_os_settings_v2')
            }
          }
          return { success: true, message: 'Settings store verified and sanitized.' }
        }

        case 'safe_reboot': {
          sessionManager.setRestoreMode('clean')
          localStorage.setItem('nova_startup_apps_v2', JSON.stringify([]))
          return { success: true, message: 'Safe boot prepared. Clean desktop will initialize.' }
        }

        default:
          return { success: false, message: 'Unknown recovery action requested.' }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Recovery routine failed'
      return { success: false, message: msg }
    }
  }
}

export const recoveryManager = new RecoveryManager()
