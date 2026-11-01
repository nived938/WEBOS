import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { ArrowRightLeft, Download, Sliders, Image as ImageIcon } from 'lucide-react'

export const ImageConverterApp: React.FC<AppInstanceProps> = () => {
  const [sourceFormat, setSourceFormat] = useState('PNG')
  const [targetFormat, setTargetFormat] = useState<'JPEG' | 'WEBP' | 'PNG'>('WEBP')
  const [quality, setQuality] = useState(85)
  const [isConverting, setIsConverting] = useState(false)

  const handleConvert = () => {
    soundService.play('buttonClick')
    setIsConverting(true)
    setTimeout(() => {
      setIsConverting(false)
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 400
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#1e1e2d'
      ctx.fillRect(0, 0, 600, 400)
      ctx.fillStyle = '#38bdf8'
      ctx.font = '20px Inter, sans-serif'
      ctx.fillText(`Converted to ${targetFormat} (${quality}%)`, 40, 200)

      const mime = targetFormat === 'JPEG' ? 'image/jpeg' : targetFormat === 'WEBP' ? 'image/webp' : 'image/png'
      const link = document.createElement('a')
      link.download = `converted-asset.${targetFormat.toLowerCase()}`
      link.href = canvas.toDataURL(mime, quality / 100)
      link.click()
    }, 600)
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden p-6 justify-center items-center">
      <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <ArrowRightLeft size={18} className="text-blue-400" />
          <h2 className="text-sm font-bold text-white">Image Format & Compression Studio</h2>
        </div>

        {/* Target format */}
        <div>
          <label className="text-xs text-neutral-400 block mb-2 font-medium">Output Format</label>
          <div className="grid grid-cols-3 gap-2">
            {(['WEBP', 'JPEG', 'PNG'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => {
                  soundService.play('buttonClick')
                  setTargetFormat(fmt)
                }}
                className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  targetFormat === fmt
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-400'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Slider */}
        {targetFormat !== 'PNG' && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-neutral-400">Quality Compression</span>
              <span className="font-mono text-white">{quality}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        )}

        {/* Estimated size */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
          <span className="text-neutral-400">Estimated Output Size:</span>
          <span className="font-mono text-emerald-400 font-bold">
            ~{Math.round(240 * (quality / 100))} KB
          </span>
        </div>

        <button
          onClick={handleConvert}
          disabled={isConverting}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
        >
          <Download size={14} /> {isConverting ? 'Processing Buffer...' : `Export as .${targetFormat.toLowerCase()}`}
        </button>
      </div>
    </div>
  )
}
