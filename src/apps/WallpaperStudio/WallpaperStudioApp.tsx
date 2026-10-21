import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Sparkles, Check, Copy, Monitor, RefreshCw, Palette } from 'lucide-react'
import { useSettings } from '@/core/settings/settingsStore'
import { soundService } from '@/core/audio/soundService'

export const WallpaperStudioApp: React.FC<AppInstanceProps> = () => {
  const { updateSettings } = useSettings()
  const [c1, setC1] = useState('#6366f1')
  const [c2, setC2] = useState('#ec4899')
  const [c3, setC3] = useState('#06b6d4')
  const [c4, setC4] = useState('#0f172a')
  const [applied, setApplied] = useState(false)
  const [copied, setCopied] = useState(false)

  const generatedStyle = `radial-gradient(at 20% 20%, ${c1} 0%, transparent 50%), radial-gradient(at 80% 30%, ${c2} 0%, transparent 50%), radial-gradient(at 40% 80%, ${c3} 0%, transparent 55%), radial-gradient(at 90% 90%, ${c1} 0%, transparent 40%), ${c4}`

  const handleApplyToDesktop = () => {
    soundService.playNotification()
    // Set custom wallpaper URL as generated data CSS style
    updateSettings({
      customWallpaperUrl: generatedStyle
    })
    setApplied(true)
    setTimeout(() => setApplied(false), 2500)
  }

  const handleRandomize = () => {
    soundService.playClick()
    const randColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    setC1(randColor())
    setC2(randColor())
    setC3(randColor())
  }

  const handleCopyCSS = () => {
    soundService.playClick()
    navigator.clipboard.writeText(`background: ${generatedStyle};`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-y-auto text-xs">
      {/* Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-pink-400" />
          <span className="font-semibold text-white">Wallpaper Studio</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRandomize}
            className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Randomize</span>
          </button>
          <button
            onClick={handleApplyToDesktop}
            className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-white font-medium shadow-md transition-all"
          >
            {applied ? <Check className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            <span>{applied ? 'Applied to Desktop!' : 'Apply to Desktop'}</span>
          </button>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full space-y-6">
        {/* Live Preview Display Card */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Live Desktop Canvas Simulation</span>
            <button onClick={handleCopyCSS} className="hover:text-white flex items-center space-x-1">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied CSS' : 'Copy CSS'}</span>
            </button>
          </div>

          <div
            style={{ background: generatedStyle }}
            className="w-full h-64 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="text-center font-bold text-lg text-white drop-shadow-md">
              NOVA OS 2.0
            </div>

            <div className="h-6 w-48 bg-white/15 backdrop-blur-md rounded-full mx-auto border border-white/20" />
          </div>
        </div>

        {/* 4 Point Color Pickers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-neutral-950/70 rounded-xl border border-white/5 space-y-2">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Primary Focus</span>
            <div className="flex items-center space-x-2">
              <input type="color" value={c1} onChange={e => setC1(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
              <span className="font-mono text-xs">{c1.toUpperCase()}</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-950/70 rounded-xl border border-white/5 space-y-2">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Accent Flow</span>
            <div className="flex items-center space-x-2">
              <input type="color" value={c2} onChange={e => setC2(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
              <span className="font-mono text-xs">{c2.toUpperCase()}</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-950/70 rounded-xl border border-white/5 space-y-2">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Deep Glow</span>
            <div className="flex items-center space-x-2">
              <input type="color" value={c3} onChange={e => setC3(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
              <span className="font-mono text-xs">{c3.toUpperCase()}</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-950/70 rounded-xl border border-white/5 space-y-2">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Base Atmosphere</span>
            <div className="flex items-center space-x-2">
              <input type="color" value={c4} onChange={e => setC4(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
              <span className="font-mono text-xs">{c4.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
