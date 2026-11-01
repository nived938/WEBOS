import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Sparkles, Download, Layers, Box, Cpu, Compass, Globe } from 'lucide-react'

const GLYPHS = [
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Layers', icon: Layers },
  { name: 'Box', icon: Box },
  { name: 'Cpu', icon: Cpu },
  { name: 'Compass', icon: Compass },
  { name: 'Globe', icon: Globe },
]

export const IconDesignerApp: React.FC<AppInstanceProps> = () => {
  const [selectedGlyphIndex, setSelectedGlyphIndex] = useState(0)
  const [gradientStart, setGradientStart] = useState('#3b82f6')
  const [gradientEnd, setGradientEnd] = useState('#8b5cf6')
  const [cornerRadius, setCornerRadius] = useState(24)

  const CurrentIcon = GLYPHS[selectedGlyphIndex].icon

  const handleExport = () => {
    soundService.play('buttonClick')
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const grad = ctx.createLinearGradient(0, 0, 256, 256)
    grad.addColorStop(0, gradientStart)
    grad.addColorStop(1, gradientEnd)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(0, 0, 256, 256, cornerRadius * 2)
    ctx.fill()

    const link = document.createElement('a')
    link.download = 'app-icon-256.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <span className="font-semibold text-white text-xs">Squircle App Icon Studio</span>
        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
        >
          <Download size={13} /> Export 256x256 PNG
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Controls */}
        <div className="w-full md:w-64 bg-black/30 border-r border-white/10 p-4 space-y-4">
          <div>
            <label className="text-xs text-neutral-400 block mb-2">Center Glyph</label>
            <div className="grid grid-cols-3 gap-2">
              {GLYPHS.map((g, idx) => {
                const IconComponent = g.icon
                return (
                  <button
                    key={g.name}
                    onClick={() => {
                      soundService.play('buttonClick')
                      setSelectedGlyphIndex(idx)
                    }}
                    className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                      selectedGlyphIndex === idx
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                    }`}
                  >
                    <IconComponent size={18} />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">Squircle Radius</span>
              <span className="text-white font-mono">{cornerRadius}px</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              value={cornerRadius}
              onChange={(e) => setCornerRadius(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-1">Colors</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={gradientStart}
                onChange={(e) => setGradientStart(e.target.value)}
                className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
              />
              <input
                type="color"
                value={gradientEnd}
                onChange={(e) => setGradientEnd(e.target.value)}
                className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="flex-1 bg-black/60 p-8 flex flex-col items-center justify-center gap-6">
          <div
            style={{
              background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
              borderRadius: `${cornerRadius}px`,
            }}
            className="w-36 h-36 shadow-2xl flex items-center justify-center border border-white/20"
          >
            <CurrentIcon size={64} className="text-white drop-shadow-md" />
          </div>

          <div className="text-xs text-neutral-400">Preview at 144px scale</div>
        </div>
      </div>
    </div>
  )
}
