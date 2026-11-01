import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Square, Circle, Star, Type, Download, Trash2 } from 'lucide-react'

interface VectorShape {
  id: string
  type: 'rect' | 'circle' | 'star' | 'text'
  x: number
  y: number
  fill: string
  stroke: string
  size: number
  text?: string
}

export const VectorDrawingApp: React.FC<AppInstanceProps> = () => {
  const [shapes, setShapes] = useState<VectorShape[]>([
    { id: 's1', type: 'rect', x: 80, y: 80, fill: '#3b82f6', stroke: '#ffffff', size: 100 },
    { id: 's2', type: 'circle', x: 260, y: 130, fill: '#ec4899', stroke: '#ffffff', size: 60 },
    { id: 's3', type: 'text', x: 100, y: 260, fill: '#f59e0b', stroke: '#000000', size: 24, text: 'NOVA OS Vectors' },
  ])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeColor, setActiveColor] = useState('#10b981')

  const addShape = (type: 'rect' | 'circle' | 'star' | 'text') => {
    soundService.play('buttonClick')
    const newShape: VectorShape = {
      id: 'shp_' + Date.now(),
      type,
      x: 150 + Math.random() * 80,
      y: 100 + Math.random() * 80,
      fill: activeColor,
      stroke: '#ffffff',
      size: type === 'text' ? 20 : 80,
      text: type === 'text' ? 'New Label' : undefined,
    }
    setShapes((prev) => [...prev, newShape])
    setSelectedId(newShape.id)
  }

  const deleteSelected = () => {
    if (!selectedId) return
    soundService.play('buttonClick')
    setShapes((prev) => prev.filter((s) => s.id !== selectedId))
    setSelectedId(null)
  }

  const exportSvg = () => {
    soundService.play('buttonClick')
    const svgEl = document.getElementById('vector-canvas-svg')
    if (!svgEl) return
    const content = svgEl.outerHTML
    const blob = new Blob([content], { type: 'image/svg+xml' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'vector-art.svg'
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => addShape('rect')}
            className="p-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/15 flex items-center gap-1"
          >
            <Square size={13} /> Rectangle
          </button>
          <button
            onClick={() => addShape('circle')}
            className="p-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/15 flex items-center gap-1"
          >
            <Circle size={13} /> Circle
          </button>
          <button
            onClick={() => addShape('text')}
            className="p-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/15 flex items-center gap-1"
          >
            <Type size={13} /> Text
          </button>

          <div className="h-4 w-[1px] bg-white/15 mx-1" />

          {['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'].map((c) => (
            <button
              key={c}
              onClick={() => {
                setActiveColor(c)
                if (selectedId) {
                  setShapes((prev) =>
                    prev.map((s) => (s.id === selectedId ? { ...s, fill: c } : s))
                  )
                }
              }}
              style={{ backgroundColor: c }}
              className={`w-5 h-5 rounded-full border ${
                activeColor === c ? 'border-white scale-110' : 'border-transparent'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {selectedId && (
            <button
              onClick={deleteSelected}
              className="p-1.5 rounded text-xs text-red-400 hover:bg-white/10 flex items-center gap-1"
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
          <button
            onClick={exportSvg}
            className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
          >
            <Download size={13} /> Export SVG
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 bg-black/60 p-6 flex items-center justify-center overflow-auto">
        <svg
          id="vector-canvas-svg"
          width={600}
          height={400}
          className="bg-[#1e1e26] border border-white/10 rounded-xl shadow-2xl"
        >
          {shapes.map((s) => {
            const isSelected = selectedId === s.id
            if (s.type === 'rect') {
              return (
                <rect
                  key={s.id}
                  x={s.x}
                  y={s.y}
                  width={s.size}
                  height={s.size * 0.75}
                  fill={s.fill}
                  stroke={isSelected ? '#ffffff' : s.stroke}
                  strokeWidth={isSelected ? 3 : 1}
                  onClick={() => {
                    soundService.play('buttonClick')
                    setSelectedId(s.id)
                  }}
                  className="cursor-pointer"
                />
              )
            } else if (s.type === 'circle') {
              return (
                <circle
                  key={s.id}
                  cx={s.x}
                  cy={s.y}
                  r={s.size / 2}
                  fill={s.fill}
                  stroke={isSelected ? '#ffffff' : s.stroke}
                  strokeWidth={isSelected ? 3 : 1}
                  onClick={() => {
                    soundService.play('buttonClick')
                    setSelectedId(s.id)
                  }}
                  className="cursor-pointer"
                />
              )
            } else if (s.type === 'text') {
              return (
                <text
                  key={s.id}
                  x={s.x}
                  y={s.y}
                  fill={s.fill}
                  fontSize={s.size}
                  fontFamily="Inter, sans-serif"
                  fontWeight="bold"
                  onClick={() => {
                    soundService.play('buttonClick')
                    setSelectedId(s.id)
                  }}
                  className="cursor-pointer select-none"
                >
                  {s.text}
                </text>
              )
            }
            return null
          })}
        </svg>
      </div>
    </div>
  )
}
