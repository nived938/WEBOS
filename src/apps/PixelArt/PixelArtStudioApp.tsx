import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Grid, Eraser, PaintBucket, Download, Trash2, Pen } from 'lucide-react'

const GRID_SIZE = 16
const PALETTE = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

export const PixelArtStudioApp: React.FC<AppInstanceProps> = () => {
  const [pixels, setPixels] = useState<string[]>(Array(GRID_SIZE * GRID_SIZE).fill('#1f1f28'))
  const [activeColor, setActiveColor] = useState('#3b82f6')
  const [tool, setTool] = useState<'pen' | 'eraser' | 'bucket'>('pen')

  const handlePixelClick = (index: number) => {
    soundService.play('buttonClick')
    if (tool === 'pen') {
      setPixels((prev) => {
        const next = [...prev]
        next[index] = activeColor
        return next
      })
    } else if (tool === 'eraser') {
      setPixels((prev) => {
        const next = [...prev]
        next[index] = '#1f1f28'
        return next
      })
    } else if (tool === 'bucket') {
      const targetColor = pixels[index]
      if (targetColor === activeColor) return
      setPixels((prev) => prev.map((c) => (c === targetColor ? activeColor : c)))
    }
  }

  const clearCanvas = () => {
    soundService.play('buttonClick')
    setPixels(Array(GRID_SIZE * GRID_SIZE).fill('#1f1f28'))
  }

  const exportPng = () => {
    soundService.play('buttonClick')
    const canvas = document.createElement('canvas')
    const scale = 20
    canvas.width = GRID_SIZE * scale
    canvas.height = GRID_SIZE * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    pixels.forEach((color, i) => {
      const x = (i % GRID_SIZE) * scale
      const y = Math.floor(i / GRID_SIZE) * scale
      ctx.fillStyle = color
      ctx.fillRect(x, y, scale, scale)
    })

    const link = document.createElement('a')
    link.download = 'pixel-art.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-[#141419] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool('pen')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
              tool === 'pen' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <Pen size={13} /> Pen
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
              tool === 'eraser' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <Eraser size={13} /> Eraser
          </button>
          <button
            onClick={() => setTool('bucket')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
              tool === 'bucket' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <PaintBucket size={13} /> Fill
          </button>

          <div className="h-4 w-[1px] bg-white/15 mx-1" />

          {/* Color swatches */}
          <div className="flex items-center gap-1">
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setActiveColor(c)}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded border ${
                  activeColor === c ? 'border-white scale-110' : 'border-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            className="p-1.5 rounded-lg text-xs hover:bg-white/10 text-neutral-400 hover:text-red-400 flex items-center gap-1"
          >
            <Trash2 size={13} /> Clear
          </button>
          <button
            onClick={exportPng}
            className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
          >
            <Download size={13} /> Export PNG
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="flex-1 flex items-center justify-center p-6 bg-black/60 overflow-auto">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: '320px',
            height: '320px',
          }}
          className="border border-white/20 shadow-2xl rounded-lg overflow-hidden bg-[#1f1f28]"
        >
          {pixels.map((color, i) => (
            <div
              key={i}
              onClick={() => handlePixelClick(i)}
              style={{ backgroundColor: color }}
              className="border-[0.5px] border-white/5 cursor-pointer hover:opacity-80 transition-opacity"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
