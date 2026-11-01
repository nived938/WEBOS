import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { WindowState, WindowManagerContextType, WindowBounds, SnapPosition, WorkspaceDef } from './types'
import type { AppId } from '@/types'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import { soundService } from '@/core/audio/soundService'
import { useSettings } from '@/core/settings/SettingsContext'
import {
  verifyPin,
  getPinLockoutStatus,
  recordFailedPinAttempt,
  resetPinRateLimit,
  verifyRecoveryKey,
} from '@/core/security/cryptoPin'
import { sessionManager } from '@/core/system/sessionManager'
import { userManager } from '@/core/system/userManager'

const WORKSPACES_STORAGE_KEY = 'nova_workspaces_v2'

export const DEFAULT_WORKSPACES: WorkspaceDef[] = [
  { id: 1, name: 'Main' },
  { id: 2, name: 'Work' },
  { id: 3, name: 'Gaming' },
  { id: 4, name: 'Entertainment' },
]

const WindowManagerContext = createContext<WindowManagerContextType | null>(null)

export const WindowManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings()
  const [windows, setWindows] = useState<WindowState[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [topZIndex, setTopZIndex] = useState(10)

  // Workspaces & Multitasking State
  const [workspaces, setWorkspaces] = useState<WorkspaceDef[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(WORKSPACES_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_WORKSPACES
  })

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(workspaces))
      }
    } catch {
      // Ignore
    }
  }, [workspaces])

  const [activeWorkspace, setActiveWorkspace] = useState<number>(settings.activeWorkspace || 1)
  const [isOverviewOpen, setIsOverviewOpen] = useState(false)
  const [isLauncherOpen, setIsLauncherOpen] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [isBooting, setIsBooting] = useState(false)
  const [isAsleep, setIsAsleep] = useState(false)
  const [isShutDown, setIsShutDown] = useState(false)

  // Focus a window
  const focusWindow = useCallback((id: string) => {
    setTopZIndex((prevZ) => {
      const nextZ = prevZ + 1
      setWindows((prevWindows) =>
        prevWindows.map((w) =>
          w.id === id
            ? { ...w, zIndex: nextZ, isFocused: true, isMinimized: false }
            : { ...w, isFocused: false }
        )
      )
      return nextZ
    })
    setActiveWindowId(id)
  }, [])

  // Switch Workspace
  const switchWorkspace = useCallback((workspaceId: number) => {
    soundService.playClick()
    setActiveWorkspace(workspaceId)
    // Focus highest z-index window in the target workspace
    setWindows((prev) => {
      const inWorkspace = prev.filter((w) => w.workspaceId === workspaceId && !w.isMinimized)
      if (inWorkspace.length > 0) {
        const sorted = [...inWorkspace].sort((a, b) => b.zIndex - a.zIndex)
        setActiveWindowId(sorted[0].id)
        return prev.map((w) => ({ ...w, isFocused: w.id === sorted[0].id }))
      } else {
        setActiveWindowId(null)
        return prev.map((w) => ({ ...w, isFocused: false }))
      }
    })
  }, [])

  // Create Workspace
  const createWorkspace = useCallback((name?: string) => {
    soundService.playClick()
    let nextId = 1
    setWorkspaces((prev) => {
      const maxId = prev.reduce((acc, curr) => Math.max(acc, curr.id), 0)
      nextId = maxId + 1
      const newWs: WorkspaceDef = {
        id: nextId,
        name: name?.trim() || `Workspace ${nextId}`,
      }
      return [...prev, newWs]
    })
    return nextId
  }, [])

  // Rename Workspace
  const renameWorkspace = useCallback((id: number, name: string) => {
    if (!name.trim()) return
    soundService.playClick()
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === id ? { ...ws, name: name.trim() } : ws))
    )
  }, [])

  // Delete Workspace
  const deleteWorkspace = useCallback((id: number) => {
    soundService.playTrashEmpty()
    setWorkspaces((prev) => {
      if (prev.length <= 1) return prev // Always retain at least one workspace
      return prev.filter((ws) => ws.id !== id)
    })
    // Relocate any windows in deleted workspace to workspace 1
    setWindows((prev) =>
      prev.map((w) => (w.workspaceId === id ? { ...w, workspaceId: 1 } : w))
    )
    setActiveWorkspace((curr) => (curr === id ? 1 : curr))
  }, [])

  // Reorder Workspaces
  const reorderWorkspaces = useCallback((order: WorkspaceDef[] | number[]) => {
    setWorkspaces((prev) => {
      if (!order || order.length === 0) return prev
      if (typeof order[0] === 'number') {
        const idList = order as number[]
        const map = new Map(prev.map((w) => [w.id, w]))
        const reordered: WorkspaceDef[] = []
        idList.forEach((id) => {
          const item = map.get(id)
          if (item) reordered.push(item)
        })
        prev.forEach((w) => {
          if (!reordered.find((r) => r.id === w.id)) reordered.push(w)
        })
        return reordered
      } else {
        return order as WorkspaceDef[]
      }
    })
  }, [])

  // Move window to target workspace
  const moveWindowToWorkspace = useCallback((windowId: string, targetWorkspace: number) => {
    soundService.playClick()
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, workspaceId: targetWorkspace } : w))
    )
  }, [])

  // Toggle Overview / Mission Control
  const toggleOverview = useCallback((open?: boolean) => {
    soundService.playClick()
    setIsOverviewOpen((prev) => (open !== undefined ? open : !prev))
    setIsLauncherOpen(false)
  }, [])

  // Toggle Application Launcher / Launchpad
  const toggleLauncher = useCallback((open?: boolean) => {
    soundService.playClick()
    setIsLauncherOpen((prev) => (open !== undefined ? open : !prev))
    setIsOverviewOpen(false)
  }, [])

  // Lock & Unlock Session
  const lockSystem = useCallback(() => {
    soundService.playClick()
    setIsLocked(true)
    setIsOverviewOpen(false)
    setIsLauncherOpen(false)
  }, [])

  const unlockSystem = useCallback(
    async (pin?: string): Promise<boolean> => {
      // If PIN is not configured on this device, allow unlocking immediately
      if (!settings.isPinSet || !settings.pinHash || !settings.pinSalt) {
        soundService.playStartup()
        setIsLocked(false)
        setIsAsleep(false)
        return true
      }

      // Prohibit empty input when PIN is required
      if (!pin || pin.trim() === '') {
        return false
      }

      // Check temporary lockout from repeated failures
      const lockout = getPinLockoutStatus()
      if (lockout.isLockedOut) {
        soundService.playAlert()
        return false
      }

      // Check explicit account recovery key
      if (settings.recoveryKey && verifyRecoveryKey(pin, settings.recoveryKey)) {
        resetPinRateLimit()
        soundService.playStartup()
        setIsLocked(false)
        setIsAsleep(false)
        return true
      }

      // Web Crypto PBKDF2 verification against stored hash & salt
      const matches = await verifyPin(pin, settings.pinHash, settings.pinSalt)
      if (matches) {
        resetPinRateLimit()
        soundService.playStartup()
        setIsLocked(false)
        setIsAsleep(false)
        return true
      }

      // Authentication failed: record attempt for rate limiting
      recordFailedPinAttempt()
      soundService.playAlert()
      return false
    },
    [settings.isPinSet, settings.pinHash, settings.pinSalt, settings.recoveryKey]
  )

  // Helper to persist session state
  const persistCurrentSession = useCallback(() => {
    try {
      const activeProfile = userManager.getActiveProfile()
      sessionManager.saveSession({
        timestamp: Date.now(),
        profileId: activeProfile.id,
        activeWorkspace,
        windows: windows.map((w) => ({
          appId: w.appId,
          title: w.title,
          x: w.x,
          y: w.y,
          width: w.width,
          height: w.height,
          isMinimized: w.isMinimized,
          isMaximized: w.isMaximized,
          workspaceId: w.workspaceId,
        })),
      })
    } catch {
      // Ignore
    }
  }, [activeWorkspace, windows])

  // Virtual Power Management (Sleep, Restart, Power Off)
  const sleepSystem = useCallback(() => {
    soundService.playClick()
    persistCurrentSession()
    setIsAsleep(true)
    setIsLocked(true)
    setIsOverviewOpen(false)
    setIsLauncherOpen(false)
  }, [persistCurrentSession])

  const wakeSystem = useCallback(() => {
    soundService.playClick()
    setIsAsleep(false)
  }, [])

  const powerOffSystem = useCallback(() => {
    soundService.playClick()
    persistCurrentSession()
    setIsShutDown(true)
    setIsLocked(false)
    setIsAsleep(false)
    setIsOverviewOpen(false)
    setIsLauncherOpen(false)
  }, [persistCurrentSession])

  const powerOnSystem = useCallback(() => {
    soundService.playStartup()
    setIsShutDown(false)
    setIsBooting(true)
  }, [])

  // Boot & Reboot
  const rebootSystem = useCallback(() => {
    soundService.playStartup()
    persistCurrentSession()
    setIsBooting(true)
    setIsLocked(false)
    setIsAsleep(false)
    setIsShutDown(false)
    setIsOverviewOpen(false)
    setIsLauncherOpen(false)
  }, [persistCurrentSession])

  const completeBoot = useCallback(() => {
    setIsBooting(false)
    if (settings.lockScreenEnabled && settings.isPinSet) {
      setIsLocked(true)
    }

    // Restore desktop session if configured
    if (sessionManager.getRestoreMode() === 'always') {
      const activeProfile = userManager.getActiveProfile()
      const saved = sessionManager.getSession(activeProfile.id)
      if (saved && saved.windows && saved.windows.length > 0) {
        const restoredWindows: WindowState[] = saved.windows.map((sw, idx) => {
          const appDef = APPS_REGISTRY[sw.appId]
          return {
            id: `win-restore-${Date.now()}-${idx}`,
            appId: sw.appId,
            title: sw.title || appDef?.title || 'Application',
            x: sw.x,
            y: sw.y,
            width: sw.width,
            height: sw.height,
            minWidth: appDef?.minWidth || 300,
            minHeight: appDef?.minHeight || 200,
            isMinimized: sw.isMinimized,
            isMaximized: sw.isMaximized,
            isFocused: idx === saved.windows.length - 1,
            zIndex: 10 + idx,
            workspaceId: sw.workspaceId || 1,
          }
        })
        setWindows(restoredWindows)
        if (saved.activeWorkspace) {
          setActiveWorkspace(saved.activeWorkspace)
        }
      }
    }
  }, [settings.lockScreenEnabled, settings.isPinSet])

  // Open an app window
  const openApp = useCallback(
    (appId: AppId, args?: Record<string, unknown>): string => {
      const appDef = APPS_REGISTRY[appId]
      if (!appDef) return ''

      // Automatically close overlay launcher or overview when launching an app
      setIsLauncherOpen(false)
      setIsOverviewOpen(false)

      // Check if already open (single instance app behavior)
      const existing = windows.find((w) => w.appId === appId)
      if (existing) {
        if (existing.isMinimized) {
          soundService.playWindowRestore()
        }
        // If window is in another workspace, switch there
        if (existing.workspaceId !== activeWorkspace) {
          setActiveWorkspace(existing.workspaceId)
        }
        focusWindow(existing.id)
        if (args) {
          setWindows((prev) =>
            prev.map((w) => (w.id === existing.id ? { ...w, initialArgs: args } : w))
          )
        }
        return existing.id
      }

      soundService.playWindowRestore()

      // Calculate initial position with smart cascading
      const screenW = window.innerWidth || 1280
      const screenH = window.innerHeight || 800
      const menuBarHeight = 32
      const dockHeight = 80

      const w = Math.min(appDef.defaultWidth, screenW - 40)
      const h = Math.min(appDef.defaultHeight, screenH - menuBarHeight - dockHeight - 20)

      const cascadeOffset = (windows.length % 6) * 28
      const x = Math.max(20, Math.min(screenW - w - 20, (screenW - w) / 2 + cascadeOffset - 60))
      const y = Math.max(menuBarHeight + 10, Math.min(screenH - dockHeight - h - 10, (screenH - h) / 2 + cascadeOffset - 60))

      const newId = 'win-' + appId + '-' + Date.now()
      const nextZ = topZIndex + 1
      setTopZIndex(nextZ)

      const newWin: WindowState = {
        id: newId,
        appId,
        title: appDef.title,
        x,
        y,
        width: w,
        height: h,
        minWidth: appDef.minWidth,
        minHeight: appDef.minHeight,
        isMinimized: false,
        isMaximized: false,
        isFocused: true,
        zIndex: nextZ,
        workspaceId: activeWorkspace,
        initialArgs: args,
      }

      setWindows((prev) => [...prev.map((w) => ({ ...w, isFocused: false })), newWin])
      setActiveWindowId(newId)
      return newId
    },
    [windows, topZIndex, focusWindow, activeWorkspace]
  )

  const closeWindow = useCallback(
    (id: string) => {
      soundService.playClick()
      setWindows((prev) => {
        const remaining = prev.filter((w) => w.id !== id)
        if (activeWindowId === id && remaining.length > 0) {
          // Focus the highest z-index window remaining
          const sorted = [...remaining].sort((a, b) => b.zIndex - a.zIndex)
          sorted[0].isFocused = true
          setActiveWindowId(sorted[0].id)
        } else if (remaining.length === 0) {
          setActiveWindowId(null)
        }
        return remaining
      })
    },
    [activeWindowId]
  )

  const minimizeWindow = useCallback((id: string) => {
    soundService.playWindowMinimize()
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true, isFocused: false } : w))
    )
    setActiveWindowId((currentActive) => (currentActive === id ? null : currentActive))
  }, [])

  const restoreWindow = useCallback(
    (id: string) => {
      soundService.playWindowRestore()
      focusWindow(id)
    },
    [focusWindow]
  )

  const toggleMaximize = useCallback((id: string) => {
    soundService.playClick()
    const screenW = window.innerWidth || 1280
    const screenH = window.innerHeight || 800
    const menuBarH = 32
    const dockH = 75

    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w
        if (w.isMaximized) {
          // Restore to previous bounds
          const b = w.prevBounds || {
            x: 100,
            y: 80,
            width: w.minWidth * 1.3,
            height: w.minHeight * 1.3,
          }
          return {
            ...w,
            x: b.x,
            y: b.y,
            width: b.width,
            height: b.height,
            isMaximized: false,
            snapPosition: 'none',
          }
        } else {
          // Maximize within usable bounds
          return {
            ...w,
            prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
            x: 0,
            y: menuBarH,
            width: screenW,
            height: screenH - menuBarH - dockH,
            isMaximized: true,
            snapPosition: 'top',
          }
        }
      })
    )
  }, [])

  const snapWindow = useCallback((id: string, snap: SnapPosition) => {
    const screenW = window.innerWidth || 1280
    const screenH = window.innerHeight || 800
    const menuBarH = 32
    const dockH = 75
    const usableH = screenH - menuBarH - dockH

    soundService.playClick()

    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w

        if (snap === 'none') {
          if (w.prevBounds) {
            return {
              ...w,
              x: w.prevBounds.x,
              y: w.prevBounds.y,
              width: w.prevBounds.width,
              height: w.prevBounds.height,
              isMaximized: false,
              snapPosition: 'none',
            }
          }
          return w
        }

        const prevBounds = w.prevBounds || { x: w.x, y: w.y, width: w.width, height: w.height }

        if (snap === 'left') {
          return {
            ...w,
            prevBounds,
            x: 0,
            y: menuBarH,
            width: Math.floor(screenW / 2),
            height: usableH,
            isMaximized: false,
            snapPosition: 'left',
          }
        }

        if (snap === 'right') {
          return {
            ...w,
            prevBounds,
            x: Math.floor(screenW / 2),
            y: menuBarH,
            width: Math.ceil(screenW / 2),
            height: usableH,
            isMaximized: false,
            snapPosition: 'right',
          }
        }

        if (snap === 'top') {
          return {
            ...w,
            prevBounds,
            x: 0,
            y: menuBarH,
            width: screenW,
            height: usableH,
            isMaximized: true,
            snapPosition: 'top',
          }
        }

        if (snap === 'top-left') {
          return {
            ...w,
            prevBounds,
            x: 0,
            y: menuBarH,
            width: Math.floor(screenW / 2),
            height: Math.floor(usableH / 2),
            isMaximized: false,
            snapPosition: 'top-left',
          }
        }

        if (snap === 'top-right') {
          return {
            ...w,
            prevBounds,
            x: Math.floor(screenW / 2),
            y: menuBarH,
            width: Math.ceil(screenW / 2),
            height: Math.floor(usableH / 2),
            isMaximized: false,
            snapPosition: 'top-right',
          }
        }

        if (snap === 'bottom-left') {
          return {
            ...w,
            prevBounds,
            x: 0,
            y: menuBarH + Math.floor(usableH / 2),
            width: Math.floor(screenW / 2),
            height: Math.ceil(usableH / 2),
            isMaximized: false,
            snapPosition: 'bottom-left',
          }
        }

        if (snap === 'bottom-right') {
          return {
            ...w,
            prevBounds,
            x: Math.floor(screenW / 2),
            y: menuBarH + Math.floor(usableH / 2),
            width: Math.ceil(screenW / 2),
            height: Math.ceil(usableH / 2),
            isMaximized: false,
            snapPosition: 'bottom-right',
          }
        }

        return w
      })
    )
  }, [])

  const updateWindowBounds = useCallback((id: string, bounds: Partial<WindowBounds>) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w
        return {
          ...w,
          x: bounds.x !== undefined ? bounds.x : w.x,
          y: bounds.y !== undefined ? bounds.y : w.y,
          width: bounds.width !== undefined ? Math.max(w.minWidth, bounds.width) : w.width,
          height: bounds.height !== undefined ? Math.max(w.minHeight, bounds.height) : w.height,
          isMaximized: false,
          snapPosition: 'none',
        }
      })
    )
  }, [])

  const closeActiveWindow = useCallback(() => {
    if (activeWindowId) {
      closeWindow(activeWindowId)
    }
  }, [activeWindowId, closeWindow])

  const minimizeActiveWindow = useCallback(() => {
    if (activeWindowId) {
      minimizeWindow(activeWindowId)
    }
  }, [activeWindowId, minimizeWindow])

  const toggleMaximizeActiveWindow = useCallback(() => {
    if (activeWindowId) {
      toggleMaximize(activeWindowId)
    }
  }, [activeWindowId, toggleMaximize])

  const tileWindows = useCallback(
    (layout: 'split-vertical' | 'split-horizontal' | 'grid' = 'split-vertical') => {
      soundService.playClick()
      const screenW = window.innerWidth || 1280
      const screenH = window.innerHeight || 800
      const menuBarH = 32
      const dockH = 75
      const usableH = screenH - menuBarH - dockH

      setWindows((prev) => {
        const activeWindows = prev.filter((w) => w.workspaceId === activeWorkspace && !w.isMinimized)
        if (activeWindows.length === 0) return prev

        if (layout === 'split-vertical' || (layout === 'grid' && activeWindows.length === 2)) {
          const colW = Math.floor(screenW / activeWindows.length)
          return prev.map((w) => {
            const idx = activeWindows.findIndex((aw) => aw.id === w.id)
            if (idx === -1) return w
            return {
              ...w,
              x: idx * colW,
              y: menuBarH,
              width: colW,
              height: usableH,
              isMaximized: false,
              snapPosition: 'none',
            }
          })
        }

        if (layout === 'split-horizontal') {
          const rowH = Math.floor(usableH / activeWindows.length)
          return prev.map((w) => {
            const idx = activeWindows.findIndex((aw) => aw.id === w.id)
            if (idx === -1) return w
            return {
              ...w,
              x: 0,
              y: menuBarH + idx * rowH,
              width: screenW,
              height: rowH,
              isMaximized: false,
              snapPosition: 'none',
            }
          })
        }

        if (layout === 'grid') {
          const cols = Math.ceil(Math.sqrt(activeWindows.length))
          const rows = Math.ceil(activeWindows.length / cols)
          const cellW = Math.floor(screenW / cols)
          const cellH = Math.floor(usableH / rows)

          return prev.map((w) => {
            const idx = activeWindows.findIndex((aw) => aw.id === w.id)
            if (idx === -1) return w
            const col = idx % cols
            const row = Math.floor(idx / cols)
            return {
              ...w,
              x: col * cellW,
              y: menuBarH + row * cellH,
              width: cellW,
              height: cellH,
              isMaximized: false,
              snapPosition: 'none',
            }
          })
        }

        return prev
      })
    },
    [activeWorkspace]
  )

  const setWorkspaceWallpaper = useCallback((workspaceId: number, wallpaperId: string) => {
    soundService.playClick()
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === workspaceId ? { ...ws, wallpaperId } : ws))
    )
  }, [])

  const setWorkspaceLayout = useCallback(
    (workspaceId: number, layout: 'floating' | 'split-vertical' | 'split-horizontal' | 'grid') => {
      soundService.playClick()
      setWorkspaces((prev) =>
        prev.map((ws) => (ws.id === workspaceId ? { ...ws, layout } : ws))
      )
      if (layout !== 'floating') {
        tileWindows(layout)
      }
    },
    [tileWindows]
  )

  // Clamp windows inside viewport on resize
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const screenW = window.innerWidth
      const screenH = window.innerHeight
      const menuBarH = 32
      const dockH = 75

      setWindows((prev) =>
        prev.map((w) => {
          if (w.isMaximized) {
            return {
              ...w,
              x: 0,
              y: menuBarH,
              width: screenW,
              height: screenH - menuBarH - dockH,
            }
          }
          const maxX = Math.max(0, screenW - 120)
          const maxY = Math.max(menuBarH, screenH - dockH - 40)
          const clampedX = Math.max(0, Math.min(maxX, w.x))
          const clampedY = Math.max(menuBarH, Math.min(maxY, w.y))
          return {
            ...w,
            x: clampedX,
            y: clampedY,
          }
        })
      )
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const activeWindow = windows.find((w) => w.id === activeWindowId) || null
  const runningAppIds = Array.from(new Set(windows.map((w) => w.appId)))

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        activeWindow,
        runningAppIds,
        openApp,
        closeWindow,
        minimizeWindow,
        restoreWindow,
        toggleMaximize,
        focusWindow,
        updateWindowBounds,
        snapWindow,
        tileWindows,
        closeActiveWindow,
        minimizeActiveWindow,
        toggleMaximizeActiveWindow,
        workspaces,
        activeWorkspace,
        switchWorkspace,
        moveWindowToWorkspace,
        createWorkspace,
        renameWorkspace,
        deleteWorkspace,
        reorderWorkspaces,
        setWorkspaceWallpaper,
        setWorkspaceLayout,
        isOverviewOpen,
        toggleOverview,
        isLauncherOpen,
        toggleLauncher,
        isLocked,
        lockSystem,
        unlockSystem,
        isAsleep,
        sleepSystem,
        wakeSystem,
        isShutDown,
        powerOffSystem,
        powerOnSystem,
        isBooting,
        rebootSystem,
        completeBoot,
      }}
    >
      {children}
    </WindowManagerContext.Provider>
  )
}

export const useWindowManager = (): WindowManagerContextType => {
  const context = useContext(WindowManagerContext)
  if (!context) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider')
  }
  return context
}
