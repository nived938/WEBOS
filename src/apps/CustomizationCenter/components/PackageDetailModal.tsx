import React, { useState } from 'react'
import {
  X,
  Star,
  Download,
  Trash2,
  Check,
  ShieldCheck,
  Layers,
  Sparkles,
  Sliders,
  Settings,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import type { CustomizationPackage } from '../types'

interface PackageDetailModalProps {
  pkg: CustomizationPackage
  isInstalled: boolean
  isActive: boolean
  onClose: () => void
  onInstall: (pkg: CustomizationPackage) => void
  onUninstall: (packageId: string) => void
  onApply: (pkg: CustomizationPackage, customSelection?: Record<string, boolean>) => void
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  pkg,
  isInstalled,
  isActive,
  onClose,
  onInstall,
  onUninstall,
  onApply,
}) => {
  // For bundles: allow selective checkboxes
  const isBundle = pkg.category === 'bundles'
  const [bundleOptions, setBundleOptions] = useState({
    theme: true,
    wallpaper: true,
    cursor: true,
    icons: true,
    sounds: true,
    dock: true,
  })

  const toggleOption = (key: keyof typeof bundleOptions) => {
    soundService.playClick()
    setBundleOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const formatSize = (bytes: number) => {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
    return Math.round(bytes / 1024) + ' KB'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181924] border border-white/20 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner Preview */}
        <div className={`h-40 w-full bg-gradient-to-tr ${pkg.previewImage} relative p-6 flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-black/50 text-white backdrop-blur-md border border-white/10">
              {pkg.category.replace('_', ' ')}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white drop-shadow-md">{pkg.name}</h2>
            <span className="text-xs text-white/80 font-mono">By {pkg.author} | v{pkg.version}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-neutral-200">
          {/* Metadata Row */}
          <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="font-bold text-white">{pkg.rating.toFixed(1)}</span>
              <span className="text-neutral-500">({pkg.downloadsCount.toLocaleString()} installs)</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
              <span>Size: {formatSize(pkg.packageSizeBytes)}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-1.5">Overview</h4>
            <p className="text-xs text-neutral-300 leading-relaxed">{pkg.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {pkg.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-neutral-400">
                #{tag}
              </span>
            ))}
          </div>

          {/* Bundle Custom Component Selector */}
          {isBundle && pkg.bundlePayload && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Select Components to Apply
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {pkg.bundlePayload.themeId && (
                  <label className="flex items-center gap-2 p-2 bg-black/30 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bundleOptions.theme}
                      onChange={() => toggleOption('theme')}
                      className="rounded accent-cyan-500"
                    />
                    <span>Window Theme</span>
                  </label>
                )}
                {pkg.bundlePayload.wallpaperId && (
                  <label className="flex items-center gap-2 p-2 bg-black/30 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bundleOptions.wallpaper}
                      onChange={() => toggleOption('wallpaper')}
                      className="rounded accent-cyan-500"
                    />
                    <span>Desktop Wallpaper</span>
                  </label>
                )}
                {pkg.bundlePayload.cursorPreset && (
                  <label className="flex items-center gap-2 p-2 bg-black/30 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bundleOptions.cursor}
                      onChange={() => toggleOption('cursor')}
                      className="rounded accent-cyan-500"
                    />
                    <span>Cursor Pack</span>
                  </label>
                )}
                {pkg.bundlePayload.dockPosition && (
                  <label className="flex items-center gap-2 p-2 bg-black/30 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bundleOptions.dock}
                      onChange={() => toggleOption('dock')}
                      className="rounded accent-cyan-500"
                    />
                    <span>Dock Layout ({pkg.bundlePayload.dockPosition})</span>
                  </label>
                )}
                {pkg.bundlePayload.iconPackId && (
                  <label className="flex items-center gap-2 p-2 bg-black/30 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bundleOptions.icons}
                      onChange={() => toggleOption('icons')}
                      className="rounded accent-cyan-500"
                    />
                    <span>Icon Pack</span>
                  </label>
                )}
                {pkg.bundlePayload.soundPackId && (
                  <label className="flex items-center gap-2 p-2 bg-black/30 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bundleOptions.sounds}
                      onChange={() => toggleOption('sounds')}
                      className="rounded accent-cyan-500"
                    />
                    <span>System Soundscape</span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* SHA-256 Checksum Display */}
          <div className="bg-black/30 border border-white/5 rounded-xl p-3 font-mono text-[10px] space-y-1">
            <span className="text-neutral-500 block">SHA-256 Integrity Hash</span>
            <span className="text-neutral-400 break-all block">{pkg.checksumSha256}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-between">
          <div>
            {isInstalled && (
              <button
                onClick={() => {
                  onUninstall(pkg.id)
                  onClose()
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs transition-colors"
            >
              Close
            </button>

            {isInstalled ? (
              <button
                onClick={() => {
                  onApply(pkg, bundleOptions)
                  onClose()
                }}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/30 transition-all"
              >
                {isActive ? 'Re-Apply Customization' : 'Apply to OS'}
              </button>
            ) : (
              <button
                onClick={() => {
                  onInstall(pkg)
                  onClose()
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/30 transition-all"
              >
                <Download className="w-4 h-4" /> Download & Install
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
