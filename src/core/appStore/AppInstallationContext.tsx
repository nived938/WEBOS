import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { AppPackageManifest, ActiveInstallation } from './types'
import { STORE_CATALOG } from './catalog'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'

const INSTALLED_STORAGE_KEY = 'nova_installed_packages_v2'

// Default pre-installed apps: core system tools and flagship apps
const DEFAULT_INSTALLED_IDS: string[] = [
  'pkg-finder',
  'pkg-settings',
  'pkg-terminal',
  'pkg-browser',
  'pkg-appstore',
  'pkg-presentation',
  'pkg-pdfreader',
  'pkg-doccreator',
  'pkg-kanban',
  'pkg-whiteboard',
  'pkg-codestudio',
  'pkg-gitclient',
  'pkg-sqlbrowser',
  'pkg-pixelart',
  'pkg-vectorstudio',
  'pkg-audiorecorder',
  'pkg-screenrecorder',
  'pkg-musicvisualizer',
  'pkg-qrcodestudio',
  'pkg-passwordgen',
  'pkg-systemmonitor',
  'pkg-chesstrainer',
  'pkg-scienceexplorer',
  'pkg-marblerunner',
  'pkg-spacetunnel',
  'pkg-voxelisland',
]

interface AppInstallationContextType {
  installedPackageIds: string[]
  isInstalled: (packageId: string) => boolean
  activeInstallations: Record<string, ActiveInstallation>
  installPackage: (packageId: string) => void
  cancelInstallation: (packageId: string) => void
  uninstallPackage: (packageId: string) => boolean
  updatePackage: (packageId: string) => void
  reinstallPackage: (packageId: string) => void
  totalInstalledStorageBytes: number
  getPackage: (packageId: string) => AppPackageManifest | undefined
  getAllPackages: () => AppPackageManifest[]
}

const AppInstallationContext = createContext<AppInstallationContextType | null>(null)

export const AppInstallationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useNotifications()

  const [installedPackageIds, setInstalledPackageIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(INSTALLED_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Ensure system apps are always present
            const systemAppIds = STORE_CATALOG.filter((p) => p.isSystemApp).map((p) => p.id)
            return Array.from(new Set([...systemAppIds, ...parsed]))
          }
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_INSTALLED_IDS
  })

  const [activeInstallations, setActiveInstallations] = useState<Record<string, ActiveInstallation>>({})

  // Persist installed packages
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(INSTALLED_STORAGE_KEY, JSON.stringify(installedPackageIds))
      }
    } catch {
      // Ignore
    }
  }, [installedPackageIds])

  const isInstalled = useCallback(
    (packageId: string) => {
      return installedPackageIds.includes(packageId)
    },
    [installedPackageIds]
  )

  const getPackage = useCallback((packageId: string) => {
    return STORE_CATALOG.find((p) => p.id === packageId)
  }, [])

  const getAllPackages = useCallback(() => {
    return STORE_CATALOG
  }, [])

  // Calculate storage consumed by installed packages
  const totalInstalledStorageBytes = STORE_CATALOG.filter((p) =>
    installedPackageIds.includes(p.id)
  ).reduce((acc, curr) => acc + curr.packageSizeBytes, 0)

  // Install package with simulated progress stages
  const installPackage = useCallback(
    (packageId: string) => {
      const pkg = STORE_CATALOG.find((p) => p.id === packageId)
      if (!pkg) return

      soundService.playClick()

      setActiveInstallations((prev) => ({
        ...prev,
        [packageId]: {
          packageId,
          progress: 10,
          status: 'downloading',
        },
      }))

      let currentProgress = 10
      const interval = setInterval(() => {
        currentProgress += 25
        if (currentProgress < 75) {
          setActiveInstallations((prev) => ({
            ...prev,
            [packageId]: {
              packageId,
              progress: currentProgress,
              status: 'extracting',
            },
          }))
        } else if (currentProgress < 100) {
          setActiveInstallations((prev) => ({
            ...prev,
            [packageId]: {
              packageId,
              progress: 90,
              status: 'verifying',
            },
          }))
        } else {
          clearInterval(interval)
          setActiveInstallations((prev) => {
            const next = { ...prev }
            delete next[packageId]
            return next
          })
          setInstalledPackageIds((prev) => Array.from(new Set([...prev, packageId])))
          soundService.playStartup()
          addNotification(
            'Installation Complete',
            `${pkg.name} (${pkg.version}) was verified and installed.`,
            'appstore'
          )
        }
      }, 350)
    },
    [addNotification]
  )

  // Cancel installation
  const cancelInstallation = useCallback((packageId: string) => {
    soundService.playClick()
    setActiveInstallations((prev) => {
      const next = { ...prev }
      delete next[packageId]
      return next
    })
  }, [])

  // Uninstall non-system package
  const uninstallPackage = useCallback(
    (packageId: string): boolean => {
      const pkg = STORE_CATALOG.find((p) => p.id === packageId)
      if (!pkg) return false

      if (pkg.isSystemApp) {
        soundService.playAlert()
        addNotification(
          'Protected System App',
          `${pkg.name} is a core system component and cannot be uninstalled.`,
          'settings'
        )
        return false
      }

      soundService.playTrashEmpty()
      setInstalledPackageIds((prev) => prev.filter((id) => id !== packageId))
      addNotification(
        'Package Uninstalled',
        `Removed ${pkg.name} and reclaimed ${pkg.packageSize} storage.`,
        'appstore'
      )
      return true
    },
    [addNotification]
  )

  // Update package
  const updatePackage = useCallback(
    (packageId: string) => {
      const pkg = STORE_CATALOG.find((p) => p.id === packageId)
      if (!pkg) return
      installPackage(packageId)
    },
    [installPackage]
  )

  // Reinstall package
  const reinstallPackage = useCallback(
    (packageId: string) => {
      uninstallPackage(packageId)
      setTimeout(() => {
        installPackage(packageId)
      }, 500)
    },
    [uninstallPackage, installPackage]
  )

  return (
    <AppInstallationContext.Provider
      value={{
        installedPackageIds,
        isInstalled,
        activeInstallations,
        installPackage,
        cancelInstallation,
        uninstallPackage,
        updatePackage,
        reinstallPackage,
        totalInstalledStorageBytes,
        getPackage,
        getAllPackages,
      }}
    >
      {children}
    </AppInstallationContext.Provider>
  )
}

export const useAppInstallation = (): AppInstallationContextType => {
  const context = useContext(AppInstallationContext)
  if (!context) {
    throw new Error('useAppInstallation must be used within an AppInstallationProvider')
  }
  return context
}
