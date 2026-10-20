import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { WindowState, WindowManagerContextType, WindowBounds, SnapPosition } from './types'
import type { AppId } from '@/types'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import { soundService } from '@/core/audio/soundService'

const WindowManagerContext = createContext<WindowManagerContextType | null>(null)

export const WindowManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [topZIndex, setTopZIndex] = useState(10)

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

  // Open an app window
  const openApp = useCallback(
    (appId: AppId, args?: Record<string, unknown>): string => {
      const appDef = APPS_REGISTRY[appId]
      if (!appDef) return ''

      // Check if already open (single instance app behavior)
      const existing = windows.find((w) => w.appId === appId)
      if (existing) {
        if (existing.isMinimized) {
          soundService.playWindowRestore()
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
        initialArgs: args,
      }

      setWindows((prev) => [...prev.map((w) => ({ ...w, isFocused: false })), newWin])
      setActiveWindowId(newId)
      return newId
    },
    [windows, topZIndex, focusWindow]
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
        closeActiveWindow,
        minimizeActiveWindow,
        toggleMaximizeActiveWindow,
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
