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
  | 'presentation'
  | 'pdfreader'
  | 'pdfannotator'
  | 'doccreator'
  | 'kanban'
  | 'projectmanager'
  | 'mindmap'
  | 'whiteboard'
  | 'habittracker'
  | 'advancednotes'
  | 'pomodoropro'
  | 'codestudio'
  | 'gitclient'
  | 'sqlbrowser'
  | 'jsonexplorer'
  | 'yamleditor'
  | 'cssplayground'
  | 'jsplayground'
  | 'apiworkspace'
  | 'markdowndoc'
  | 'palettegenerator'
  | 'pixelart'
  | 'vectorstudio'
  | 'imagecropper'
  | 'imageconverter'
  | 'screenshot'
  | 'logomaker'
  | 'icondesigner'
  | 'gradientdesigner'
  | 'audiorecorder'
  | 'voicerecorder'
  | 'videoeditor'
  | 'screenrecorder'
  | 'musicvisualizer'
  | 'playlistmanager'
  | 'gifcreator'
  | 'qrcodestudio'
  | 'passwordgen'
  | 'filecompressor'
  | 'filediff'
  | 'clipboardmanager'
  | 'stopwatch'
  | 'worldclock'
  | 'systemmonitor'
  | 'storageexplorer'
  | 'duplicatefinder'
  | 'chesstrainer'
  | 'mathstudio'
  | 'scienceexplorer'
  | 'typingtrainer'
  | 'languagelearning'
  | 'codinglessons'
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

// ----------------------------------------------------------------------------
// Complete Operating System Personalization Types
// ----------------------------------------------------------------------------

export interface ThemeDefinition {
  id: string
  name: string
  description?: string
  isBuiltIn: boolean
  background: {
    wallpaperId: string
    type: 'gradient' | 'dynamic' | 'custom'
    style?: string
    fallbackColor: string
  }
  accentColor: AccentColor
  windowBackground: string
  panelAppearance: string
  dockAppearance: string
  borderColor: string
  textColor: string
  buttonStyle: 'rounded' | 'glass' | 'pill' | 'solid'
  selectionColor: string
  highlightColor: string
  shadowIntensity: number
  borderRadius: number
  glassTransparency: number
}

export type LiquidGlassPreset =
  | 'clear'
  | 'frosted'
  | 'deep'
  | 'liquid'
  | 'crystal'
  | 'dark'
  | 'colored'
  | 'minimal'

export interface LiquidGlassSettings {
  enabled: boolean
  preset: LiquidGlassPreset
  opacity: number // 10% to 90%
  blur: number // 0px to 50px
  saturation: number // 50% to 200%
  brightness: number // 0% to 100%
  borderVisibility: number // 0% to 100%
  shadowIntensity: number // 0% to 100%
  cornerRadius: number // 0px to 40px
  reflectionIntensity: number // 0% to 100%
  tint: 'auto' | 'blue' | 'purple' | 'white' | 'black' | 'custom'
  customTintColor: string
  performanceMode: boolean
}

export type CursorPreset =
  | 'windows-classic'
  | 'windows-modern'
  | 'macos-inspired'
  | 'ubuntu-inspired'
  | 'nova-default'
  | 'retro-pixel'
  | 'gaming-neon'
  | 'minimal-white'
  | 'minimal-black'
  | 'custom'

export type CursorSize = 16 | 24 | 32 | 40 | 48 | 64

export interface CursorSettings {
  preset: CursorPreset
  size: CursorSize
  color: string
  outlineColor: string
  shadow: boolean
  animation: boolean
  trail: boolean
  clickEffect: boolean
  glow: boolean
  customUrl?: string
  visibility: boolean
}

export type WallpaperPosition = 'fill' | 'fit' | 'stretch' | 'center' | 'tile'

export interface WallpaperSettings {
  position: WallpaperPosition
  slideshow: boolean
  slideshowInterval: number // in minutes (0 = off)
  liveAnimated: boolean
  favorites: string[]
}

export type DockPosition = 'bottom' | 'left' | 'right'

export type DockAppearance =
  | 'floating'
  | 'transparent'
  | 'liquid-glass'
  | 'frosted'
  | 'solid'
  | 'minimal'

export interface DockSettings {
  position: DockPosition
  appearance: DockAppearance
  iconSize: number // 32 to 72
  iconSpacing: number // 2 to 20
  magnification: boolean
  magnificationScale: number // 1.1 to 1.8
  animationSpeed: number // 0.5 to 2.0
  autoHide: boolean
  showRunningIndicators: boolean
  showLabels: boolean
  showOpenWindows: boolean
  recentApps: boolean
  pinnedAppIds: AppId[]
}

export type DesktopIconSize = 'small' | 'medium' | 'large'

export interface DesktopSettings {
  iconSize: DesktopIconSize
  iconSpacing: number // 60 to 140
  labelPosition: 'bottom' | 'right'
  gridSnap: boolean
  autoArrange: boolean
  selectionColor: string
  showIcons: boolean
}

export type DesktopWidgetType =
  | 'clock'
  | 'calendar'
  | 'weather'
  | 'shortcuts'
  | 'notes'
  | 'tasks'
  | 'music'
  | 'system'
  | 'battery'

export interface DesktopWidgetConfig {
  id: string
  type: DesktopWidgetType
  title: string
  enabled: boolean
  x: number
  y: number
}

export interface WindowManagerSettings {
  snapEnabled: boolean
  minimizeEffect: 'genie' | 'scale' | 'fade'
  shadowDepth: number // 0 to 100
  titlebarStyle: 'mac' | 'windows' | 'compact'
  doubleClickAction: 'maximize' | 'minimize'
}

export interface PanelSettings {
  clockFormat: '12h' | '24h'
  showSeconds: boolean
  showBattery: boolean
  showWifi: boolean
  showSound: boolean
  showUser: boolean
  blurDepth: number
}

export interface AnimationSettings {
  speed: number // 0.5 to 2.0
  windowTransitions: boolean
  dockBounce: boolean
  particleEffects: boolean
}

export interface AccessibilitySettings {
  highContrast: boolean
  textScale: number // 80 to 130
  grayscale: boolean
  focusOutlines: boolean
}

export interface SystemSettings {
  theme: ThemeMode
  accentColor: AccentColor
  activeThemeId: string
  customThemes: ThemeDefinition[]
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
  // Cursor Engine
  cursorStyle: CursorStyle
  cursorSettings: CursorSettings
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
  // Extended Personalization Subsystems
  liquidGlass: LiquidGlassSettings
  wallpaperSettings: WallpaperSettings
  dockSettings: DockSettings
  desktopSettings: DesktopSettings
  desktopWidgets: DesktopWidgetConfig[]
  windowManagerSettings: WindowManagerSettings
  panelSettings: PanelSettings
  animationSettings: AnimationSettings
  accessibilitySettings: AccessibilitySettings
}
