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
  | 'applibrary'
  | 'games'
  | 'trash'
  | 'texteditor'
  | 'todo'
  | 'markdown'
  | 'spreadsheet'
  | 'docviewer'
  | 'weather'
  | 'rssreader'
  | 'bookmarks'
  | 'downloads'
  | 'jsonformatter'
  | 'playground'
  | 'colorpicker'
  | 'regextester'
  | 'apitester'
  | 'github'
  | 'dictionary'
  | 'wikipedia'
  | 'flashcards'
  | 'typingtest'
  | 'unitconverter'
  | 'paint'
  | 'imagestudio'
  | 'videoplayer'
  | 'audiostudio'
  | 'wallpaperstudio'
  | 'sysinfo'
  | 'clock'
  | 'timer'
  | 'contacts'
  | 'pomodoro'
  | 'dashboard'
  | 'game_marble3d'
  | 'game_space3d'
  | 'game_voxel3d'
  | 'game_snake'
  | 'game_tetris'
  | 'game_minesweeper'
  | 'game_2048'
  | 'game_breakout'
  | 'game_sudoku'
  | 'game_flappy'
  | 'game_tictactoe'
  | 'game_spaceshooter'
  | 'game_memory'
  | (string & {})

export type ThemeMode = 'dark' | 'light' | 'auto'

export type AccentColor = 'blue' | 'purple' | 'emerald' | 'orange' | 'rose' | 'amber'

export type CursorStyle = 'default' | 'glow-cyan' | 'amber-retro' | 'cyberpunk' | 'precision'

export type PerformanceMode = 'high' | 'balanced' | 'low'

export interface Wallpaper {
  id: string
  name: string
  type: 'gradient' | 'dynamic' | 'custom'
  thumbnail: string
  style: string
  fallbackColor?: string
}

export type AutoLockTimeout = 0 | 1 | 2 | 5 | 10 | 15 | 30

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
  // New System Capabilities
  cursorStyle: CursorStyle
  performanceMode: PerformanceMode
  nightLight: boolean
  nightLightTemperature: number
  lockScreenEnabled: boolean
  lockPin: string
  username: string
  bootAnimation: boolean
  activeWorkspace: number
  uiSoundsVolume: number
  // Advanced Lock Screen & User Profile
  lockWallpaperId: string
  customLockWallpaperUrl?: string
  lockWallpaperType: 'gradient' | 'dynamic' | 'custom' | 'animated'
  userAvatar: string
  userBio: string
  userGreeting: string
  profileAccentColor: AccentColor
  pinHash?: string
  pinSalt?: string
  isPinSet: boolean
  recoveryKey?: string
  autoLockTimeout: AutoLockTimeout
  immersiveModeEnabled: boolean
}
