import React, { useState, useMemo } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useAppInstallation } from '@/core/appStore/AppInstallationContext'
import type { StoreCategory, AppPackageManifest } from '@/core/appStore/types'
import { soundService } from '@/core/audio/soundService'
import {
  Download,
  Check,
  Search,
  Sparkles,
  Grid,
  Gamepad2,
  Briefcase,
  Code,
  GraduationCap,
  Globe,
  Palette,
  Camera,
  Film,
  Music,
  MessageSquare,
  Shield,
  Wrench,
  Cpu,
  Layers,
  X,
  Play,
  RotateCw,
  Trash2,
  Info,
  CheckCircle2,
  HardDrive,
  ExternalLink,
} from 'lucide-react'

export const AppStoreApp: React.FC<AppInstanceProps> = () => {
  const { openApp } = useWindowManager()
  const {
    installedPackageIds,
    isInstalled,
    activeInstallations,
    installPackage,
    cancelInstallation,
    uninstallPackage,
    updatePackage,
    totalInstalledStorageBytes,
    getAllPackages,
  } = useAppInstallation()

  const [activeCategory, setActiveCategory] = useState<StoreCategory | 'Installed'>('Featured')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<AppPackageManifest | null>(null)

  const allPackages = useMemo(() => getAllPackages(), [getAllPackages])

  const categories: { id: StoreCategory | 'Installed'; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'Featured', label: 'Featured Showcase', icon: Sparkles },
    { id: 'All Applications', label: 'All Applications', icon: Grid },
    { id: 'Installed', label: 'Installed Software', icon: CheckCircle2 },
    { id: 'Productivity', label: 'Productivity', icon: Briefcase },
    { id: 'Development', label: 'Development', icon: Code },
    { id: 'Education', label: 'Education & Learning', icon: GraduationCap },
    { id: 'Graphics', label: 'Graphics & Design', icon: Palette },
    { id: 'Games', label: 'Gaming & Arcade', icon: Gamepad2 },
    { id: 'Internet', label: 'Internet & Web', icon: Globe },
    { id: 'Photography', label: 'Photography', icon: Camera },
    { id: 'Video', label: 'Video & Motion', icon: Film },
    { id: 'Music', label: 'Music & Audio', icon: Music },
    { id: 'Communication', label: 'Communication', icon: MessageSquare },
    { id: 'Security', label: 'Privacy & Security', icon: Shield },
    { id: 'Utilities', label: 'Utilities', icon: Wrench },
    { id: 'System Tools', label: 'System Tools', icon: Cpu },
    { id: 'Customization', label: 'Customization', icon: Layers },
  ]

  // Filter packages based on active category & search query
  const filteredPackages = useMemo(() => {
    return allPackages.filter((pkg) => {
      // Category filter
      if (activeCategory === 'Installed') {
        if (!isInstalled(pkg.id)) return false
      } else if (activeCategory === 'Featured') {
        if (!pkg.featured) return false
      } else if (activeCategory !== 'All Applications') {
        if (pkg.category !== activeCategory) return false
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          pkg.name.toLowerCase().includes(q) ||
          pkg.description.toLowerCase().includes(q) ||
          pkg.developer.toLowerCase().includes(q) ||
          pkg.category.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [allPackages, activeCategory, searchQuery, isInstalled])

  const formatBytes = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex h-full bg-neutral-900/95 text-neutral-200 select-none backdrop-blur-2xl relative overflow-hidden">
      {/* Sidebar Categories */}
      <div className="w-56 border-r border-white/10 bg-black/35 flex flex-col p-2.5 text-xs select-none shrink-0">
        <div className="px-2 pt-1 pb-2">
          <div className="font-bold text-white text-sm tracking-tight flex items-center justify-between">
            <span>Software Center</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-full border border-cyan-500/20">
              NOVA 2.5
            </span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Verified Application Repository</div>
        </div>

        {/* Search Input Box */}
        <div className="relative mb-2 px-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search software..."
            className="w-full pl-7 pr-6 py-1.5 rounded-xl bg-white/10 border border-white/10 text-white text-[11px] placeholder-neutral-400 focus:outline-none focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            const count =
              cat.id === 'Installed'
                ? installedPackageIds.length
                : cat.id === 'Featured'
                ? allPackages.filter((p) => p.featured).length
                : cat.id === 'All Applications'
                ? allPackages.length
                : allPackages.filter((p) => p.category === cat.id).length

            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundService.playClick()
                  setActiveCategory(cat.id)
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition text-left ${
                  isActive
                    ? 'bg-blue-600/30 text-white font-semibold border border-blue-500/30 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon size={14} className={isActive ? 'text-blue-400' : 'text-neutral-400'} />
                  <span className="truncate text-xs">{cat.label}</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 bg-white/5 px-1.5 py-0.2 rounded-md">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Storage Bar Footer */}
        <div className="pt-2 mt-2 border-t border-white/10 px-1 text-[11px]">
          <div className="flex justify-between text-neutral-400">
            <span>Installed Packages</span>
            <span className="text-cyan-300 font-mono">{formatBytes(totalInstalledStorageBytes)}</span>
          </div>
        </div>
      </div>

      {/* Main Software Catalog Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs custom-scrollbar">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-0.5 flex items-center gap-2">
              <span>{activeCategory}</span>
              <span className="text-xs font-normal text-neutral-400 font-mono">
                ({filteredPackages.length} {filteredPackages.length === 1 ? 'package' : 'packages'})
              </span>
            </h3>
            <p className="text-neutral-400 text-xs">
              Explore officially verified desktop applications, compilers, creative suites, and productivity tools.
            </p>
          </div>
        </div>

        {/* Package Grid */}
        {filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-400">
            <Info size={32} className="opacity-40 mb-2" />
            <div className="font-semibold text-white">No software found</div>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              No applications match your selected filter or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPackages.map((pkg) => {
              const installed = isInstalled(pkg.id)
              const installing = activeInstallations[pkg.id]

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition cursor-pointer flex flex-col justify-between group shadow-sm backdrop-blur-md"
                >
                  <div>
                    {/* Top row: Icon + Title + Version */}
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl ${pkg.iconBg} p-2 flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition`}>
                        <Sparkles size={22} className={pkg.iconColor} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-xs truncate group-hover:text-blue-300 transition">
                            {pkg.name}
                          </h4>
                          <span className="text-[10px] font-mono text-neutral-400 px-1.5 py-0.5 rounded bg-black/40">
                            v{pkg.version}
                          </span>
                        </div>
                        <div className="text-[10px] text-cyan-400 font-mono truncate">{pkg.developer}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{pkg.category} &bull; {pkg.packageSize}</div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-neutral-300 mt-2.5 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Bottom Row: Actions & Installation Status */}
                  <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      {installed ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium">
                          <Check size={13} /> Installed
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-neutral-400">Available</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {installing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${installing.progress}%` }} />
                          </div>
                          <button
                            onClick={() => cancelInstallation(pkg.id)}
                            className="p-1 rounded-lg text-neutral-400 hover:text-white"
                            title="Cancel Download"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : installed ? (
                        <>
                          <button
                            onClick={() => {
                              soundService.playClick()
                              openApp(pkg.appId)
                            }}
                            className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition shadow-md shadow-blue-600/20"
                          >
                            Open
                          </button>
                          {!pkg.isSystemApp && (
                            <button
                              onClick={() => uninstallPackage(pkg.id)}
                              className="p-1 rounded-lg text-neutral-400 hover:text-red-400 transition"
                              title="Uninstall Software"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => installPackage(pkg.id)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition"
                        >
                          <Download size={13} />
                          <span>Get</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/20 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl ${selectedPackage.iconBg} p-2.5 flex items-center justify-center shadow-lg`}>
                  <Sparkles size={28} className={selectedPackage.iconColor} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedPackage.name}</h3>
                  <div className="text-xs text-cyan-400 font-mono">{selectedPackage.developer}</div>
                  <div className="text-[11px] text-neutral-400">
                    Version {selectedPackage.version} &bull; {selectedPackage.category}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-neutral-300">About this Application</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">{selectedPackage.description}</p>
            </div>

            {/* Technical Specifications & Permissions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Installation Package Size</span>
                <span className="text-white font-mono">{selectedPackage.packageSize}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">System Compatibility</span>
                <span className="text-white">{selectedPackage.compatibility}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Package Verification Integrity</span>
                <span className="text-cyan-300 font-mono text-[10px] truncate max-w-[200px]">
                  {selectedPackage.integrity}
                </span>
              </div>
              <div className="py-1">
                <span className="text-neutral-400 block mb-1.5 font-medium">Declared Sandbox Permissions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPackage.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 text-[10px] font-mono"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedPackage(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/10"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {isInstalled(selectedPackage.id) ? (
                  <>
                    <button
                      onClick={() => {
                        soundService.playClick()
                        openApp(selectedPackage.appId)
                        setSelectedPackage(null)
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20"
                    >
                      <Play size={14} />
                      <span>Launch App</span>
                    </button>
                    {!selectedPackage.isSystemApp && (
                      <button
                        onClick={() => {
                          uninstallPackage(selectedPackage.id)
                          setSelectedPackage(null)
                        }}
                        className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-medium transition"
                      >
                        Uninstall
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      installPackage(selectedPackage.id)
                      setSelectedPackage(null)
                    }}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20"
                  >
                    <Download size={14} />
                    <span>Install Application</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
