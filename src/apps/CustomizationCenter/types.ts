import type { ThemeDefinition, Wallpaper, CursorSettings, AccentColor } from '@/types'

export type CustomizationCategory =
  | 'featured'
  | 'themes'
  | 'icon_packs'
  | 'cursor_packs'
  | 'wallpapers'
  | 'animated_wallpapers'
  | 'sound_packs'
  | 'dock_styles'
  | 'window_styles'
  | 'desktop_layouts'
  | 'lock_styles'
  | 'widgets'
  | 'bundles'

export type PackageInstallStatus = 'available' | 'downloading' | 'installing' | 'installed' | 'active'

export interface IconPackMapping {
  appIcons: Record<string, string> // AppId -> Lucide icon name or SVG
  fileIcons: Record<string, string> // Extension -> icon
  systemIcons: Record<string, string>
}

export interface SoundPackDef {
  id: string
  name: string
  sounds: {
    startup?: string
    shutdown?: string
    appOpen?: string
    appClose?: string
    notification?: string
    error?: string
    click?: string
    trash?: string
  }
}

export interface CustomizationBundle {
  themeId?: string
  wallpaperId?: string
  cursorPreset?: string
  iconPackId?: string
  soundPackId?: string
  dockPosition?: 'bottom' | 'left' | 'right'
}

export interface CustomizationPackage {
  id: string
  name: string
  category: CustomizationCategory
  version: string
  author: string
  description: string
  previewImage: string
  rating: number
  downloadsCount: number
  packageSizeBytes: number
  checksumSha256: string
  tags: string[]
  isFeatured?: boolean
  isBuiltIn?: boolean
  // Specific payloads
  themePayload?: ThemeDefinition
  wallpaperPayload?: Wallpaper
  cursorPayload?: CursorSettings
  iconPayload?: IconPackMapping
  soundPayload?: SoundPackDef
  bundlePayload?: CustomizationBundle
}
