import React, { useState } from 'react'
import {
  Sparkles,
  Monitor,
  Gamepad2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sliders,
  AlertTriangle,
} from 'lucide-react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import type { GpuCapabilities } from '../types'
import type { AppId } from '@/types'

interface GpuTabProps {
  gpuInfo: GpuCapabilities
  runningAppIds: AppId[]
}

const KNOWN_3D_GAMES: { appId: AppId; name: string }[] = [
  { appId: 'game_blockworld', name: 'NOVA Blockworld 3D' },
  { appId: 'game_marble3d', name: 'Marble Runner 3D' },
  { appId: 'game_space3d', name: 'Space Tunnel 3D' },
  { appId: 'game_voxel3d', name: 'Voxel Island 3D' },
  { appId: 'game_racing3d', name: 'Hyper Racing 3D' },
  { appId: 'game_flight3d', name: 'Sky Flight 3D' },
  { appId: 'game_parkour3d', name: 'Rooftop Parkour 3D' },
  { appId: 'game_dungeon3d', name: 'Dungeon Crawler 3D' },
  { appId: 'game_spaceadv3d', name: 'Cosmic Cruiser 3D' },
  { appId: 'game_battle3d', name: 'Cyber Mech Arena 3D' },
  { appId: 'game_citybuilder3d', name: 'Metropolis 3D' },
  { appId: 'game_farming3d', name: 'Cyber Farm 3D' },
  { appId: 'game_obstacle3d', name: 'Wipeout Run 3D' },
  { appId: 'game_planet3d', name: 'Planetoid Odyssey 3D' },
  { appId: 'game_kart3d', name: 'Nova Kart Grand Prix' },
]

export const GpuTab: React.FC<GpuTabProps> = ({ gpuInfo, runningAppIds }) => {
  const { settings, updateSettings } = useSettings()
  const [selectedPreset, setSelectedPreset] = useState<'low' | 'balanced' | 'high' | 'ultra'>(
    settings.performanceMode === 'low' ? 'low' : settings.performanceMode === 'balanced' ? 'balanced' : 'high'
  )

  const active3dGames = KNOWN_3D_GAMES.filter((g) => runningAppIds.includes(g.appId))

  const handlePresetSelect = (preset: 'low' | 'balanced' | 'high' | 'ultra') => {
    soundService.playClick()
    setSelectedPreset(preset)
    const mode = preset === 'ultra' ? 'high' : preset
    updateSettings({ performanceMode: mode })
  }

  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-6">
      {/* Active 3D Games Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Active 3D Three.js Contexts</h3>
          </div>
          <span className="text-xs text-purple-300 font-mono px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
            {active3dGames.length} Active Game{active3dGames.length === 1 ? '' : 's'}
          </span>
        </div>

        {active3dGames.length === 0 ? (
          <p className="pt-4 text-xs text-neutral-400">
            No 3D WebGL games are currently rendering. Launching NOVA Blockworld or other 3D games will activate hardware-accelerated shaders.
          </p>
        ) : (
          <div className="pt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {active3dGames.map((game) => (
              <div key={game.appId} className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-purple-200 block">{game.name}</span>
                  <span className="text-[10px] text-purple-400 font-mono">AppId: {game.appId}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GPU Capabilities Grid */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Monitor className="w-4 h-4 text-cyan-400" /> WebGL Hardware Acceleration Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[11px] text-neutral-400 block">Compositor Version</span>
            <span className="text-xs font-bold text-white font-mono">{gpuInfo.webglVersion}</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[11px] text-neutral-400 block">Unmasked GPU Renderer</span>
            <span className="text-xs font-bold text-white font-mono truncate block" title={gpuInfo.unmaskedRenderer}>
              {gpuInfo.unmaskedRenderer}
            </span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[11px] text-neutral-400 block">Maximum Texture Resolution</span>
            <span className="text-xs font-bold text-white font-mono">{gpuInfo.maxTextureSize} × {gpuInfo.maxTextureSize} px</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[11px] text-neutral-400 block">Maximum Viewport Dimensions</span>
            <span className="text-xs font-bold text-white font-mono">
              {gpuInfo.maxViewportDims[0]} × {gpuInfo.maxViewportDims[1]} px
            </span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[11px] text-neutral-400 block">Vendor String</span>
            <span className="text-xs font-bold text-white font-mono">{gpuInfo.vendor}</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[11px] text-neutral-400 block">Supported Extensions</span>
            <span className="text-xs font-bold text-white font-mono">{gpuInfo.supportedExtensionsCount} Extensions</span>
          </div>
        </div>
      </div>

      {/* GPU Quality Presets */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" /> GPU Shading & Resolution Preset
          </h3>
          <span className="text-[10px] text-neutral-400">Syncs with NOVA Gaming Settings</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'low', label: 'Low', desc: 'No shadows, 1.0x pixel ratio, low draw distance' },
            { id: 'balanced', label: 'Medium', desc: 'Basic shadows, native resolution' },
            { id: 'high', label: 'High', desc: 'Soft directional shadows, bloom, high draw' },
            { id: 'ultra', label: 'Ultra', desc: 'Maximum shadow map 2048px, antialiasing, high particles' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id as any)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedPreset === preset.id
                  ? 'bg-emerald-500/20 border-emerald-500/50 shadow-md shadow-emerald-500/20'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{preset.label}</span>
                {selectedPreset === preset.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <span className="text-[10px] text-neutral-400 leading-tight block">{preset.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
