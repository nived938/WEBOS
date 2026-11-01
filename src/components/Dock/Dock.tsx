import React, { useState, useRef, useCallback } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useSettings } from '@/core/settings/SettingsContext'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import type { AppId } from '@/types'
import { soundService } from '@/core/audio/soundService'
import { ContextMenu, MenuItem } from '@/components/Desktop/ContextMenu'
import {
  Folder,
  Globe,
  Mail,
  Calendar,
  FileText,
  Calculator,
  Image,
  Music,
  Terminal,
  Settings,
  AppWindow,
  Gamepad2,
  Trash2,
  LayoutGrid,
} from 'lucide-react'

const DOCK_APP_IDS: AppId[] = [
  'finder',
  'applibrary',
  'browser',
  'mail',
  'calendar',
  'notes',
  'calculator',
  'photos',
  'music',
  'terminal',
  'settings',
  'appstore',
  'games',
]

const APP_ICONS: Partial<Record<AppId, React.ComponentType<{ size: number; className?: string }>>> = {
  finder: Folder,
  applibrary: LayoutGrid,
  browser: Globe,
  mail: Mail,
  calendar: Calendar,
  notes: FileText,
  calculator: Calculator,
  photos: Image,
  music: Music,
  terminal: Terminal,
  settings: Settings,
  appstore: AppWindow,
  games: Gamepad2,
  trash: Trash2,
}

export const Dock: React.FC = () => {
  const { windows, runningAppIds, openApp, focusWindow, minimizeWindow, closeWindow } =
    useWindowManager()
  const { settings, updateSettings } = useSettings()
  const { getTrashNodes, emptyTrash } = useFileSystem()

  const dockCfg = settings.dockSettings || {
    position: 'bottom',
    appearance: 'liquid-glass',
    iconSize: 48,
    iconSpacing: 6,
    magnification: true,
    magnificationScale: 1.45,
    animationSpeed: 1,
    autoHide: false,
    showRunningIndicators: true,
    showLabels: false,
    showOpenWindows: true,
    recentApps: true,
    pinnedAppIds: DOCK_APP_IDS,
  }

  const [hoveredAppId, setHoveredAppId] = useState<AppId | null>(null)
  const [mouseX, setMouseX] = useState<number | null>(null)
  const [mouseY, setMouseY] = useState<number | null>(null)
  const [isDockHovered, setIsDockHovered] = useState(false)
  const [draggedAppId, setDraggedAppId] = useState<AppId | null>(null)

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
  const dockRef = useRef<HTMLDivElement>(null)

  const trashCount = getTrashNodes().length

  const handleAppContextMenu = (appId: AppId, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    soundService.playClick()

    const openWin = windows.find((w) => w.appId === appId)
    const appDef = APPS_REGISTRY[appId]
    const items: MenuItem[] = []

    if (openWin) {
      items.push({
        label: `Bring to Front`,
        action: () => focusWindow(openWin.id),
      })
      if (!openWin.isMinimized) {
        items.push({
          label: 'Minimize',
          action: () => minimizeWindow(openWin.id),
        })
      } else {
        items.push({
          label: 'Restore',
          action: () => focusWindow(openWin.id),
        })
      }
      items.push({ divider: true, label: '', action: () => {} })
      items.push({
        label: `Quit ${appDef?.title || 'App'}`,
        danger: true,
        action: () => closeWindow(openWin.id),
      })
    } else {
      items.push({
        label: `Open ${appDef?.title || 'App'}`,
        action: () => openApp(appId),
      })
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY - 120,
      items,
    })
  }

  const handleTrashContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    soundService.playClick()

    const openWin = windows.find((w) => w.appId === 'trash')
    const items: MenuItem[] = [
      {
        label: 'Open Trash',
        action: () => (openWin ? focusWindow(openWin.id) : openApp('trash')),
      },
      {
        label: 'Empty Trash',
        disabled: trashCount === 0,
        danger: true,
        action: () => {
          soundService.playTrashEmpty()
          emptyTrash()
        },
      },
    ]

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY - 80,
      items,
    })
  }

  // Base icon size depending on settings
  const baseSize = dockCfg.iconSize || (settings.dockSize === 'small' ? 42 : settings.dockSize === 'large' ? 56 : 48)
  const isVertical = dockCfg.position === 'left' || dockCfg.position === 'right'

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!settings.dockMagnification && !dockCfg.magnification) return
    setMouseX(e.clientX)
    setMouseY(e.clientY)
  }

  const handleMouseLeave = () => {
    setMouseX(null)
    setMouseY(null)
    setHoveredAppId(null)
    setIsDockHovered(false)
  }

  const handleAppClick = (appId: AppId) => {
    soundService.playClick()
    const existingWin = windows.find((w) => w.appId === appId)
    if (existingWin) {
      if (existingWin.isMinimized) {
        focusWindow(existingWin.id)
      } else if (existingWin.isFocused) {
        minimizeWindow(existingWin.id)
      } else {
        focusWindow(existingWin.id)
      }
    } else {
      openApp(appId)
    }
  }

  // Drag and drop reordering of pinned apps
  const handleDragStart = (appId: AppId) => {
    setDraggedAppId(appId)
  }

  const handleDragOver = (e: React.DragEvent, targetAppId: AppId) => {
    e.preventDefault()
    if (!draggedAppId || draggedAppId === targetAppId) return

    const currentList = dockCfg.pinnedAppIds || DOCK_APP_IDS
    const fromIdx = currentList.indexOf(draggedAppId)
    const toIdx = currentList.indexOf(targetAppId)
    if (fromIdx !== -1 && toIdx !== -1) {
      const updated = [...currentList]
      updated.splice(fromIdx, 1)
      updated.splice(toIdx, 0, draggedAppId)
      updateSettings({
        dockSettings: {
          ...dockCfg,
          pinnedAppIds: updated,
        },
      })
    }
  }

  // Resolve dock appearance classes & styles
  let dockAppearanceClass = 'bg-neutral-900/60 dark:bg-black/50 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
  let dockInlineStyle: React.CSSProperties = {}

  if (dockCfg.appearance === 'liquid-glass') {
    dockInlineStyle = {
      backdropFilter: 'var(--glass-backdrop-filter, blur(28px) saturate(140%))',
      WebkitBackdropFilter: 'var(--glass-backdrop-filter, blur(28px) saturate(140%))',
      background: 'var(--glass-bg, rgba(16, 18, 28, 0.65))',
      border: 'var(--glass-border, 1px solid rgba(255, 255, 255, 0.18))',
      boxShadow: 'var(--glass-shadow, 0 20px 50px rgba(0, 0, 0, 0.5))',
      borderRadius: 'var(--glass-radius, 24px)',
    }
  } else if (dockCfg.appearance === 'transparent') {
    dockAppearanceClass = 'bg-transparent border-transparent shadow-none backdrop-blur-none'
  } else if (dockCfg.appearance === 'frosted') {
    dockAppearanceClass = 'bg-white/10 dark:bg-black/30 backdrop-blur-3xl border border-white/25 shadow-2xl rounded-3xl'
  } else if (dockCfg.appearance === 'solid') {
    dockAppearanceClass = 'bg-neutral-900 border border-neutral-700 shadow-2xl rounded-2xl backdrop-blur-none'
  } else if (dockCfg.appearance === 'minimal') {
    dockAppearanceClass = 'bg-black/30 border border-white/10 rounded-xl shadow-md backdrop-blur-md'
  }

  // Wrapper positioning
  let wrapperPositionClass = 'fixed bottom-2 inset-x-0 flex justify-center z-40'
  let autoHideTransformClass = 'translate-y-0'
  if (dockCfg.position === 'left') {
    wrapperPositionClass = 'fixed left-2 inset-y-0 flex items-center z-40'
    autoHideTransformClass = dockCfg.autoHide && !isDockHovered ? '-translate-x-24' : 'translate-x-0'
  } else if (dockCfg.position === 'right') {
    wrapperPositionClass = 'fixed right-2 inset-y-0 flex items-center z-40'
    autoHideTransformClass = dockCfg.autoHide && !isDockHovered ? 'translate-x-24' : 'translate-x-0'
  } else {
    autoHideTransformClass = (settings.dockAutoHide || dockCfg.autoHide) && !isDockHovered ? 'translate-y-24' : 'translate-y-0'
  }

  const appsList = dockCfg.pinnedAppIds && dockCfg.pinnedAppIds.length > 0 ? dockCfg.pinnedAppIds : DOCK_APP_IDS

  return (
    <div
      onMouseEnter={() => setIsDockHovered(true)}
      className={`${wrapperPositionClass} transition-transform duration-300 pointer-events-none ${autoHideTransformClass}`}
    >
      <div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          ...dockInlineStyle,
          gap: `${dockCfg.iconSpacing || 6}px`,
        }}
        className={`pointer-events-auto flex ${
          isVertical ? 'flex-col items-center px-2 py-3' : 'items-end px-3 py-2'
        } ${dockAppearanceClass} transition-all duration-150`}
      >
        {/* Render Apps List */}
        {appsList.map((appId) => {
          const appDef = APPS_REGISTRY[appId]
          const isRunning = runningAppIds.includes(appId)
          const isOpenWin = windows.find((w) => w.appId === appId)
          const isFocused = isOpenWin?.isFocused
          const IconComp = APP_ICONS[appId] || Folder

          return (
            <div
              key={appId}
              draggable
              onDragStart={() => handleDragStart(appId)}
              onDragOver={(e) => handleDragOver(e, appId)}
              onClick={() => handleAppClick(appId)}
              onContextMenu={(e) => handleAppContextMenu(appId, e)}
              onMouseEnter={() => setHoveredAppId(appId)}
              className="relative flex flex-col items-center group cursor-pointer"
            >
              {/* Tooltip */}
              {hoveredAppId === appId && !dockCfg.showLabels && (
                <div
                  className={`absolute ${
                    isVertical
                      ? dockCfg.position === 'left'
                        ? 'left-full ml-2'
                        : 'right-full mr-2'
                      : '-top-9'
                  } px-2.5 py-1 rounded-lg bg-neutral-900/90 text-white text-[11px] font-medium border border-white/10 shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 pointer-events-none z-50`}
                >
                  {appDef?.title || appId}
                </div>
              )}

              {/* Icon Container */}
              <div
                style={{
                  width: `${baseSize}px`,
                  height: `${baseSize}px`,
                }}
                className={`relative rounded-2xl bg-gradient-to-tr ${
                  appDef?.gradient || 'from-blue-500 to-indigo-600'
                } flex items-center justify-center shadow-lg transition-transform duration-100 ease-out hover:scale-110 active:scale-95 ${
                  isVertical ? 'group-hover:translate-x-1' : 'group-hover:-translate-y-1'
                }`}
              >
                <IconComp size={baseSize * 0.52} className="text-white drop-shadow-sm" />
              </div>

              {/* Application Label */}
              {dockCfg.showLabels && (
                <span className="text-[10px] text-white/90 font-medium truncate max-w-[60px] text-center mt-0.5">
                  {appDef?.title || appId}
                </span>
              )}

              {/* Running dot indicator */}
              {dockCfg.showRunningIndicators && (
                <div className="h-1.5 flex items-center justify-center mt-1">
                  {isRunning && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isFocused ? 'bg-white shadow-[0_0_6px_#fff]' : 'bg-white/50'
                      }`}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Divider */}
        <div
          className={`${
            isVertical ? 'h-px w-9 my-1' : 'w-px h-9 mx-1'
          } bg-white/15 self-center`}
        />

        {/* Trash App Icon */}
        <div
          onClick={() => handleAppClick('trash')}
          onContextMenu={handleTrashContextMenu}
          onMouseEnter={() => setHoveredAppId('trash')}
          className="relative flex flex-col items-center group cursor-pointer"
        >
          {hoveredAppId === 'trash' && !dockCfg.showLabels && (
            <div
              className={`absolute ${
                isVertical
                  ? dockCfg.position === 'left'
                    ? 'left-full ml-2'
                    : 'right-full mr-2'
                  : '-top-9'
              } px-2.5 py-1 rounded-lg bg-neutral-900/90 text-white text-[11px] font-medium border border-white/10 shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 pointer-events-none z-50`}
            >
              Trash {trashCount > 0 ? `(${trashCount})` : '(Empty)'}
            </div>
          )}

          <div
            style={{
              width: `${baseSize}px`,
              height: `${baseSize}px`,
            }}
            className={`relative rounded-2xl bg-gradient-to-tr from-neutral-700 to-neutral-800 flex items-center justify-center shadow-lg transition-transform duration-100 ease-out hover:scale-110 active:scale-95 ${
              isVertical ? 'group-hover:translate-x-1' : 'group-hover:-translate-y-1'
            } border border-white/10`}
          >
            <Trash2
              size={baseSize * 0.52}
              className={trashCount > 0 ? 'text-amber-300' : 'text-neutral-400'}
            />
          </div>

          {dockCfg.showLabels && (
            <span className="text-[10px] text-white/90 font-medium truncate max-w-[60px] text-center mt-0.5">
              Trash
            </span>
          )}

          {dockCfg.showRunningIndicators && (
            <div className="h-1.5 flex items-center justify-center mt-1">
              {runningAppIds.includes('trash') && (
                <span className="w-1 h-1 rounded-full bg-white/50" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dock Right-Click Context Menu */}
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
