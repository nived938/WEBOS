import React, { useRef, useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import {
  Pen,
  Square,
  Circle,
  ArrowRight,
  Eraser,
  Download,
  Trash2,
  Undo2,
} from 'lucide-react'

type ToolMode = 'pen' | 'rect' | 'circle' | 'arrow' | 'eraser'

export const WhiteboardApp: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [tool, setTool] = useState<ToolMode>('pen')
  const [color, setColor] = useState('#3b82f6')
  const [lineWidth, setLineWidth] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [snapshot, setSnapshot] = useState<ImageData | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#1e1e24'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setStartPos({ x, y })
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height))

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = tool === 'eraser' ? '#1e1e24' : color
    ctx.lineWidth = tool === 'eraser' ? 24 : lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (snapshot) {
      ctx.putImageData(snapshot, 0, 0)
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth

      if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y)
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
        )
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
      } else if (tool === 'arrow') {
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
    }
  }

  const handlePointerUp = () => {
    setIsDrawing(false)
  }

  const handleClear = () => {
    soundService.play('buttonClick')
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#1e1e24'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleDownload = () => {
    soundService.play('buttonClick')
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-[#18181e] text-neutral-200 font-sans select-none">
      {/* Whiteboard Controls */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool('pen')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
              tool === 'pen' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <Pen size={14} /> Pen
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
              tool === 'rect' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <Square size={14} /> Rectangle
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
              tool === 'circle' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <Circle size={14} /> Circle
          </button>
          <button
            onClick={() => setTool('arrow')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
              tool === 'arrow' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <ArrowRight size={14} /> Arrow
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
              tool === 'eraser' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <Eraser size={14} /> Eraser
          </button>

          <div className="h-4 w-[1px] bg-white/15 mx-1" />

          {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#ffffff'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-5 h-5 rounded-full border ${
                color === c ? 'border-white scale-110' : 'border-transparent'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-xs hover:bg-white/10 text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <Trash2 size={14} /> Clear
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow"
          >
            <Download size={14} /> Export PNG
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-black/60 p-4 flex justify-center items-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="border border-white/10 rounded-xl shadow-2xl cursor-crosshair bg-[#1e1e24]"
        />
      </div>
    </div>
  )
}
