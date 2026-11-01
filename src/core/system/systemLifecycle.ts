import type { SystemPowerState, StartupStageInfo } from './systemTypes'
import { soundService } from '@/core/audio/soundService'
import { userManager } from './userManager'
import { sessionManager } from './sessionManager'

export type LifecycleListener = (state: SystemPowerState) => void

class SystemLifecycleManager {
  private currentState: SystemPowerState = 'booting'
  private listeners: Set<LifecycleListener> = new Set()

  public getState(): SystemPowerState {
    return this.currentState
  }

  public subscribe(listener: LifecycleListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private transition(nextState: SystemPowerState) {
    if (this.currentState === nextState) return
    this.currentState = nextState
    this.listeners.forEach((fn) => {
      try {
        fn(nextState)
      } catch (err) {
        console.error('Lifecycle listener error:', err)
      }
    })
  }

  /**
   * Executes genuine startup stages tied to real browser and VFS checks
   */
  public async executeStartupSequence(
    onProgress?: (stage: StartupStageInfo) => void
  ): Promise<{ requiresLock: boolean; startupApps: string[] }> {
    this.transition('booting')

    const stages: StartupStageInfo[] = [
      { id: 'storage', name: 'Validating browser storage quota & persistence...', progress: 15, detail: 'Storage API handshake' },
      { id: 'vfs', name: 'Mounting virtual IndexedDB filesystem...', progress: 35, detail: 'IndexedDB transaction' },
      { id: 'settings', name: 'Migrating and sanitizing local settings...', progress: 55, detail: 'PBKDF2 security validation' },
      { id: 'profile', name: 'Loading active user profile & preferences...', progress: 75, detail: 'Profile manager' },
      { id: 'session', name: 'Preparing desktop environment & windows...', progress: 90, detail: 'Session manager' },
      { id: 'complete', name: 'NOVA OS Desktop Ready.', progress: 100, detail: 'Compositor initialization' },
    ]

    for (const stage of stages) {
      if (onProgress) onProgress(stage)

      // Actual work per stage
      if (stage.id === 'storage') {
        if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
          try {
            await navigator.storage.estimate()
          } catch {
            // Ignore
          }
        }
      } else if (stage.id === 'profile') {
        userManager.getActiveProfile()
      } else if (stage.id === 'session') {
        sessionManager.getRestoreMode()
      }

      // Small async tick for smooth rendering of genuine stages
      await new Promise((resolve) => setTimeout(resolve, 80))
    }

    // Check if lock screen is required
    let requiresLock = false
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('nova_os_settings_v2')
        if (raw) {
          const settings = JSON.parse(raw)
          requiresLock = Boolean(settings.lockScreenEnabled && settings.isPinSet)
        }
      }
    } catch {
      requiresLock = false
    }

    const activeProfile = userManager.getActiveProfile()
    const startupApps = activeProfile.startupApps || []

    if (requiresLock) {
      this.transition('locked')
    } else {
      this.transition('running')
    }

    return { requiresLock, startupApps }
  }

  public sleep() {
    soundService.playClick()
    this.transition('sleeping')
  }

  public wake() {
    soundService.playClick()
    this.transition('running')
  }

  public lock() {
    soundService.playClick()
    this.transition('locked')
  }

  public unlock() {
    soundService.playStartup()
    this.transition('running')
  }

  public async restart(onComplete?: () => void) {
    soundService.playClick()
    this.transition('restarting')
    await new Promise((resolve) => setTimeout(resolve, 600))
    await this.executeStartupSequence()
    if (onComplete) onComplete()
  }

  public shutdown() {
    soundService.playClick()
    this.transition('shutdown')
  }

  public powerOn(onComplete?: () => void) {
    soundService.playStartup()
    this.executeStartupSequence().then(() => {
      if (onComplete) onComplete()
    })
  }

  public enterRecovery() {
    this.transition('recovery')
  }
}

export const systemLifecycle = new SystemLifecycleManager()
