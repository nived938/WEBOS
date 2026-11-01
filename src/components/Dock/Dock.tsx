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
  Pin,
  X,
  ExternalLink,
} from 'lucide-react'

const DOCK_APP_IDS: AppId[] = [
  'applibrary',
  'finder',
  'browser',
  'appstore',
  'terminal',
  'codestudio',
  'notes',
  'calculator',
  'photos',
  'music',
  'settings',
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
    position: 'left',
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

    const openWins = windows.filter((w) => w.appId === appId)
    const appDef = APPS_REGISTRY[appId]
    const currentList = dockCfg.pinnedAppIds || DOCK_APP_IDS
    const isPinned = currentList.includes(appId)

    const items: MenuItem[] = []

    if (openWins.length > 0) {
      items.push({
        label: `Bring to Front (${openWins.length})`,
        action: () => focusWindow(openWins[0].id),
      })
      items.push({
        label: 'Open New Window',
        action: () => openApp(appId),
      })
      items.push({
        label: 'Close All Windows',
        danger: true,
        action: () => openWins.forEach((w) => closeWindow(w.id)),
      })
    } else {
      items.push({
        label: `Open ${appDef?.title || appId}`,
        action: () => openApp(appId),
      })
    }

    items.push({ divider: true, label: '', action: () => {} })

    // Pin / Unpin toggle
    items.push({
      label: isPinned ? 'Unpin from Dock' : 'Pin to Dock',
      action: () => {
        const nextPinned = isPinned
          ? currentList.filter((id) => id !== appId)
          : [...currentList, appId]
        updateSettings({
          dockSettings: {
            ...dockCfg,
            pinnedAppIds: nextPinned,
          },
        })
      },
    })

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

  const baseSize = dockCfg.iconSize || 48
  const isVertical = dockCfg.position === 'left' || dockCfg.position === 'right'

  const handleAppClick = (appId: AppId) => {
    soundService.playClick()
    const existingWins = windows.filter((w) => w.appId === appId)
    if (existingWins.length > 0) {
      const win = existingWins[0]
      if (win.isMinimized) {
        focusWindow(win.id)
      } else if (win.isFocused) {
        minimizeWindow(win.id)
      } else {
        focusWindow(win.id)
      }
    } else {
      openApp(appId)
    }
  }

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

  // Wrapper positioning
  let wrapperPositionClass = 'fixed bottom-2 inset-x-0 flex justify-center z-40'
  let autoHideTransformClass = 'translate-y-0'
  if (dockCfg.position === 'left') {
    wrapperPositionClass = 'fixed left-2 inset-y-0 flex items-center z-40'
    autoHideTransformClass =
      dockCfg.autoHide && !isDockHovered ? '-translate-x-24' : 'translate-x-0'
  } else if (dockCfg.position === 'right') {
    wrapperPositionClass = 'fixed right-2 inset-y-0 flex items-center z-40'
    autoHideTransformClass =
      dockCfg.autoHide && !isDockHovered ? 'translate-x-24' : 'translate-x-0'
  } else {
    autoHideTransformClass =
      (settings.dockAutoHide || dockCfg.autoHide) && !isDockHovered
        ? 'translate-y-24'
        : 'translate-y-0'
  }

  const appsList =
    dockCfg.pinnedAppIds && dockCfg.pinnedAppIds.length > 0
      ? dockCfg.pinnedAppIds
      : DOCK_APP_IDS

  // Find open windows for hovered app for window preview
  const hoveredWindows = hoveredAppId ? windows.filter((w) => w.appId === hoveredAppId) : []

  return (
    <div
      onMouseEnter={() => setIsDockHovered(true)}
      className={`${wrapperPositionClass} transition-transform duration-300 pointer-events-none ${autoHideTransformClass}`}
    >
      <div
        ref={dockRef}
        onMouseLeave={() => {
          setHoveredAppId(null)
          setIsDockHovered(false)
        }}
        style={{
          backdropFilter: 'blur(28px) saturate(140%)',
          WebkitBackdropFilter: 'blur(28px) saturate(140%)',
          background: 'rgba(16, 18, 28, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          borderRadius: '24px',
          gap: `${dockCfg.iconSpacing || 6}px`,
        }}
        className={`pointer-events-auto flex ${
          isVertical ? 'flex-col items-center px-2 py-3' : 'items-end px-3 py-2'
        } transition-all duration-150`}
      >
        {/* Render Apps List */}
        {appsList.map((appId) => {
          const appDef = APPS_REGISTRY[appId]
          const isRunning = runningAppIds.includes(appId)
          const openWins = windows.filter((w) => w.appId === appId)
          const isFocused = openWins.some((w) => w.isFocused)
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
              {/* Hover Window Previews or Tooltip */}
              {hoveredAppId === appId && (
                <div
                  className={`absolute ${
                    isVertical
                      ? dockCfg.position === 'left'
                        ? 'left-full ml-3'
                        : 'right-full mr-3'
                      : '-top-32'
                  } z-50 pointer-events-auto`}
                >
                  {openWins.length > 0 ? (
                    /* Running Window Thumbnail Previews on Hover */
                    <div className="bg-neutral-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-100">
                      <div className="flex items-center justify-between text-xs font-semibold text-white pb-1 border-b border-white/10">
                        <span>{appDef?.title || appId}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {openWins.length} window{openWins.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {openWins.map((win) => (
                          <div
                            key={win.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              focusWindow(win.id)
                            }}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 flex items-center justify-between text-xs transition-colors"
                          >
                            <span className="truncate max-w-[140px] text-neutral-200">
                              {win.title}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                closeWindow(win.id)
                              }}
                              className="text-neutral-500 hover:text-red-400 p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Simple Name Tooltip */
                    <div className="px-2.5 py-1 rounded-lg bg-neutral-900/90 text-white text-[11px] font-medium border border-white/10 shadow-lg whitespace-nowrap">
                      {appDef?.title || appId}
                    </div>
                  )}
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

              {/* Running dot/line indicator */}
              {dockCfg.showRunningIndicators && (
                <div className="h-1.5 flex items-center justify-center mt-1">
                  {isRunning && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isFocused ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-white/60'
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
                    ? 'left-full ml-3'
                    : 'right-full mr-3'
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

          {dockCfg.showRunningIndicators && (
            <div className="h-1.5 flex items-center justify-center mt-1">
              {runningAppIds.includes('trash') && (
                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
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
