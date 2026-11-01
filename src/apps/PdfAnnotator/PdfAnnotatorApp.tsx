import React, { useRef, useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import {
  Pen,
  Highlighter,
  Eraser,
  MessageSquarePlus,
  Download,
  Trash2,
  Undo,
  Palette,
} from 'lucide-react'

interface Note {
  id: string
  x: number
  y: number
  text: string
}

export const PdfAnnotatorApp: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser' | 'note'>('pen')
  const [strokeColor, setStrokeColor] = useState('#3b82f6')
  const [lineWidth, setLineWidth] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', x: 260, y: 120, text: 'Review section 1.2 on Optical Compositor pipelines' },
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw document placeholder background on canvas
    ctx.fillStyle = '#22222a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px Inter, sans-serif'
    ctx.fillText('NOVA OS Kernel Specifications (Annotated Copy)', 36, 48)

    ctx.fillStyle = '#9ca3af'
    ctx.font = '12px Inter, sans-serif'
    const sampleText = [
      '1. Architectural Overview of Virtual Window Pipelines',
      'The compositor utilizes double-buffered canvas structures to isolate',
      'specular glass optics from window content frames.',
      '',
      '2. Memory Management in Client-Side VFS',
      'Chunks are partitioned into 64KB blocks stored within IndexedDB.',
      'Deduplication hashes verify data integrity on each write cycle.',
    ]
    sampleText.forEach((line, index) => {
      ctx.fillText(line, 36, 90 + index * 22)
    })
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === 'note') {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setNotes((prev) => [
        ...prev,
        { id: Math.random().toString(), x, y, text: 'New annotation note' },
      ])
      soundService.play('buttonClick')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(x, y)

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = 20
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = strokeColor + '66' // Semi-transparent
      ctx.lineWidth = lineWidth * 4
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = lineWidth
    }
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

    ctx.lineTo(x, y)
    ctx.stroke()
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
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setNotes([])
  }

  const handleDownload = () => {
    soundService.play('buttonClick')
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'annotated-doc.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-[#18181f] text-neutral-200 select-none font-sans">
      {/* Annotator Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.play('buttonClick')
              setTool('pen')
            }}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs transition-colors ${
              tool === 'pen' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <Pen size={14} /> Pen
          </button>
          <button
            onClick={() => {
              soundService.play('buttonClick')
              setTool('highlighter')
            }}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs transition-colors ${
              tool === 'highlighter' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <Highlighter size={14} /> Highlighter
          </button>
          <button
            onClick={() => {
              soundService.play('buttonClick')
              setTool('eraser')
            }}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs transition-colors ${
              tool === 'eraser' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <Eraser size={14} /> Eraser
          </button>
          <button
            onClick={() => {
              soundService.play('buttonClick')
              setTool('note')
            }}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs transition-colors ${
              tool === 'note' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <MessageSquarePlus size={14} /> Sticky Note
          </button>
          <div className="h-4 w-[1px] bg-white/15 mx-1" />
          <div className="flex items-center gap-1">
            {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map((color) => (
              <button
                key={color}
                onClick={() => setStrokeColor(color)}
                style={{ backgroundColor: color }}
                className={`w-5 h-5 rounded-full border ${
                  strokeColor === color ? 'border-white scale-110' : 'border-transparent'
                }`}
              />
            ))}
          </div>
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
            className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 font-medium shadow-md"
          >
            <Download size={14} /> Export Document
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-black/60 p-6 flex justify-center relative">
        <div className="relative shadow-2xl rounded-lg overflow-hidden border border-white/10">
          <canvas
            ref={canvasRef}
            width={600}
            height={800}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="cursor-crosshair bg-[#22222a]"
          />

          {/* Sticky Notes */}
          {notes.map((n) => (
            <div
              key={n.id}
              style={{ left: n.x, top: n.y }}
              className="absolute z-10 w-48 p-2.5 bg-amber-200 text-amber-950 text-xs rounded-md shadow-xl border border-amber-300 font-sans"
            >
              <div className="flex justify-between items-center mb-1 text-[10px] text-amber-800 font-semibold">
                <span>Sticky Note</span>
                <button
                  onClick={() => setNotes((prev) => prev.filter((item) => item.id !== n.id))}
                  className="hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              </div>
              <textarea
                value={n.text}
                onChange={(e) => {
                  const val = e.target.value
                  setNotes((prev) =>
                    prev.map((item) => (item.id === n.id ? { ...item, text: val } : item))
                  )
                }}
                className="w-full bg-transparent resize-none focus:outline-none text-xs leading-snug"
                rows={3}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
