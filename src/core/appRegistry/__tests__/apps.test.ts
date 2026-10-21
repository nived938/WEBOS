import { describe, it, expect } from 'vitest'
import { APPS_REGISTRY } from '../apps.config'
import { WALLPAPERS, getWallpaperById } from '@/core/settings/wallpapers'
import type { AppId } from '@/types'

describe('Application Registry', () => {
  const coreApps: AppId[] = [
    'finder',
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
    'applibrary',
    'games',
    'trash',
  ]

  const extendedApps: AppId[] = [
    'texteditor',
    'todo',
    'markdown',
    'spreadsheet',
    'docviewer',
    'weather',
    'rssreader',
    'bookmarks',
    'downloads',
    'jsonformatter',
    'playground',
    'colorpicker',
    'regextester',
    'apitester',
    'github',
    'dictionary',
    'wikipedia',
    'flashcards',
    'typingtest',
    'unitconverter',
    'paint',
    'imagestudio',
    'videoplayer',
    'audiostudio',
    'wallpaperstudio',
    'sysinfo',
    'clock',
    'pomodoro',
    'contacts',
    'dashboard',
    'game_marble3d',
    'game_space3d',
    'game_voxel3d',
    'game_snake',
    'game_tetris',
    'game_minesweeper',
    'game_2048',
    'game_breakout',
    'game_sudoku',
    'game_flappy',
    'game_tictactoe',
    'game_spaceshooter',
    'game_memory'
  ]

  it('should register all core operating system applications', () => {
    coreApps.forEach((appId) => {
      const app = APPS_REGISTRY[appId]
      expect(app).toBeDefined()
      expect(app.title).toBeDefined()
      expect(app.component).toBeDefined()
      expect(app.defaultWidth).toBeGreaterThan(0)
      expect(app.defaultHeight).toBeGreaterThan(0)
    })
  })

  it('should register all extended applications and 2D/3D games', () => {
    extendedApps.forEach((appId) => {
      const app = APPS_REGISTRY[appId]
      expect(app).toBeDefined()
      expect(app.title).toBeDefined()
      expect(app.category).toBeDefined()
      expect(app.component).toBeDefined()
    })
  })

  it('should contain at least 40 registered apps in the ecosystem', () => {
    const totalApps = Object.keys(APPS_REGISTRY).length
    expect(totalApps).toBeGreaterThanOrEqual(40)
  })

  it('should include authentic 3D WebGL Three.js games', () => {
    expect(APPS_REGISTRY.game_marble3d).toBeDefined()
    expect(APPS_REGISTRY.game_space3d).toBeDefined()
    expect(APPS_REGISTRY.game_voxel3d).toBeDefined()
    expect(APPS_REGISTRY.game_marble3d.category).toBe('Games')
  })
})

describe('Wallpapers & Fallback Resiliency', () => {
  it('should have all wallpapers with fallback colors to prevent black screen', () => {
    expect(WALLPAPERS.length).toBeGreaterThanOrEqual(10)
    WALLPAPERS.forEach(wp => {
      expect(wp.id).toBeDefined()
      expect(wp.fallbackColor).toBeDefined()
      expect(wp.fallbackColor).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(wp.style).toBeDefined()
      expect(wp.style.length).toBeGreaterThan(10)
    })
  })

  it('should safely fall back to default wallpaper if unknown id requested', () => {
    const fallback = getWallpaperById('non-existent-wallpaper-xyz')
    expect(fallback).toBeDefined()
    expect(fallback.id).toBe(WALLPAPERS[0].id)
    expect(fallback.fallbackColor).toBeDefined()
  })
})
