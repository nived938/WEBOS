import React, { useState, useMemo } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { useSettings } from '@/core/settings/SettingsContext'
import { useNotifications } from '@/core/notifications/NotificationContext'
import {
  Palette,
  Sparkles,
  Search,
  Download,
  Upload,
  Check,
  MousePointer,
  Volume2,
  Layers,
  Layout,
  Maximize,
  Sliders,
  Package,
  Star,
  CheckCircle2,
} from 'lucide-react'
import type {
  CustomizationCategory,
  CustomizationPackage,
  PackageInstallStatus,
} from './types'
import { MARKETPLACE_PACKAGES } from './data/marketplaceCatalog'
import { customizationManager } from './services/customizationManager'
import { PackageCard } from './components/PackageCard'
import { PackageDetailModal } from './components/PackageDetailModal'
import { ImportPackageModal } from './components/ImportPackageModal'

const CATEGORIES: { id: CustomizationCategory | 'installed'; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'featured', label: 'Featured', icon: Sparkles },
  { id: 'installed', label: 'Installed', icon: CheckCircle2 },
  { id: 'bundles', label: 'Complete Bundles', icon: Package },
  { id: 'themes', label: 'Themes', icon: Palette },
  { id: 'wallpapers', label: 'Wallpapers', icon: Layout },
  { id: 'cursor_packs', label: 'Cursor Packs', icon: MousePointer },
  { id: 'icon_packs', label: 'Icon Packs', icon: Layers },
  { id: 'sound_packs', label: 'Sound Packs', icon: Volume2 },
  { id: 'dock_styles', label: 'Dock Styles', icon: Sliders },
  { id: 'window_styles', label: 'Window Styles', icon: Maximize },
  { id: 'desktop_layouts', label: 'Desktop Layouts', icon: Layout },
  { id: 'lock_styles', label: 'Lock Screen', icon: Sliders },
  { id: 'widgets', label: 'Widgets', icon: Sparkles },
]

export const CustomizationCenterApp: React.FC<AppInstanceProps> = () => {
  const { settings, updateSettings } = useSettings()
  const { addNotification } = useNotifications()

  const [activeCategory, setActiveCategory] = useState<CustomizationCategory | 'installed'>('featured')
  const [search, setSearch] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<CustomizationPackage | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Track installing packages with progress simulator
  const [installingMap, setInstallingMap] = useState<Record<string, number>>({})

  // Local state reflecting manager
  const [installedIds, setInstalledIds] = useState<string[]>(() => customizationManager.getInstalledIds())
  const [activeCustomizations, setActiveCustomizations] = useState(() => customizationManager.getActive())

  // Filter packages
  const displayedPackages = useMemo(() => {
    return MARKETPLACE_PACKAGES.filter((pkg) => {
      // Search filter
      const matchesSearch =
        pkg.name.toLowerCase().includes(search.toLowerCase()) ||
        pkg.description.toLowerCase().includes(search.toLowerCase()) ||
        pkg.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))

      if (!matchesSearch) return false

      if (activeCategory === 'installed') {
        return installedIds.includes(pkg.id)
      }
      if (activeCategory === 'featured') {
        return pkg.isFeatured || pkg.category === 'bundles'
      }
      return pkg.category === activeCategory
    })
  }, [activeCategory, search, installedIds])

  // Handle Install Simulation
  const handleInstall = (pkg: CustomizationPackage) => {
    soundService.playClick()
    setInstallingMap((prev) => ({ ...prev, [pkg.id]: 10 }))

    const interval = setInterval(() => {
      setInstallingMap((prev) => {
        const current = prev[pkg.id] || 0
        if (current >= 100) {
          clearInterval(interval)
          customizationManager.installPackage(pkg)
          setInstalledIds(customizationManager.getInstalledIds())

          addNotification(
            'Customization Installed',
            `"${pkg.name}" has been installed and is ready to apply.`,
            'customizationcenter'
          )

          const next = { ...prev }
          delete next[pkg.id]
          return next
        }
        return { ...prev, [pkg.id]: current + 25 }
      })
    }, 150)
  }

  // Handle Apply to real OS
  const handleApply = (pkg: CustomizationPackage, customSelection?: Record<string, boolean>) => {
    soundService.playClick()

    if (pkg.category === 'themes' || pkg.id.startsWith('theme-')) {
      const themeId = pkg.id.replace('theme-', '')
      updateSettings({ activeThemeId: themeId })
      customizationManager.setActive({ activeThemeId: themeId })
      addNotification(
        'Theme Applied',
        `Switched active desktop theme to "${pkg.name}".`,
        'customizationcenter'
      )
    } else if (pkg.category === 'wallpapers' || pkg.id.startsWith('wp-')) {
      const wpId = pkg.id.replace('wp-', '')
      updateSettings({ wallpaperId: wpId })
      customizationManager.setActive({ activeWallpaperId: wpId })
      addNotification(
        'Wallpaper Updated',
        `Applied "${pkg.name}" as desktop background.`,
        'customizationcenter'
      )
    } else if (pkg.category === 'cursor_packs' || pkg.id.startsWith('cur-')) {
      const curPreset = pkg.id.replace('cur-', '')
      updateSettings({
        cursorSettings: {
          ...settings.cursorSettings,
          preset: curPreset as any,
        },
      })
      customizationManager.setActive({ activeCursorId: curPreset })
      addNotification(
        'Cursor Pack Activated',
        `Pointer style updated to "${pkg.name}".`,
        'customizationcenter'
      )
    } else if (pkg.category === 'sound_packs' || pkg.id.startsWith('snd-')) {
      customizationManager.setActive({ activeSoundPackId: pkg.id })
      soundService.playStartup()
      addNotification(
        'Soundscape Applied',
        `Switched system audio chimes to "${pkg.name}".`,
        'customizationcenter'
      )
    } else if (pkg.category === 'bundles' && pkg.bundlePayload) {
      const b = pkg.bundlePayload
      const sel = customSelection || {
        theme: true,
        wallpaper: true,
        cursor: true,
        icons: true,
        sounds: true,
        dock: true,
      }

      const updates: any = {}
      if (sel.theme && b.themeId) updates.activeThemeId = b.themeId
      if (sel.wallpaper && b.wallpaperId) updates.wallpaperId = b.wallpaperId
      if (sel.cursor && b.cursorPreset) {
        updates.cursorSettings = {
          ...settings.cursorSettings,
          preset: b.cursorPreset,
        }
      }
      if (sel.dock && b.dockPosition) {
        updates.dockSettings = {
          ...settings.dockSettings,
          position: b.dockPosition,
        }
      }

      updateSettings(updates)
      customizationManager.setActive({ activeBundleId: pkg.id })

      addNotification(
        'Customization Bundle Activated',
        `Successfully applied suite: "${pkg.name}".`,
        'customizationcenter'
      )
    }

    setActiveCustomizations(customizationManager.getActive())
  }

  const handleUninstall = (packageId: string) => {
    customizationManager.uninstallPackage(packageId)
    setInstalledIds(customizationManager.getInstalledIds())
    addNotification(
      'Package Removed',
      'Customization package uninstalled successfully.',
      'customizationcenter'
    )
  }

  return (
    <div className="flex h-full bg-[#11121a]/95 text-neutral-200 font-sans select-none overflow-hidden backdrop-blur-2xl">
      {/* Sidebar Navigation */}
      <div className="w-60 bg-black/40 border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white tracking-wide">CUSTOMIZATION</h2>
                <span className="text-[10px] text-neutral-400 font-mono">Marketplace & Themes</span>
              </div>
            </div>

            <button
              onClick={() => setIsImportModalOpen(true)}
              title="Import .novapack or .json"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundService.playClick()
                    setActiveCategory(cat.id)
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-md shadow-purple-500/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-neutral-400'}`} />
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 text-[11px] text-neutral-500 text-center font-mono">
          NOVA Marketplace v2.5
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Search Toolbar */}
        <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search themes, wallpapers, cursor packs, sounds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="font-mono">{displayedPackages.length} Packages</span>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-medium transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Import Package
            </button>
          </div>
        </div>

        {/* Packages Grid Display */}
        <div className="flex-1 overflow-y-auto p-5">
          {displayedPackages.length === 0 ? (
            <div className="py-24 text-center space-y-2 text-neutral-500">
              <Package className="w-10 h-10 mx-auto text-neutral-600" />
              <p className="text-xs">No customization packages match your current search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedPackages.map((pkg) => {
                const isInstalled = installedIds.includes(pkg.id)
                const isInstalling = pkg.id in installingMap
                const progress = installingMap[pkg.id] || 0

                // Check if active
                const isActive =
                  activeCustomizations.activeThemeId === pkg.id.replace('theme-', '') ||
                  activeCustomizations.activeWallpaperId === pkg.id.replace('wp-', '') ||
                  activeCustomizations.activeCursorId === pkg.id.replace('cur-', '') ||
                  activeCustomizations.activeSoundPackId === pkg.id ||
                  activeCustomizations.activeBundleId === pkg.id

                return (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    isInstalled={isInstalled}
                    isActive={isActive}
                    isInstalling={isInstalling}
                    installProgress={progress}
                    onInstall={handleInstall}
                    onApply={handleApply}
                    onSelectDetails={setSelectedPackage}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <PackageDetailModal
          pkg={selectedPackage}
          isInstalled={installedIds.includes(selectedPackage.id)}
          isActive={
            activeCustomizations.activeThemeId === selectedPackage.id.replace('theme-', '') ||
            activeCustomizations.activeWallpaperId === selectedPackage.id.replace('wp-', '') ||
            activeCustomizations.activeCursorId === selectedPackage.id.replace('cur-', '') ||
            activeCustomizations.activeSoundPackId === selectedPackage.id ||
            activeCustomizations.activeBundleId === selectedPackage.id
          }
          onClose={() => setSelectedPackage(null)}
          onInstall={handleInstall}
          onUninstall={handleUninstall}
          onApply={handleApply}
        />
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportPackageModal
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={(pkg) => {
            setInstalledIds(customizationManager.getInstalledIds())
            addNotification(
              'Package Imported',
              `Successfully validated and imported "${pkg.name}".`,
              'customizationcenter'
            )
          }}
        />
      )}
    </div>
  )
}
