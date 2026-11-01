import { describe, it, expect, beforeEach } from 'vitest'
import { customizationManager } from '../services/customizationManager'
import { MARKETPLACE_PACKAGES } from '../data/marketplaceCatalog'

// Provide localStorage mock for node test environment if needed
if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {}
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val.toString()
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
    },
    writable: true,
  })
}

describe('Customization Center - Catalog and Manager', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('contains diverse marketplace packages with verified metadata', () => {
    expect(MARKETPLACE_PACKAGES.length).toBeGreaterThanOrEqual(20)

    const themes = MARKETPLACE_PACKAGES.filter((p) => p.category === 'themes')
    const wallpapers = MARKETPLACE_PACKAGES.filter((p) => p.category === 'wallpapers')
    const cursorPacks = MARKETPLACE_PACKAGES.filter((p) => p.category === 'cursor_packs')
    const iconPacks = MARKETPLACE_PACKAGES.filter((p) => p.category === 'icon_packs')
    const bundles = MARKETPLACE_PACKAGES.filter((p) => p.category === 'bundles')

    expect(themes.length).toBeGreaterThanOrEqual(10)
    expect(wallpapers.length).toBeGreaterThanOrEqual(10)
    expect(cursorPacks.length).toBeGreaterThanOrEqual(5)
    expect(iconPacks.length).toBeGreaterThanOrEqual(5)
    expect(bundles.length).toBeGreaterThanOrEqual(3)
  })

  it('computes consistent cryptographic hash for package content', async () => {
    const text = 'test-novapack-manifest-content'
    const hash1 = await customizationManager.computeSha256(text)
    const hash2 = await customizationManager.computeSha256(text)

    expect(hash1).toBe(hash2)
    expect(typeof hash1).toBe('string')
    expect(hash1.length).toBe(64)
  })

  it('installs, tracks, and uninstalls packages safely', () => {
    const pkg = MARKETPLACE_PACKAGES[0]
    expect(pkg).toBeDefined()

    const installed = customizationManager.installPackage(pkg)
    expect(installed).toBe(true)
    expect(customizationManager.isInstalled(pkg.id)).toBe(true)

    const uninstalled = customizationManager.uninstallPackage(pkg.id)
    expect(uninstalled).toBe(true)
    expect(customizationManager.isInstalled(pkg.id)).toBe(false)
  })
})
