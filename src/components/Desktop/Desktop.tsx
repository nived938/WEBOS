import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { useSettings } from '@/core/settings/SettingsContext'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { usePointerLock } from '@/core/pointer/PointerLockContext'
import { WALLPAPERS } from '@/core/settings/wallpapers'
import { DesktopIcon } from './DesktopIcon'
import { SelectionBox } from './SelectionBox'
import { ContextMenu, MenuItem } from './ContextMenu'
import { DesktopWidgets } from './DesktopWidgets'
import { WindowFrame } from '@/components/WindowManager/WindowFrame'
import { MenuBar } from '@/components/MenuBar/MenuBar'
import { Dock } from '@/components/Dock/Dock'
import { Spotlight } from '@/components/Spotlight/Spotlight'
import { AppSwitcher } from '@/components/WindowManager/AppSwitcher'
import { BootScreen } from '@/components/Boot/BootScreen'
import { LockScreen } from '@/components/LockScreen/LockScreen'
import { ActivitiesOverview } from '@/components/WindowManager/ActivitiesOverview'
import { AppLauncher } from '@/components/Launcher/AppLauncher'
import { FloatingNovaAIAssistant } from '@/components/Assistant/FloatingNovaAIAssistant'
import { soundService } from '@/core/audio/soundService'
import { Power, Moon, MousePointer2 } from 'lucide-react'
import type { FSNode } from '@/core/filesystem/types'

const POSITIONS_STORAGE_KEY = 'nova_os_desktop_icon_positions_v2'

export const Desktop: React.FC = () => {
  const {
    getChildren,
    createFolder,
    createFile,
    renameNode,
    moveToTrash,
    exportFile,
  } = useFileSystem()
  const { settings, updateSettings } = useSettings()
  const { addNotification } = useNotifications()
  const {
    windows,
    openApp,
    closeActiveWindow,
    minimizeActiveWindow,
    toggleMaximizeActiveWindow,
    activeWorkspace,
    switchWorkspace,
    toggleOverview,
    toggleLauncher,
    isLocked,
    lockSystem,
    isAsleep,
    sleepSystem,
    wakeSystem,
    isShutDown,
    powerOffSystem,
    powerOnSystem,
  } = useWindowManager()

  const {
    isLocked: isPointerLocked,
    virtualPointer,
    releaseLock,
    requestLock,
  } = usePointerLock()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const saved = localStorage.getItem(POSITIONS_STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // Ignore
    }
    return {}
  })

  // Marquee selection state
  const [isMarquee, setIsMarquee] = useState(false)
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [marqueeCurrent, setMarqueeCurrent] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    items: MenuItem[]
  }>({
    visible: false,
    x: 0,
    y: 0,
    items: [],
  })

  // Spotlight state
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false)

  const desktopRef = useRef<HTMLDivElement>(null)

  // Save icon positions
  useEffect(() => {
    try {
      localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(positions))
    } catch {
      // Ignore
    }
  }, [positions])

  // Get desktop files from VFS
  const desktopNodes = getChildren('folder-desktop')

  // User Inactivity Monitoring for Automatic System Lock
  const lastActivityRef = useRef(Date.now())

  useEffect(() => {
    const registerActivity = () => {
      lastActivityRef.current = Date.now()
      if (isAsleep) {
        wakeSystem()
      }
    }

    window.addEventListener('mousemove', registerActivity, { passive: true })
    window.addEventListener('mousedown', registerActivity, { passive: true })
    window.addEventListener('keydown', registerActivity, { passive: true })
    window.addEventListener('touchstart', registerActivity, { passive: true })
    document.addEventListener('visibilitychange', registerActivity)

    const interval = setInterval(() => {
      const timeoutMins = settings.autoLockTimeout
      if (timeoutMins && timeoutMins > 0 && !isLocked && !isShutDown) {
        const elapsedMs = Date.now() - lastActivityRef.current
        const thresholdMs = timeoutMins * 60 * 1000
        if (elapsedMs >= thresholdMs) {
          lockSystem()
        }
      }
    }, 2000)

    return () => {
      window.removeEventListener('mousemove', registerActivity)
      window.removeEventListener('mousedown', registerActivity)
      window.removeEventListener('keydown', registerActivity)
      window.removeEventListener('touchstart', registerActivity)
      document.removeEventListener('visibilitychange', registerActivity)
      clearInterval(interval)
    }
  }, [settings.autoLockTimeout, isLocked, isShutDown, isAsleep, lockSystem, wakeSystem])

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If sleeping, any key press wakes system
      if (isAsleep) {
        wakeSystem()
        return
      }

      // Spotlight: Ctrl + Space or Cmd + Space
      if ((e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault()
        soundService.playClick()
        setIsSpotlightOpen((prev) => !prev)
        return
      }

      // Close Active Window: Ctrl + W
      if (e.ctrlKey && e.key.toLowerCase() === 'w') {
        e.preventDefault()
        closeActiveWindow()
        return
      }

      // Minimize Active Window: Ctrl + M
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        minimizeActiveWindow()
        return
      }

      // Toggle Fullscreen Active Window: Ctrl + Shift + F
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        toggleMaximizeActiveWindow()
        return
      }

      // Lock Screen: Ctrl + Alt + L or Ctrl + L
      if (
        (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'l') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l')
      ) {
        e.preventDefault()
        lockSystem()
        return
      }

      // Mission Control / Multitasking Overview: F3 or Ctrl + Up
      if (e.key === 'F3' || (e.ctrlKey && e.key === 'ArrowUp')) {
        e.preventDefault()
        toggleOverview()
        return
      }

      // App Launcher / Launchpad: F4 or Ctrl + Shift + A
      if (e.key === 'F4' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault()
        toggleLauncher()
        return
      }

      // Virtual Workspace Switching: Ctrl + Alt + Left/Right
      if (e.ctrlKey && e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        switchWorkspace(Math.max(1, activeWorkspace - 1))
        return
      }
      if (e.ctrlKey && e.altKey && e.key === 'ArrowRight') {
        e.preventDefault()
        switchWorkspace(Math.min(4, activeWorkspace + 1))
        return
      }

      // Escape: Release mouse capture if pointer locked; otherwise close context menus or spotlight
      if (e.key === 'Escape') {
        if (isPointerLocked) {
          releaseLock()
          return
        }
        setContextMenu((prev) => ({ ...prev, visible: false }))
        setIsSpotlightOpen(false)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [
    closeActiveWindow,
    minimizeActiveWindow,
    toggleMaximizeActiveWindow,
    lockSystem,
    toggleOverview,
    toggleLauncher,
    switchWorkspace,
    activeWorkspace,
    isPointerLocked,
    releaseLock,
    isAsleep,
    wakeSystem,
  ])

  // Compute Wallpaper Style & Fallbacks
  const activeWallpaper = useMemo(() => {
    return WALLPAPERS.find((w) => w.id === settings.wallpaperId) || WALLPAPERS[0]
  }, [settings.wallpaperId])

  const [customImageError, setCustomImageError] = useState(false)

  // Validate custom wallpaper image
  useEffect(() => {
    if (settings.customWallpaperUrl) {
      const img = new Image()
      img.onload = () => setCustomImageError(false)
      img.onerror = () => {
        setCustomImageError(true)
        addNotification('Wallpaper Notice', 'Could not load custom wallpaper. Using default wallpaper.', 'settings')
      }
      img.src = settings.customWallpaperUrl
    } else {
      setCustomImageError(false)
    }
  }, [settings.customWallpaperUrl, addNotification])

  // Wallpaper slideshow cycle
  useEffect(() => {
    const ws = settings.wallpaperSettings
    if (!ws?.slideshow || !ws?.slideshowInterval || ws.slideshowInterval <= 0) return

    const pool = ws.favorites && ws.favorites.length > 0 ? ws.favorites : WALLPAPERS.map((w) => w.id)
    if (pool.length <= 1) return

    const intervalMs = ws.slideshowInterval * 60 * 1000
    const interval = setInterval(() => {
      const currentIndex = pool.indexOf(settings.wallpaperId)
      const nextIndex = (currentIndex + 1) % pool.length
      updateSettings({ wallpaperId: pool[nextIndex], customWallpaperUrl: undefined })
    }, intervalMs)

    return () => clearInterval(interval)
  }, [settings.wallpaperSettings, settings.wallpaperId, updateSettings])

  const wallpaperStyle = useMemo<React.CSSProperties>(() => {
    const pos = settings.wallpaperSettings?.position || 'fill'
    let size = 'cover'
    let position = 'center'
    let repeat = 'no-repeat'

    if (pos === 'fit') {
      size = 'contain'
    } else if (pos === 'stretch') {
      size = '100% 100%'
    } else if (pos === 'center') {
      size = 'auto'
    } else if (pos === 'tile') {
      size = 'auto'
      position = 'top left'
      repeat = 'repeat'
    }

    if (settings.customWallpaperUrl && !customImageError) {
      return {
        backgroundColor: activeWallpaper.fallbackColor || '#090919',
        backgroundImage: `url(${settings.customWallpaperUrl})`,
        backgroundSize: size,
        backgroundPosition: position,
        backgroundRepeat: repeat,
      }
    }
    return {
      backgroundColor: activeWallpaper.fallbackColor || '#090919',
      backgroundImage: activeWallpaper.style,
      backgroundSize: size,
      backgroundPosition: position,
      backgroundRepeat: repeat,
    }
  }, [settings.customWallpaperUrl, customImageError, activeWallpaper, settings.wallpaperSettings?.position])

  // Desktop Pointer Events for Marquee Selection
  const handleDesktopPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    if ((e.target as HTMLElement) !== desktopRef.current) return

    setSelectedIds(new Set())
    setContextMenu((prev) => ({ ...prev, visible: false }))

    setIsMarquee(true)
    setMarqueeStart({ x: e.clientX, y: e.clientY })
    setMarqueeCurrent({ x: e.clientX, y: e.clientY })
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handleDesktopPointerMove = (e: React.PointerEvent) => {
    if (!isMarquee) return
    setMarqueeCurrent({ x: e.clientX, y: e.clientY })

    const left = Math.min(marqueeStart.x, e.clientX)
    const right = Math.max(marqueeStart.x, e.clientX)
    const top = Math.min(marqueeStart.y, e.clientY)
    const bottom = Math.max(marqueeStart.y, e.clientY)

    const nextSelected = new Set<string>()
    desktopNodes.forEach((node, idx) => {
      const pos = positions[node.id] || { x: 20, y: 50 + idx * 80 }
      const iconRight = pos.x + 80
      const iconBottom = pos.y + 70

      if (pos.x < right && iconRight > left && pos.y < bottom && iconBottom > top) {
        nextSelected.add(node.id)
      }
    })
    setSelectedIds(nextSelected)
  }

  const handleDesktopPointerUp = (e: React.PointerEvent) => {
    if (!isMarquee) return
    setIsMarquee(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // Ignore
    }
  }

  // Right Click on Empty Desktop Area
  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    soundService.playClick()

    const menuItems: MenuItem[] = [
      {
        label: 'New Folder',
        action: () => createFolder('folder-desktop', 'New Folder'),
      },
      {
        label: 'New Text Document',
        action: () => createFile('folder-desktop', 'Untitled.txt', ''),
      },
      { divider: true, label: '', action: () => {} },
      {
        label: 'Change Wallpaper...',
        action: () => openApp('settings'),
      },
      {
        label: 'Refresh Desktop',
        action: () => {
          soundService.playClick()
          setSelectedIds(new Set())
        },
      },
      { divider: true, label: '', action: () => {} },
      {
        label: 'Mission Control',
        shortcut: 'F3',
        action: () => toggleOverview(true),
      },
      {
        label: 'App Launcher',
        shortcut: 'Ctrl+A',
        action: () => toggleLauncher(true),
      },
      { divider: true, label: '', action: () => {} },
      {
        label: 'Open Settings...',
        action: () => openApp('settings'),
      },
      {
        label: 'Spotlight Search',
        shortcut: 'Ctrl+Space',
        action: () => setIsSpotlightOpen(true),
      },
      { divider: true, label: '', action: () => {} },
      {
        label: 'Capture Mouse (Immersive Mode)',
        shortcut: 'ESC to exit',
        action: () => requestLock(desktopRef.current, 'desktop'),
      },
      { divider: true, label: '', action: () => {} },
      {
        label: 'Lock Screen',
        shortcut: 'Ctrl+Alt+L',
        action: () => lockSystem(),
      },
      {
        label: 'Sleep',
        action: () => sleepSystem(),
      },
    ]

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      items: menuItems,
    })
  }

  // Right Click on an Icon
  const handleIconContextMenu = (node: FSNode, e: React.MouseEvent) => {
    soundService.playClick()
    const menuItems: MenuItem[] = [
      {
        label: 'Open',
        action: () => handleIconDoubleClick(node),
      },
      { divider: true, label: '', action: () => {} },
      {
        label: 'Move to Trash',
        danger: true,
        action: () => moveToTrash(node.id),
      },
    ]

    if (node.type === 'file') {
      menuItems.push({
        label: 'Export / Download',
        action: () => exportFile(node.id),
      })
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      items: menuItems,
    })
  }

  // Double Click an Icon -> Launch App or View File
  const handleIconDoubleClick = (node: FSNode) => {
    soundService.playClick()
    if (node.id === 'shortcut-drive') {
      openApp('finder')
    } else if (node.name.endsWith('.app')) {
      openApp('games')
    } else if (node.type === 'folder') {
      openApp('finder', { folderId: node.id })
    } else if (node.mimeType?.startsWith('image/') || node.name.endsWith('.svg') || node.name.endsWith('.png') || node.name.endsWith('.jpg')) {
      openApp('photos')
    } else if (node.mimeType?.startsWith('audio/') || node.name.endsWith('.synth') || node.name.endsWith('.mp3')) {
      openApp('music')
    } else {
      openApp('notes')
    }
  }

  const updateIconPosition = (id: string, x: number, y: number) => {
    setPositions((prev) => ({
      ...prev,
      [id]: { x, y },
    }))
  }

  return (
    <div
      ref={desktopRef}
      style={{
        ...wallpaperStyle,
        filter: `brightness(${settings.brightness}%)`,
      }}
      onPointerDown={handleDesktopPointerDown}
      onPointerMove={handleDesktopPointerMove}
      onPointerUp={handleDesktopPointerUp}
      onContextMenu={handleDesktopContextMenu}
      className={`fixed inset-0 w-screen h-screen overflow-hidden select-none transition-all duration-300 ${
        settings.reducedMotion ? 'reduced-motion' : ''
      }`}
    >
      {/* Top Menu Bar */}
      <MenuBar onOpenSpotlight={() => setIsSpotlightOpen(true)} />

      {/* Desktop Icons Layer (only if enabled in settings) */}
      {settings.desktopIconsVisible && (
        <div className="absolute inset-0 pt-8 pb-20 pointer-events-none">
          {desktopNodes.map((node, idx) => {
            const spacing = settings.desktopSettings?.iconSpacing || 86
            const col = Math.floor(idx / 8)
            const row = idx % 8
            const defaultPos = { x: 20 + col * spacing, y: 46 + row * (spacing - 4) }
            const pos = positions[node.id] || defaultPos
            const isSelected = selectedIds.has(node.id)

            return (
              <div key={node.id} className="pointer-events-auto">
                <DesktopIcon
                  node={node}
                  isSelected={isSelected}
                  x={pos.x}
                  y={pos.y}
                  iconSize={settings.desktopSettings?.iconSize || 'medium'}
                  labelPosition={settings.desktopSettings?.labelPosition || 'bottom'}
                  onSelect={(e) => {
                    soundService.playClick()
                    if (e.metaKey || e.ctrlKey) {
                      const next = new Set(selectedIds)
                      if (next.has(node.id)) next.delete(node.id)
                      else next.add(node.id)
                      setSelectedIds(next)
                    } else {
                      setSelectedIds(new Set([node.id]))
                    }
                  }}
                  onDoubleClick={() => handleIconDoubleClick(node)}
                  onContextMenu={(e) => handleIconContextMenu(node, e)}
                  onMove={(newX, newY) => updateIconPosition(node.id, newX, newY)}
                  onRename={(newName) => renameNode(node.id, newName)}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Desktop Floating Widgets */}
      <DesktopWidgets />

      {/* Marquee Selection Drag Box */}
      {isMarquee && (
        <SelectionBox
          startX={marqueeStart.x}
          startY={marqueeStart.y}
          currentX={marqueeCurrent.x}
          currentY={marqueeCurrent.y}
          color={settings.desktopSettings?.selectionColor || '#3b82f6'}
        />
      )}

      {/* Window Management Layer - Filtered by Virtual Desktop / Workspace */}
      <div className="absolute inset-0 pointer-events-none">
        {windows
          .filter((win) => (win.workspaceId || 1) === activeWorkspace)
          .map((win) => (
            <div key={win.id} className="pointer-events-auto">
              <WindowFrame windowState={win} />
            </div>
          ))}
      </div>

      {/* Animated Bottom Dock */}
      <Dock />

      {/* Spotlight Global Search */}
      <Spotlight isOpen={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} />

      {/* Alt + Tab App Switcher */}
      <AppSwitcher />

      {/* Mission Control Multitasking Overview */}
      <ActivitiesOverview />

      {/* Fullscreen Application Launcher */}
      <AppLauncher />

      {/* System Lock Screen */}
      <LockScreen />

      {/* System Boot Animation */}
      <BootScreen />

      {/* Night Light Warmth Filter Overlay */}
      {settings.nightLight && (
        <div
          className="pointer-events-none fixed inset-0 mix-blend-multiply z-[65] transition-opacity duration-500"
          style={{
            backgroundColor: 'rgb(245, 158, 11)',
            opacity: ((settings.nightLightTemperature || 45) / 100) * 0.45,
          }}
        />
      )}

      {/* Immersive Pointer Lock Floating HUD Indicator & Virtual Cursor */}
      {isPointerLocked && (
        <>
          {/* Top Floating HUD Banner */}
          <div className="fixed top-11 inset-x-0 flex justify-center z-[9998] pointer-events-none animate-fadeIn">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-cyan-500/40 shadow-2xl backdrop-blur-xl text-white text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Mouse Captured</span>
              <span className="text-neutral-400 text-[11px] font-mono">• Press ESC to release</span>
            </div>
          </div>

          {/* Virtual Pointer Cursor Renderer */}
          <div
            id="nova-virtual-cursor"
            style={{
              transform: `translate3d(${virtualPointer.x}px, ${virtualPointer.y}px, 0)`,
            }}
            className="fixed top-0 left-0 z-[9999] pointer-events-none transition-none"
          >
            <div className="relative -top-1 -left-1">
              <MousePointer2 className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)] fill-cyan-500/30" />
            </div>
          </div>
        </>
      )}

      {/* Global Intelligent Desktop Assistant (NOVA AI) */}
      {!isLocked && !isAsleep && !isShutDown && <FloatingNovaAIAssistant />}

      {/* Virtual Sleep Mode Screen Overlay */}
      {isAsleep && (
        <div
          onClick={wakeSystem}
          className="fixed inset-0 z-[9991] bg-black/85 backdrop-blur-3xl flex flex-col items-center justify-center select-none text-white cursor-pointer animate-fadeIn"
        >
          <Moon className="w-12 h-12 text-cyan-400 animate-pulse mb-4" />
          <h3 className="text-xl font-light tracking-wide text-neutral-200">
            NOVA OS is in Sleep Mode
          </h3>
          <p className="text-xs text-neutral-400 mt-2">Click anywhere or press any key to wake</p>
        </div>
      )}

      {/* Virtual Shutdown / Powered Off Screen */}
      {isShutDown && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center select-none text-white animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-center mb-6 shadow-2xl">
            <Power className="w-9 h-9 text-neutral-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 via-white to-neutral-400">
            NOVA OS
          </h2>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">
            System Virtual Session Powered Off
          </p>
          <button
            onClick={powerOnSystem}
            className="mt-8 flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs tracking-wider uppercase shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Start NOVA OS</span>
          </button>
        </div>
      )}

      {/* Desktop Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </div>
  )
}
