import { describe, it, expect } from 'vitest'
import { APPS_REGISTRY } from '../apps.config'
import type { AppId } from '@/types'

describe('Application Registry', () => {
  const expectedApps: AppId[] = [
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
    'games',
    'trash',
  ]

  it('should register all 12 operating system applications plus trash', () => {
    expectedApps.forEach((appId) => {
      const app = APPS_REGISTRY[appId]
      expect(app).toBeDefined()
      expect(app.title).toBeDefined()
      expect(app.component).toBeDefined()
      expect(app.defaultWidth).toBeGreaterThan(0)
      expect(app.defaultHeight).toBeGreaterThan(0)
      expect(app.minWidth).toBeGreaterThan(0)
      expect(app.minHeight).toBeGreaterThan(0)
    })
  })

  it('should have dock applications flagged properly', () => {
    expect(APPS_REGISTRY.finder.isDockApp).toBe(true)
    expect(APPS_REGISTRY.browser.isDockApp).toBe(true)
    expect(APPS_REGISTRY.games.isDockApp).toBe(true)
    expect(APPS_REGISTRY.trash.isDockApp).toBe(false) // Placed on right side of dock divider
  })
})
