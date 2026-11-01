import type { AppId } from '@/types'

export interface WindowBounds {
  x: number
  y: number
  width: number
  height: number
}

export type SnapPosition = 'left' | 'right' | 'top' | 'none'

export interface WindowState {
  id: string
  appId: AppId
  title: string
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  isMinimized: boolean
  isMaximized: boolean
  isFocused: boolean
  zIndex: number
  workspaceId: number
  prevBounds?: WindowBounds
  snapPosition?: SnapPosition
  initialArgs?: Record<string, unknown>
}

export interface WindowManagerContextType {
  windows: WindowState[]
  activeWindow: WindowState | null
  runningAppIds: AppId[]
  openApp: (appId: AppId, args?: Record<string, unknown>) => string
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  focusWindow: (id: string) => void
  updateWindowBounds: (id: string, bounds: Partial<WindowBounds>) => void
  snapWindow: (id: string, snap: SnapPosition) => void
  closeActiveWindow: () => void
  minimizeActiveWindow: () => void
  toggleMaximizeActiveWindow: () => void
  // Virtual Desktops & Workspaces
  activeWorkspace: number
  switchWorkspace: (workspaceId: number) => void
  moveWindowToWorkspace: (windowId: string, workspaceId: number) => void
  // Mission Control & Multitasking Overview
  isOverviewOpen: boolean
  toggleOverview: (open?: boolean) => void
  // Application Launcher / Launchpad
  isLauncherOpen: boolean
  toggleLauncher: (open?: boolean) => void
  // Lock Screen & Session Management
  isLocked: boolean
  lockSystem: () => void
  unlockSystem: (pin?: string) => Promise<boolean>
  // Virtual Power Management (Sleep, Restart, Power Off)
  isAsleep: boolean
  sleepSystem: () => void
  wakeSystem: () => void
  isShutDown: boolean
  powerOffSystem: () => void
  powerOnSystem: () => void
  // System Boot Animation Lifecycle
  isBooting: boolean
  rebootSystem: () => void
  completeBoot: () => void
}
