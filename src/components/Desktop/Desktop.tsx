import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { useSettings } from '@/core/settings/SettingsContext'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { WALLPAPERS } from '@/core/settings/wallpapers'
import { DesktopIcon } from './DesktopIcon'
import { SelectionBox } from './SelectionBox'
import { ContextMenu, MenuItem } from './ContextMenu'
import { WindowFrame } from '@/components/WindowManager/WindowFrame'
import { MenuBar } from '@/components/MenuBar/MenuBar'
import { Dock } from '@/components/Dock/Dock'
import { Spotlight } from '@/components/Spotlight/Spotlight'
import { AppSwitcher } from '@/components/WindowManager/AppSwitcher'
import { soundService } from '@/core/audio/soundService'
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
  const {
    windows,
    openApp,
    closeActiveWindow,
    minimizeActiveWindow,
    toggleMaximizeActiveWindow,
  } = useWindowManager()

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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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

      // Escape: Close context menus or spotlight
      if (e.key === 'Escape') {
        setContextMenu((prev) => ({ ...prev, visible: false }))
        setIsSpotlightOpen(false)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [closeActiveWindow, minimizeActiveWindow, toggleMaximizeActiveWindow])

  // Compute Wallpaper Style
  const wallpaperStyle = useMemo(() => {
    if (settings.customWallpaperUrl) {
      return {
        backgroundImage: `url(${settings.customWallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    const wp = WALLPAPERS.find((w) => w.id === settings.wallpaperId) || WALLPAPERS[0]
    return {
      background: wp.style,
      backgroundSize: 'cover',
    }
  }, [settings.wallpaperId, settings.customWallpaperUrl])

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
        label: 'Open Settings...',
        action: () => openApp('settings'),
      },
      {
        label: 'Spotlight Search',
        shortcut: 'Ctrl+Space',
        action: () => setIsSpotlightOpen(true),
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
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none transition-all duration-300"
    >
      {/* Top Menu Bar */}
      <MenuBar onOpenSpotlight={() => setIsSpotlightOpen(true)} />

      {/* Desktop Icons Layer (only if enabled in settings) */}
      {settings.desktopIconsVisible && (
        <div className="absolute inset-0 pt-8 pb-20 pointer-events-none">
          {desktopNodes.map((node, idx) => {
            const col = Math.floor(idx / 8)
            const row = idx % 8
            const defaultPos = { x: 20 + col * 90, y: 46 + row * 82 }
            const pos = positions[node.id] || defaultPos
            const isSelected = selectedIds.has(node.id)

            return (
              <div key={node.id} className="pointer-events-auto">
                <DesktopIcon
                  node={node}
                  isSelected={isSelected}
                  x={pos.x}
                  y={pos.y}
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

      {/* Marquee Selection Drag Box */}
      {isMarquee && (
        <SelectionBox
          startX={marqueeStart.x}
          startY={marqueeStart.y}
          currentX={marqueeCurrent.x}
          currentY={marqueeCurrent.y}
        />
      )}

      {/* Window Management Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {windows.map((win) => (
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
