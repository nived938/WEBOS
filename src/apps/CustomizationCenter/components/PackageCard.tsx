import React from 'react'
import {
  Download,
  Check,
  Star,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import type { CustomizationPackage } from '../types'

interface PackageCardProps {
  pkg: CustomizationPackage
  isInstalled: boolean
  isActive: boolean
  isInstalling: boolean
  installProgress: number
  onInstall: (pkg: CustomizationPackage) => void
  onApply: (pkg: CustomizationPackage) => void
  onSelectDetails: (pkg: CustomizationPackage) => void
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  isInstalled,
  isActive,
  isInstalling,
  installProgress,
  onInstall,
  onApply,
  onSelectDetails,
}) => {
  const formatSize = (bytes: number) => {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
    return Math.round(bytes / 1024) + ' KB'
  }

  return (
    <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md transition-all duration-300 group shadow-lg hover:shadow-cyan-500/5">
      {/* Visual Preview Header */}
      <div>
        <div
          onClick={() => {
            soundService.playClick()
            onSelectDetails(pkg)
          }}
          className={`h-28 w-full rounded-xl bg-gradient-to-tr ${pkg.previewImage} relative overflow-hidden flex items-center justify-center cursor-pointer shadow-inner`}
        >
          {/* Subtle Glass Glint */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10" />

          {/* Badge Overlay */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/10">
              {pkg.category.replace('_', ' ')}
            </span>
            {pkg.isFeatured && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500 text-white shadow-sm flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Featured
              </span>
            )}
          </div>

          {/* Active Ribbon */}
          {isActive && (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-md flex items-center gap-1">
              <Check className="w-3 h-3" /> Active
            </div>
          )}

          <div className="text-white text-center z-10 px-4">
            <span className="font-bold text-sm tracking-wide drop-shadow-md block">{pkg.name}</span>
            <span className="text-[11px] text-white/80 drop-shadow block font-mono">v{pkg.version}</span>
          </div>
        </div>

        {/* Content info */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between">
            <h3
              onClick={() => onSelectDetails(pkg)}
              className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer truncate"
            >
              {pkg.name}
            </h3>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-mono shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{pkg.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
            {pkg.description}
          </p>
        </div>
      </div>

      {/* Footer and Buttons */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
        <span className="text-[10px] text-neutral-500 font-mono">
          {formatSize(pkg.packageSizeBytes)}
        </span>

        <div className="flex items-center gap-2">
          {isInstalling ? (
            <div className="flex items-center gap-2">
              <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${installProgress}%` }}
                  className="bg-cyan-400 h-full transition-all duration-300"
                />
              </div>
              <span className="text-[10px] text-cyan-300 font-mono">{installProgress}%</span>
            </div>
          ) : isInstalled ? (
            <button
              onClick={() => onApply(pkg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-md shadow-cyan-500/20'
              }`}
            >
              {isActive ? 'Applied' : 'Apply'}
            </button>
          ) : (
            <button
              onClick={() => onInstall(pkg)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" /> Install
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
