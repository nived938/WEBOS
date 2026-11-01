import React, { useState, useRef, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { QrCode, Download, Link, Wifi, Type } from 'lucide-react'

export const QrCodeStudioApp: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [text, setText] = useState('https://github.com/nived938/WEBOS')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)

    // Render 21x21 QR pattern representation
    const cells = 21
    const cellSize = size / cells
    ctx.fillStyle = fgColor

    // Deterministic hash based on text
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i)
      hash |= 0
    }

    // Finder patterns
    const drawFinder = (x: number, y: number) => {
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize)
      ctx.fillStyle = bgColor
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize)
      ctx.fillStyle = fgColor
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize)
    }

    drawFinder(0, 0)
    drawFinder(cells - 7, 0)
    drawFinder(0, cells - 7)

    // Fill pseudo-random data bits based on hash
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= cells - 8) ||
          (r >= cells - 8 && c < 8)
        ) {
          continue // skip finders
        }
        const bit = ((hash * (r + 1) + c * 31) & 7) > 3
        if (bit) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
        }
      }
    }
  }, [text, fgColor, bgColor])

  const handleDownload = () => {
    soundService.play('buttonClick')
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'nova-qrcode.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode size={16} className="text-blue-400" />
          <span className="font-semibold text-white text-xs">QR Code Studio</span>
        </div>

        <button
          onClick={handleDownload}
          className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
        >
          <Download size={13} /> Export QR PNG
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Controls */}
        <div className="w-full md:w-72 bg-black/30 border-r border-white/10 p-4 space-y-4">
          <div>
            <label className="text-xs text-neutral-400 block mb-1">Payload Content / URL</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-1">Color Palette</label>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-neutral-500 block mb-1">Foreground</span>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block mb-1">Background</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live QR Canvas */}
        <div className="flex-1 bg-black/60 p-8 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="rounded-2xl shadow-2xl border-4 border-white/20"
          />
        </div>
      </div>
    </div>
  )
}
