import React, { useEffect, useState } from 'react'
import type { SystemSettings } from '@/types'
import { soundService } from '@/core/audio/soundService'
import {
  SettingsContext,
  SETTINGS_STORAGE_KEY,
  DEFAULT_SETTINGS,
  ACCENT_COLORS,
  useSettings,
  type SettingsContextType,
} from './settingsStore'

export { useSettings, type SettingsContextType }

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
