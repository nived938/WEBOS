import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Shield, Sparkles, Download, Circle, Hexagon } from 'lucide-react'

export const LogoMakerApp: React.FC<AppInstanceProps> = () => {
  const [logoText, setLogoText] = useState('NOVA')
  const [badgeShape, setBadgeShape] = useState<'circle' | 'shield' | 'hexagon'>('circle')
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6')

  const exportSvg = () => {
    soundService.play('buttonClick')
    const svgEl = document.getElementById('logo-preview-svg')
    if (!svgEl) return
    const blob = new Blob([svgEl.outerHTML], { type: 'image/svg+xml' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${logoText.toLowerCase()}-logo.svg`
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <span className="font-semibold text-white">Brand Logo Studio</span>
        </div>

        <button
          onClick={exportSvg}
          className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
        >
          <Download size={13} /> Export SVG Logo
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Controls */}
        <div className="w-full md:w-64 bg-black/30 border-r border-white/10 p-4 space-y-4">
          <div>
            <label className="text-xs text-neutral-400 block mb-1">Brand Name</label>
            <input
              type="text"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-1">Badge Geometry</label>
            <div className="grid grid-cols-3 gap-2">
              {(['circle', 'shield', 'hexagon'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    soundService.play('buttonClick')
                    setBadgeShape(s)
                  }}
                  className={`p-2 rounded-lg text-xs capitalize flex flex-col items-center gap-1 ${
                    badgeShape === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-1">Gradients</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
              />
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live SVG Preview */}
        <div className="flex-1 bg-black/60 p-8 flex items-center justify-center">
          <svg id="logo-preview-svg" width={320} height={320} viewBox="0 0 320 320">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={primaryColor} />
                <stop offset="100%" stopColor={secondaryColor} />
              </linearGradient>
            </defs>
            {badgeShape === 'circle' && <circle cx={160} cy={160} r={140} fill="url(#logo-grad)" />}
            {badgeShape === 'shield' && (
              <path
                d="M160 20 L280 60 L280 180 Q160 300 160 300 Q40 180 40 60 Z"
                fill="url(#logo-grad)"
              />
            )}
            {badgeShape === 'hexagon' && (
              <polygon points="160,20 280,85 280,235 160,300 40,235 40,85" fill="url(#logo-grad)" />
            )}
            <text
              x={160}
              y={175}
              fill="#ffffff"
              fontSize={44}
              fontFamily="Inter, sans-serif"
              fontWeight="900"
              textAnchor="middle"
              letterSpacing={2}
            >
              {logoText}
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}
