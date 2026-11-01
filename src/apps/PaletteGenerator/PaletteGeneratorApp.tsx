import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Palette, RefreshCw, Copy, Check, Lock, Unlock } from 'lucide-react'

interface Swatch {
  hex: string
  locked: boolean
}

const DEFAULT_SWATCHES: Swatch[] = [
  { hex: '#1E1E2F', locked: false },
  { hex: '#27293D', locked: false },
  { hex: '#E14ECA', locked: false },
  { hex: '#00F2C3', locked: false },
  { hex: '#FD5D93', locked: false },
]

export const PaletteGeneratorApp: React.FC<AppInstanceProps> = () => {
  const [swatches, setSwatches] = useState<Swatch[]>(DEFAULT_SWATCHES)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  const getRandomHex = () =>
    '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()

  const generateNew = () => {
    soundService.play('buttonClick')
    setSwatches((prev) =>
      prev.map((s) => (s.locked ? s : { ...s, hex: getRandomHex() }))
    )
  }

  const toggleLock = (index: number) => {
    soundService.play('buttonClick')
    setSwatches((prev) =>
      prev.map((s, i) => (i === index ? { ...s, locked: !s.locked } : s))
    )
  }

  const copyColor = (hex: string) => {
    soundService.play('buttonClick')
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 1500)
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-pink-400" />
          <span className="font-semibold text-white">Harmonic Color Studio</span>
        </div>

        <button
          onClick={generateNew}
          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow transition-colors"
        >
          <RefreshCw size={12} /> Generate Palette
        </button>
      </div>

      {/* Palette Swatches Row */}
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 overflow-hidden">
        {swatches.map((swatch, idx) => (
          <div
            key={idx}
            style={{ backgroundColor: swatch.hex }}
            className="flex-1 flex flex-col justify-between p-6 transition-colors duration-300 relative group"
          >
            <div className="flex justify-end">
              <button
                onClick={() => toggleLock(idx)}
                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                title={swatch.locked ? 'Unlock Color' : 'Lock Color'}
              >
                {swatch.locked ? <Lock size={14} className="text-amber-400" /> : <Unlock size={14} />}
              </button>
            </div>

            <div className="bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-mono text-sm font-bold text-white block">
                  {swatch.hex}
                </span>
                <span className="text-[10px] text-neutral-400">Color #{idx + 1}</span>
              </div>
              <button
                onClick={() => copyColor(swatch.hex)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                title="Copy HEX"
              >
                {copiedHex === swatch.hex ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
