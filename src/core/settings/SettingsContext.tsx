import React, { createContext, useContext, useEffect, useState } from 'react'
import type { SystemSettings, ThemeMode, AccentColor } from '@/types'
import { soundService } from '@/core/audio/soundService'

const SETTINGS_STORAGE_KEY = 'nova_os_settings_v2'

const DEFAULT_SETTINGS: SystemSettings = {
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
}

const ACCENT_COLORS: Record<AccentColor, { primary: string; hover: string; subtle: string; rgb: string }> = {
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

interface SettingsContextType {
  settings: SystemSettings
  updateSettings: (partial: Partial<SystemSettings>) => void
  resetSettings: () => void
  toggleTheme: () => void
  accentConfig: { primary: string; hover: string; subtle: string; rgb: string }
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_SETTINGS
  })

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Ignore
    }
  }, [settings])

  // Sync to audio service
  useEffect(() => {
    soundService.setVolume(settings.volume)
    soundService.setMuted(!settings.soundEffects)
  }, [settings.volume, settings.soundEffects])

  // Sync dark/light theme class and CSS variables
  useEffect(() => {
    const root = document.documentElement
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }

    const accent = ACCENT_COLORS[settings.accentColor] || ACCENT_COLORS.blue
    root.style.setProperty('--color-accent', accent.primary)
    root.style.setProperty('--color-accent-hover', accent.hover)
    root.style.setProperty('--color-accent-subtle', accent.subtle)
    root.style.setProperty('--color-accent-rgb', accent.rgb)

    if (settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
  }, [settings.theme, settings.accentColor, settings.reducedMotion])

  const updateSettings = (partial: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem(SETTINGS_STORAGE_KEY)
  }

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }))
  }

  const accentConfig = ACCENT_COLORS[settings.accentColor] || ACCENT_COLORS.blue

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, toggleTheme, accentConfig }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
