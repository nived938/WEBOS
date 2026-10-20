export type AppId =
  | 'finder'
  | 'browser'
  | 'mail'
  | 'calendar'
  | 'notes'
  | 'calculator'
  | 'photos'
  | 'music'
  | 'terminal'
  | 'settings'
  | 'appstore'
  | 'games'
  | 'trash'

export type ThemeMode = 'dark' | 'light' | 'auto'

export type AccentColor = 'blue' | 'purple' | 'emerald' | 'orange' | 'rose' | 'amber'

export interface Wallpaper {
  id: string
  name: string
  type: 'gradient' | 'dynamic' | 'custom'
  thumbnail: string
  style: string
}

export interface SystemSettings {
  theme: ThemeMode
  accentColor: AccentColor
  wallpaperId: string
  customWallpaperUrl?: string
  dockSize: 'small' | 'medium' | 'large'
  dockMagnification: boolean
  dockAutoHide: boolean
  desktopIconsVisible: boolean
  soundEffects: boolean
  volume: number
  brightness: number
  reducedMotion: boolean
  doNotDisturb: boolean
  wifiEnabled: boolean
  bluetoothEnabled: boolean
}
