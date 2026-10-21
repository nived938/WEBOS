import React, { useRef, useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Paintbrush, Eraser, Square, Circle, Minus, Download, Trash2, Undo2 } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

type ToolType = 'brush' | 'eraser' | 'line' | 'rect' | 'circle'

const PALETTE = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
]

export const PaintApp: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<ToolType>('brush')
  const [color, setColor] = useState('#3b82f6')
  const [lineWidth, setLineWidth] = useState(4)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [history, setHistory] = useState<ImageData[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions to parent
    canvas.width = canvas.parentElement?.clientWidth || 800
    canvas.height = canvas.parentElement?.clientHeight || 600

    ctx.fillStyle = '#18181b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveState()
  }, [])

  const saveState = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory(prev => [...prev.slice(-15), data])
  }

  const handleUndo = () => {
    if (history.length <= 1) return
    soundService.playClick()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const newHist = [...history]
    newHist.pop()
    const prev = newHist[newHist.length - 1]
    ctx.putImageData(prev, 0, 0)
    setHistory(newHist)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setStartPos({ x, y })

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = tool === 'eraser' ? '#18181b' : color
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 2.5 : lineWidth
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === 'line') {
      ctx.beginPath()
      ctx.moveTo(startPos.x, startPos.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === 'rect') {
      ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y)
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2))
      ctx.beginPath()
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
      ctx.stroke()
    }

    setIsDrawing(false)
    setStartPos(null)
    saveState()
  }

  const handleClear = () => {
    soundService.playClick()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.fillStyle = '#18181b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveState()
  }

  const handleExport = () => {
    soundService.playNotification()
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `nova-drawing-${Date.now()}.png`
    a.click()
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Toolbar */}
      <div className="p-2.5 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between gap-3">
        {/* Tools */}
        <div className="flex items-center space-x-1">
          {[
            { id: 'brush', icon: Paintbrush, label: 'Brush' },
            { id: 'eraser', icon: Eraser, label: 'Eraser' },
            { id: 'line', icon: Minus, label: 'Line' },
            { id: 'rect', icon: Square, label: 'Rectangle' },
            { id: 'circle', icon: Circle, label: 'Circle' },
          ].map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => {
                  soundService.playClick()
                  setTool(t.id as ToolType)
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  tool === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
                title={t.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
        </div>

        {/* Color Palette */}
        <div className="flex items-center space-x-1.5">
          {PALETTE.map(c => (
            <button
              key={c}
              onClick={() => {
                soundService.playClick()
                setColor(c)
                if (tool === 'eraser') setTool('brush')
              }}
              style={{ backgroundColor: c }}
              className={`w-5 h-5 rounded-full border ${color === c ? 'border-white scale-110 shadow-md' : 'border-white/20'}`}
            />
          ))}
        </div>

        {/* Stroke Width Slider */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-neutral-400">Size:</span>
          <input
            type="range"
            min={1}
            max={32}
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 disabled:opacity-30"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Drawing Canvas Area */}
      <div className="flex-1 relative bg-neutral-950 overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="absolute inset-0 block w-full h-full"
        />
      </div>
    </div>
  )
}
