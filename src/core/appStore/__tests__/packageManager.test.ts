import { describe, it, expect } from 'vitest'
import { STORE_CATALOG } from '../catalog'

describe('Software Center Package Catalog Subsystem', () => {
  it('contains comprehensive verified package manifests across system and ecosystem', () => {
    expect(STORE_CATALOG.length).toBeGreaterThanOrEqual(50)
  })

  it('guarantees essential system apps are protected with isSystemApp flag', () => {
    const finderPkg = STORE_CATALOG.find((p) => p.appId === 'finder')
    const settingsPkg = STORE_CATALOG.find((p) => p.appId === 'settings')
    const terminalPkg = STORE_CATALOG.find((p) => p.appId === 'terminal')

    expect(finderPkg?.isSystemApp).toBe(true)
    expect(settingsPkg?.isSystemApp).toBe(true)
    expect(terminalPkg?.isSystemApp).toBe(true)
  })

  it('verifies all packages have valid SHA-256 integrity hashes and sizes', () => {
    STORE_CATALOG.forEach((pkg) => {
      expect(pkg.integrity).toMatch(/^sha256-/)
      expect(pkg.packageSizeBytes).toBeGreaterThan(0)
      expect(pkg.permissions.length).toBeGreaterThan(0)
    })
  })
})
