import { createContext, useContext } from 'react'
import type { SystemSettings, AccentColor } from '@/types'
import { DEFAULT_LIQUID_GLASS } from '@/core/theme/liquidGlass'
import { DEFAULT_CURSOR_SETTINGS } from '@/core/theme/cursorEngine'

export const SETTINGS_STORAGE_KEY = 'nova_os_settings_v2'

export const DEFAULT_SETTINGS: SystemSettings = {
  theme: 'dark',
  accentColor: 'blue',
  activeThemeId: 'nova-dark',
  customThemes: [],
  wallpaperId: 'nova-aurora',
  dockSize: 'medium',
  dockMagnification: true,
  dockAutoHide: false,
  desktopIconsVisible: true,
  soundEffects: true,
  volume: 0.8,
  brightness: 100,
  reducedMotion: false,
  doNotDisturb: false,
  wifiEnabled: true,
  bluetoothEnabled: true,
  cursorStyle: 'default',
  cursorSettings: DEFAULT_CURSOR_SETTINGS,
  performanceMode: 'high',
  nightLight: false,
  nightLightTemperature: 45,
  lockScreenEnabled: false,
  lockPin: undefined,
  username: 'Commander Nova',
  bootAnimation: true,
  activeWorkspace: 1,
  uiSoundsVolume: 0.8,
  // Advanced Lock Screen & User Profile
  lockWallpaperId: 'nova-aurora',
  lockWallpaperType: 'dynamic',
  userAvatar: 'avatar-nova',
  userBio: 'Cosmic Navigator & System Architect',
  userGreeting: 'Welcome back to NOVA OS',
  profileAccentColor: 'blue',
  pinHash: undefined,
  pinSalt: undefined,
  isPinSet: false,
  recoveryKey: undefined,
  autoLockTimeout: 5,
  immersiveModeEnabled: false,
  // Extended Personalization Subsystems
  liquidGlass: DEFAULT_LIQUID_GLASS,
  wallpaperSettings: {
    position: 'fill',
    slideshow: false,
    slideshowInterval: 0,
    liveAnimated: true,
    favorites: ['nova-aurora', 'deep-space', 'cosmic-purple'],
  },
  dockSettings: {
    position: 'bottom',
    appearance: 'liquid-glass',
    iconSize: 48,
    iconSpacing: 6,
    magnification: true,
    magnificationScale: 1.45,
    animationSpeed: 1,
    autoHide: false,
    showRunningIndicators: true,
    showLabels: true,
    showOpenWindows: true,
    recentApps: true,
    pinnedAppIds: [
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
    ],
  },
  desktopSettings: {
    iconSize: 'medium',
    iconSpacing: 86,
    labelPosition: 'bottom',
    gridSnap: true,
    autoArrange: true,
    selectionColor: '#3b82f6',
    showIcons: true,
  },
  desktopWidgets: [
    {
      id: 'widget-clock',
      type: 'clock',
      title: 'Cosmic Clock',
      enabled: true,
      x: typeof window !== 'undefined' && window.innerWidth ? Math.max(20, window.innerWidth - 300) : 1000,
      y: 40,
    },
    {
      id: 'widget-system',
      type: 'system',
      title: 'Neural Engine Monitor',
      enabled: true,
      x: typeof window !== 'undefined' && window.innerWidth ? Math.max(20, window.innerWidth - 300) : 1000,
      y: 200,
    },
    {
      id: 'widget-weather',
      type: 'weather',
      title: 'Orbital Weather',
      enabled: true,
      x: typeof window !== 'undefined' && window.innerWidth ? Math.max(20, window.innerWidth - 300) : 1000,
      y: 350,
    },
  ],
  windowManagerSettings: {
    snapEnabled: true,
    minimizeEffect: 'genie',
    shadowDepth: 65,
    titlebarStyle: 'mac',
    doubleClickAction: 'maximize',
  },
  panelSettings: {
    clockFormat: '12h',
    showSeconds: false,
    showBattery: true,
    showWifi: true,
    showSound: true,
    showUser: true,
    blurDepth: 24,
  },
  animationSettings: {
    speed: 1,
    windowTransitions: true,
    dockBounce: true,
    particleEffects: true,
  },
  accessibilitySettings: {
    highContrast: false,
    textScale: 100,
    grayscale: false,
    focusOutlines: false,
  },
}

/**
 * Migration helper to ensure backwards compatibility with previous versions of nova_os_settings_v2
 */
export function migrateSettings(savedData: unknown): SystemSettings {
  if (!savedData || typeof savedData !== 'object') {
    return { ...DEFAULT_SETTINGS }
  }

  const raw = savedData as Partial<SystemSettings>

  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    // Ensure numerical boundaries
    volume: typeof raw.volume === 'number' ? Math.max(0, Math.min(1, raw.volume)) : DEFAULT_SETTINGS.volume,
    brightness: typeof raw.brightness === 'number' ? Math.max(30, Math.min(100, raw.brightness)) : DEFAULT_SETTINGS.brightness,
    nightLightTemperature: typeof raw.nightLightTemperature === 'number' ? Math.max(0, Math.min(100, raw.nightLightTemperature)) : DEFAULT_SETTINGS.nightLightTemperature,
    activeWorkspace: typeof raw.activeWorkspace === 'number' ? Math.max(1, Math.min(4, raw.activeWorkspace)) : 1,
    autoLockTimeout: [0, 1, 2, 5, 10, 15, 30].includes(raw.autoLockTimeout as any)
      ? raw.autoLockTimeout!
      : DEFAULT_SETTINGS.autoLockTimeout,
    // Validate string enums
    theme: ['dark', 'light', 'auto'].includes(raw.theme as any)
      ? raw.theme!
      : DEFAULT_SETTINGS.theme,
    accentColor: ['blue', 'purple', 'emerald', 'orange', 'rose', 'amber'].includes(raw.accentColor as any)
      ? raw.accentColor!
      : DEFAULT_SETTINGS.accentColor,
    dockSize: ['small', 'medium', 'large'].includes(raw.dockSize as any)
      ? raw.dockSize!
      : DEFAULT_SETTINGS.dockSize,
    cursorStyle: ['default', 'glow-cyan', 'amber-retro', 'cyberpunk', 'precision'].includes(raw.cursorStyle as any)
      ? raw.cursorStyle!
      : DEFAULT_SETTINGS.cursorStyle,
    performanceMode: ['high', 'balanced', 'low'].includes(raw.performanceMode as any)
      ? raw.performanceMode!
      : DEFAULT_SETTINGS.performanceMode,
    lockWallpaperType: ['gradient', 'dynamic', 'custom', 'animated'].includes(raw.lockWallpaperType as any)
      ? raw.lockWallpaperType!
      : DEFAULT_SETTINGS.lockWallpaperType,
    // Security: Eradicate default '1234' PIN bypass and sanitize plaintext credentials
    pinHash:
      raw.pinHash === 'zCmGySHLDbMjVX0mmBE7glaztl6f0OcUBD5e0Vt54bA=' || raw.lockPin === '1234'
        ? undefined
        : raw.pinHash,
    pinSalt:
      raw.pinHash === 'zCmGySHLDbMjVX0mmBE7glaztl6f0OcUBD5e0Vt54bA=' || raw.lockPin === '1234'
        ? undefined
        : raw.pinSalt,
    recoveryKey:
      raw.pinHash === 'zCmGySHLDbMjVX0mmBE7glaztl6f0OcUBD5e0Vt54bA=' || raw.lockPin === '1234'
        ? undefined
        : raw.recoveryKey,
    isPinSet:
      raw.pinHash === 'zCmGySHLDbMjVX0mmBE7glaztl6f0OcUBD5e0Vt54bA=' || raw.lockPin === '1234'
        ? false
        : Boolean(raw.isPinSet && raw.pinHash && raw.pinSalt),
    lockScreenEnabled:
      raw.pinHash === 'zCmGySHLDbMjVX0mmBE7glaztl6f0OcUBD5e0Vt54bA=' || raw.lockPin === '1234'
        ? false
        : Boolean(raw.lockScreenEnabled && raw.isPinSet),
    lockPin: undefined, // Never store plaintext PIN
    // Ensure sub-objects merge safely
    liquidGlass: {
      ...DEFAULT_SETTINGS.liquidGlass,
      ...(raw.liquidGlass || {}),
    },
    cursorSettings: {
      ...DEFAULT_SETTINGS.cursorSettings,
      ...(raw.cursorSettings || {}),
    },
    wallpaperSettings: {
      ...DEFAULT_SETTINGS.wallpaperSettings,
      ...(raw.wallpaperSettings || {}),
    },
    dockSettings: {
      ...DEFAULT_SETTINGS.dockSettings,
      ...(raw.dockSettings || {}),
    },
    desktopSettings: {
      ...DEFAULT_SETTINGS.desktopSettings,
      ...(raw.desktopSettings || {}),
    },
    desktopWidgets: Array.isArray(raw.desktopWidgets) && raw.desktopWidgets.length > 0
      ? raw.desktopWidgets
      : DEFAULT_SETTINGS.desktopWidgets,
    windowManagerSettings: {
      ...DEFAULT_SETTINGS.windowManagerSettings,
      ...(raw.windowManagerSettings || {}),
    },
    panelSettings: {
      ...DEFAULT_SETTINGS.panelSettings,
      ...(raw.panelSettings || {}),
    },
    animationSettings: {
      ...DEFAULT_SETTINGS.animationSettings,
      ...(raw.animationSettings || {}),
    },
    accessibilitySettings: {
      ...DEFAULT_SETTINGS.accessibilitySettings,
      ...(raw.accessibilitySettings || {}),
    },
    customThemes: Array.isArray(raw.customThemes) ? raw.customThemes : [],
  }
}

export const ACCENT_COLORS: Record<AccentColor, { primary: string; hover: string; subtle: string; rgb: string }> = {
  blue: {
    primary: '#3b82f6',
    hover: '#2563eb',
    subtle: 'rgba(59, 130, 246, 0.15)',
    rgb: '59, 130, 246',
  },
  purple: {
    primary: '#8b5cf6',
    hover: '#7c3aed',
    subtle: 'rgba(139, 92, 246, 0.15)',
    rgb: '139, 92, 246',
  },
  emerald: {
    primary: '#10b981',
    hover: '#059669',
    subtle: 'rgba(16, 185, 129, 0.15)',
    rgb: '16, 185, 129',
  },
  orange: {
    primary: '#f97316',
    hover: '#ea580c',
    subtle: 'rgba(249, 115, 22, 0.15)',
    rgb: '249, 115, 22',
  },
  rose: {
    primary: '#f43f5e',
    hover: '#e11d48',
    subtle: 'rgba(244, 63, 94, 0.15)',
    rgb: '244, 63, 94',
  },
  amber: {
    primary: '#f59e0b',
    hover: '#d97706',
    subtle: 'rgba(245, 158, 11, 0.15)',
    rgb: '245, 158, 11',
  },
}

export interface SettingsContextType {
  settings: SystemSettings
  updateSettings: (partial: Partial<SystemSettings>) => void
  resetSettings: () => void
  toggleTheme: () => void
  accentConfig: { primary: string; hover: string; subtle: string; rgb: string }
}

export const SettingsContext = createContext<SettingsContextType | null>(null)

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
