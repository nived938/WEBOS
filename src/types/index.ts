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

export interface Wallpaper {
  id: string
  name: string
  type: 'gradient' | 'dynamic' | 'custom'
  thumbnail: string
  style: string
  fallbackColor?: string
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
