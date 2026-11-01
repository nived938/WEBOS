import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Palette, Copy, Check, Sliders, Image as ImageIcon } from 'lucide-react'

export const GradientDesignerApp: React.FC<AppInstanceProps> = () => {
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear')
  const [angle, setAngle] = useState(135)
  const [color1, setColor1] = useState('#0f172a')
  const [color2, setColor2] = useState('#3b82f6')
  const [color3, setColor3] = useState('#8b5cf6')
  const [copied, setCopied] = useState(false)

  const cssGradient =
    gradientType === 'linear'
      ? `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`
      : `radial-gradient(circle at center, ${color1} 0%, ${color2} 60%, ${color3} 100%)`

  const handleCopy = () => {
    soundService.play('buttonClick')
    navigator.clipboard.writeText(`background: ${cssGradient};`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-pink-400" />
          <span className="font-semibold text-white">Gradient Studio</span>
        </div>

        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied CSS' : 'Copy CSS'}
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Controls */}
        <div className="w-full md:w-64 bg-black/30 border-r border-white/10 p-4 space-y-4">
          <div>
            <label className="text-xs text-neutral-400 block mb-1">Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setGradientType('linear')}
                className={`flex-1 py-1.5 rounded-lg text-xs ${
                  gradientType === 'linear' ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-400'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => setGradientType('radial')}
                className={`flex-1 py-1.5 rounded-lg text-xs ${
                  gradientType === 'radial' ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-400'
                }`}
              >
                Radial
              </button>
            </div>
          </div>

          {gradientType === 'linear' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Angle</span>
                <span className="text-white font-mono">{angle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-neutral-400 block mb-2">Color Stops</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className="w-9 h-9 rounded-lg bg-transparent cursor-pointer"
              />
              <input
                type="color"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className="w-9 h-9 rounded-lg bg-transparent cursor-pointer"
              />
              <input
                type="color"
                value={color3}
                onChange={(e) => setColor3(e.target.value)}
                className="w-9 h-9 rounded-lg bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div
          style={{ background: cssGradient }}
          className="flex-1 flex items-center justify-center p-6 shadow-inner transition-all duration-300"
        >
          <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/20 text-xs font-mono text-white max-w-sm text-center">
            {cssGradient}
          </div>
        </div>
      </div>
    </div>
  )
}
