import React from 'react'
import { RotateCcw, Info, ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react'

interface AboutSectionProps {
  onShowResetModal: () => void
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onShowResetModal }) => {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">About NOVA OS</h3>
        <p className="text-neutral-400 text-xs">
          Operating system specifications, release notes, license, and factory restoration.
        </p>
      </div>

      {/* Hero Branding Card */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-neutral-900/40 border border-white/15 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-blue-500/20">
          N
        </div>
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>NOVA OS</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
              v2.5.0 Tahoe
            </span>
          </h3>
          <p className="text-xs text-neutral-300 mt-0.5">Liquid Glass Web Operating System</p>
          <p className="text-[11px] text-neutral-500 mt-1">Inspired by modern desktop elegance and fluid ergonomics</p>
        </div>
      </div>

      {/* System Specifications */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 divide-y divide-white/5 text-xs">
        <div className="flex justify-between py-2 items-center">
          <span className="text-neutral-400">Architecture</span>
          <span className="text-white font-medium">React 19 &bull; Vite 8 &bull; Three.js &bull; Tailwind 4</span>
        </div>
        <div className="flex justify-between py-2 items-center">
          <span className="text-neutral-400">Design System</span>
          <span className="text-white font-medium">Liquid Glass Optic Engine</span>
        </div>
        <div className="flex justify-between py-2 items-center">
          <span className="text-neutral-400">License</span>
          <span className="text-white font-medium">MIT Open Source License</span>
        </div>
        <div className="flex justify-between py-2 items-center">
          <span className="text-neutral-400">Release Channel</span>
          <span className="text-cyan-300 font-mono font-semibold">Stable (Cosmic-2.5)</span>
        </div>
      </div>

      {/* Factory Reset Danger Zone */}
      <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 flex items-center justify-between">
        <div>
          <div className="font-semibold text-white text-xs">Factory Reset</div>
          <div className="text-[11px] text-neutral-400">Restore all settings, themes, and filesystem to clean initial state</div>
        </div>
        <button
          onClick={onShowResetModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white transition font-medium text-xs shadow-md"
        >
          <RotateCcw size={13} />
          <span>Reset All OS Data</span>
        </button>
      </div>
    </div>
  )
}
