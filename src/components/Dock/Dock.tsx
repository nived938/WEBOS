import React, { useState, useRef, useCallback } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useSettings } from '@/core/settings/SettingsContext'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import type { AppId } from '@/types'
import { soundService } from '@/core/audio/soundService'
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
  const { windows, runningAppIds, openApp, focusWindow, minimizeWindow } = useWindowManager()
  const { settings } = useSettings()
  const { getTrashNodes } = useFileSystem()

  const [hoveredAppId, setHoveredAppId] = useState<AppId | null>(null)
  const [mouseX, setMouseX] = useState<number | null>(null)
  const [isDockHovered, setIsDockHovered] = useState(false)
  const dockRef = useRef<HTMLDivElement>(null)

  const trashCount = getTrashNodes().length

  // Base icon size depending on settings
  const baseSize = settings.dockSize === 'small' ? 42 : settings.dockSize === 'large' ? 56 : 48

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!settings.dockMagnification) return
    setMouseX(e.clientX)
  }

  const handleMouseLeave = () => {
    setMouseX(null)
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
        // Optional toggle minimize
        minimizeWindow(existingWin.id)
      } else {
        focusWindow(existingWin.id)
      }
    } else {
      openApp(appId)
    }
  }

  // Calculate magnification scale for an icon
  const getScale = (iconCenterX: number | null): number => {
    if (!settings.dockMagnification || mouseX === null || iconCenterX === null) {
      return 1
    }
    const dist = Math.abs(mouseX - iconCenterX)
    const maxDist = 120
    if (dist > maxDist) return 1
    // Smooth cosine bell curve
    const factor = Math.cos((dist / maxDist) * (Math.PI / 2))
    return 1 + 0.45 * factor
  }

  return (
    <div
      onMouseEnter={() => setIsDockHovered(true)}
      className={`fixed bottom-2 inset-x-0 flex justify-center z-40 transition-transform duration-300 pointer-events-none ${
        settings.dockAutoHide && !isDockHovered ? 'translate-y-20' : 'translate-y-0'
      }`}
    >
      <div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="pointer-events-auto flex items-end gap-1.5 px-3 py-2 bg-neutral-900/60 dark:bg-black/50 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-150"
      >
        {/* Main 12 Apps */}
        {DOCK_APP_IDS.map((appId) => {
          const appDef = APPS_REGISTRY[appId]
          const isRunning = runningAppIds.includes(appId)
          const isOpenWin = windows.find((w) => w.appId === appId)
          const isFocused = isOpenWin?.isFocused
          const IconComp = APP_ICONS[appId] || Folder

          return (
            <div
              key={appId}
              onClick={() => handleAppClick(appId)}
              onMouseEnter={() => setHoveredAppId(appId)}
              className="relative flex flex-col items-center group cursor-pointer"
            >
              {/* Tooltip */}
              {hoveredAppId === appId && (
                <div className="absolute -top-9 px-2.5 py-1 rounded-lg bg-neutral-900/90 text-white text-[11px] font-medium border border-white/10 shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
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
                } flex items-center justify-center shadow-lg transition-transform duration-100 ease-out hover:scale-110 active:scale-95 group-hover:-translate-y-1`}
              >
                <IconComp size={baseSize * 0.52} className="text-white drop-shadow-sm" />
              </div>

              {/* Running dot indicator */}
              <div className="h-1.5 flex items-center justify-center mt-1">
                {isRunning && (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isFocused ? 'bg-white shadow-[0_0_6px_#fff]' : 'bg-white/50'
                    }`}
                  />
                )}
              </div>
            </div>
          )
        })}

        {/* Divider */}
        <div className="w-px h-9 bg-white/15 mx-1 self-center" />

        {/* Trash App Icon */}
        <div
          onClick={() => handleAppClick('trash')}
          onMouseEnter={() => setHoveredAppId('trash')}
          className="relative flex flex-col items-center group cursor-pointer"
        >
          {hoveredAppId === 'trash' && (
            <div className="absolute -top-9 px-2.5 py-1 rounded-lg bg-neutral-900/90 text-white text-[11px] font-medium border border-white/10 shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
              Trash {trashCount > 0 ? `(${trashCount})` : '(Empty)'}
            </div>
          )}

          <div
            style={{
              width: `${baseSize}px`,
              height: `${baseSize}px`,
            }}
            className="relative rounded-2xl bg-gradient-to-tr from-neutral-700 to-neutral-800 flex items-center justify-center shadow-lg transition-transform duration-100 ease-out hover:scale-110 active:scale-95 group-hover:-translate-y-1 border border-white/10"
          >
            <Trash2
              size={baseSize * 0.52}
              className={trashCount > 0 ? 'text-amber-300' : 'text-neutral-400'}
            />
          </div>

          <div className="h-1.5 flex items-center justify-center mt-1">
            {runningAppIds.includes('trash') && (
              <span className="w-1 h-1 rounded-full bg-white/50" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
