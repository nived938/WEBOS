import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Pipette, Copy, Check, Palette, Sparkles, RefreshCw } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

export const ColorPickerApp: React.FC<AppInstanceProps> = () => {
  const [hex, setHex] = useState('#3b82f6')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [savedPalette, setSavedPalette] = useState<string[]>([
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'
  ])

  // Convert hex to rgb
  const hexToRgb = (hexStr: string) => {
    let cleaned = hexStr.replace('#', '')
    if (cleaned.length === 3) {
      cleaned = cleaned.split('').map(c => c + c).join('')
    }
    const num = parseInt(cleaned, 16)
    if (isNaN(num)) return { r: 59, g: 130, b: 246 }
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    }
  }

  const rgb = hexToRgb(hex)
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`

  // Luminance & WCAG contrast
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  const isLight = luminance > 0.5

  const copyToClipboard = (text: string, key: string) => {
    soundService.playNotification()
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const saveCurrentColor = () => {
    soundService.playClick()
    if (!savedPalette.includes(hex)) {
      setSavedPalette(prev => [hex, ...prev.slice(0, 11)])
    }
  }

  // Derive harmonic colors
  const complementaryHex = `#${(0xFFFFFF ^ parseInt(hex.replace('#', ''), 16)).toString(16).padStart(6, '0')}`

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-y-auto">
      {/* Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-violet-400" />
          <span className="font-semibold text-neutral-200">Color Studio & Harmony</span>
        </div>
        <button
          onClick={saveCurrentColor}
          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-medium text-white transition-colors"
        >
          Save Swatch
        </button>
      </div>

      <div className="p-5 max-w-md mx-auto w-full space-y-5">
        {/* Color Display Preview */}
        <div
          style={{ backgroundColor: hex }}
          className="h-32 rounded-2xl border border-white/10 shadow-xl flex items-center justify-center transition-colors relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          <span
            style={{ color: isLight ? '#000' : '#fff' }}
            className="text-2xl font-mono font-bold tracking-wider relative drop-shadow-sm uppercase"
          >
            {hex}
          </span>
        </div>

        {/* Color Input Picker */}
        <div className="flex items-center space-x-3 bg-neutral-800/60 p-3 rounded-xl border border-white/5">
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
          />
          <div className="flex-1">
            <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-0.5">Custom Hex</label>
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-xs font-mono uppercase text-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Values Copy Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div
            onClick={() => copyToClipboard(hex, 'hex')}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div>
              <div className="text-[10px] text-neutral-400 font-sans">HEX</div>
              <div className="font-semibold text-white mt-0.5">{hex.toUpperCase()}</div>
            </div>
            {copiedKey === 'hex' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-500" />}
          </div>

          <div
            onClick={() => copyToClipboard(rgbString, 'rgb')}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div>
              <div className="text-[10px] text-neutral-400 font-sans">RGB</div>
              <div className="font-semibold text-white mt-0.5">{rgbString}</div>
            </div>
            {copiedKey === 'rgb' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-500" />}
          </div>
        </div>

        {/* Harmonies */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-neutral-300">Complementary Color</div>
          <div
            onClick={() => setHex(complementaryHex)}
            style={{ backgroundColor: complementaryHex }}
            className="h-10 rounded-xl border border-white/10 flex items-center justify-between px-3 cursor-pointer shadow-sm"
          >
            <span className="text-xs font-mono font-bold" style={{ color: isLight ? '#fff' : '#000' }}>
              {complementaryHex.toUpperCase()}
            </span>
            <span className="text-[10px] font-sans opacity-70" style={{ color: isLight ? '#fff' : '#000' }}>Click to apply</span>
          </div>
        </div>

        {/* Saved Swatches */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-neutral-300">Saved Palette</div>
          <div className="grid grid-cols-6 gap-2">
            {savedPalette.map((color, i) => (
              <button
                key={i}
                onClick={() => {
                  soundService.playClick()
                  setHex(color)
                }}
                style={{ backgroundColor: color }}
                className="h-9 rounded-lg border border-white/10 hover:scale-105 transition-transform"
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
