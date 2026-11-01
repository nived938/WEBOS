import type { CustomizationPackage, PackageInstallStatus } from '../types'
import { soundService } from '@/core/audio/soundService'

const STORAGE_KEY = 'nova_installed_customizations_v2'
const ACTIVE_CUSTOMIZATIONS_KEY = 'nova_active_customizations_v2'

export interface ActiveCustomizations {
  activeThemeId?: string
  activeWallpaperId?: string
  activeCursorId?: string
  activeIconPackId?: string
  activeSoundPackId?: string
  activeBundleId?: string
}

class CustomizationManager {
  private installedPackageIds: Set<string> = new Set()
  private activeCustomizations: ActiveCustomizations = {}

  constructor() {
    this.loadState()
  }

  private loadState() {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          this.installedPackageIds = new Set(parsed)
        }
      } else {
        // Default built-in installed
        this.installedPackageIds = new Set([
          'theme-liquid-glass',
          'wp-nova-aurora',
          'cur-nova-default',
          'icon-nova-default',
          'snd-nova-original',
          'bundle-crystal-pack',
        ])
        this.saveState()
      }

      const activeSaved = localStorage.getItem(ACTIVE_CUSTOMIZATIONS_KEY)
      if (activeSaved) {
        this.activeCustomizations = JSON.parse(activeSaved)
      }
    } catch {
      // Ignore
    }
  }

  private saveState() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.installedPackageIds)))
      localStorage.setItem(ACTIVE_CUSTOMIZATIONS_KEY, JSON.stringify(this.activeCustomizations))
    } catch {
      // Ignore
    }
  }

  public isInstalled(packageId: string): boolean {
    return this.installedPackageIds.has(packageId)
  }

  public getInstalledIds(): string[] {
    return Array.from(this.installedPackageIds)
  }

  public async computeSha256(content: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      // Fallback deterministic hash
      let hash = 0
      for (let i = 0; i < content.length; i++) {
        hash = (hash << 5) - hash + content.charCodeAt(i)
        hash |= 0
      }
      return Math.abs(hash).toString(16).padStart(64, '0')
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  public installPackage(pkg: CustomizationPackage): boolean {
    soundService.play('notification')
    this.installedPackageIds.add(pkg.id)
    this.saveState()
    return true
  }

  public uninstallPackage(packageId: string): boolean {
    soundService.play('trash')
    this.installedPackageIds.delete(packageId)
    this.saveState()
    return true
  }

  public setActive(customization: Partial<ActiveCustomizations>) {
    this.activeCustomizations = { ...this.activeCustomizations, ...customization }
    this.saveState()
  }

  public getActive(): ActiveCustomizations {
    return this.activeCustomizations
  }

  public validateCustomizationManifest(jsonString: string): { valid: boolean; error?: string; pkg?: CustomizationPackage } {
    try {
      const data = JSON.parse(jsonString)
      if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Manifest must be a valid JSON object' }
      }

      if (!data.id || typeof data.id !== 'string') {
        return { valid: false, error: 'Missing package id string' }
      }
      if (!data.name || typeof data.name !== 'string') {
        return { valid: false, error: 'Missing package name string' }
      }
      if (!data.category || typeof data.category !== 'string') {
        return { valid: false, error: 'Missing package category string' }
      }

      // Security validation: verify no executable code patterns
      const rawText = JSON.stringify(data).toLowerCase()
      if (
        rawText.includes('<script') ||
        rawText.includes('javascript:') ||
        rawText.includes('eval(') ||
        rawText.includes('function(')
      ) {
        return { valid: false, error: 'Package contains rejected unsafe executable code patterns' }
      }

      const pkg: CustomizationPackage = {
        id: `custom-${data.id}`,
        name: String(data.name),
        category: data.category,
        version: String(data.version || '1.0.0'),
        author: String(data.author || 'User Imported'),
        description: String(data.description || 'Imported custom package'),
        previewImage: String(data.previewImage || 'from-indigo-600 to-purple-700'),
        rating: 5.0,
        downloadsCount: 1,
        packageSizeBytes: jsonString.length,
        checksumSha256: 'imported-valid-sha256',
        tags: Array.isArray(data.tags) ? data.tags : ['Imported', 'Custom'],
        themePayload: data.themePayload,
        wallpaperPayload: data.wallpaperPayload,
        cursorPayload: data.cursorPayload,
        bundlePayload: data.bundlePayload,
      }

      return { valid: true, pkg }
    } catch (e: any) {
      return { valid: false, error: e.message || 'Invalid JSON syntax' }
    }
  }
}

export const customizationManager = new CustomizationManager()
