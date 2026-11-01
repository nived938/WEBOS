import { createContext, useContext } from 'react'
import type { SystemSettings, AccentColor } from '@/types'

export const SETTINGS_STORAGE_KEY = 'nova_os_settings_v2'

export const DEFAULT_SETTINGS: SystemSettings = {
  theme: 'dark',
  accentColor: 'blue',
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
  performanceMode: 'high',
  nightLight: false,
  nightLightTemperature: 45,
  lockScreenEnabled: true,
  lockPin: '1234',
  username: 'Commander Nova',
  bootAnimation: true,
  activeWorkspace: 1,
  uiSoundsVolume: 0.8,
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
