import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Film, Play, Pause, Plus, Trash2, Download } from 'lucide-react'

export const GifCreatorApp: React.FC<AppInstanceProps> = () => {
  const [frames, setFrames] = useState<string[]>([
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  ])
  const [activeFrameIndex, setActiveFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [fps, setFps] = useState(4)

  useEffect(() => {
    let timer: any = null
    if (isPlaying && frames.length > 0) {
      timer = setInterval(() => {
        setActiveFrameIndex((curr) => (curr + 1) % frames.length)
      }, 1000 / fps)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPlaying, fps, frames.length])

  const addFrame = () => {
    soundService.play('buttonClick')
    const randomColor =
      '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    setFrames((prev) => [...prev, randomColor])
  }

  const deleteFrame = (index: number) => {
    if (frames.length <= 1) return
    soundService.play('buttonClick')
    setFrames((prev) => prev.filter((_, i) => i !== index))
  }

  const handleExport = () => {
    soundService.play('buttonClick')
    alert('GIF Sequence exported successfully.')
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film size={16} className="text-amber-400" />
          <span className="font-semibold text-white text-xs">GIF Animator Studio</span>
        </div>

        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
        >
          <Download size={13} /> Export Animated GIF
        </button>
      </div>

      {/* Main Preview */}
      <div className="flex-1 bg-black/60 p-6 flex flex-col items-center justify-center gap-4">
        <div
          style={{ backgroundColor: frames[activeFrameIndex] }}
          className="w-56 h-56 rounded-2xl shadow-2xl border-4 border-white/20 transition-colors duration-75 flex items-center justify-center"
        >
          <span className="text-white font-mono font-bold text-xl drop-shadow-md">
            Frame #{activeFrameIndex + 1}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundService.play('buttonClick')
              setIsPlaying(!isPlaying)
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white shadow"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400">Speed:</span>
            <input
              type="range"
              min={1}
              max={15}
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-24 accent-blue-500"
            />
            <span className="font-mono text-white">{fps} FPS</span>
          </div>
        </div>
      </div>

      {/* Frame Strip */}
      <div className="h-28 border-t border-white/10 bg-black/40 p-3 flex items-center gap-3 overflow-x-auto">
        {frames.map((color, i) => (
          <div
            key={i}
            onClick={() => setActiveFrameIndex(i)}
            style={{ backgroundColor: color }}
            className={`w-16 h-16 rounded-xl flex-shrink-0 cursor-pointer border-2 transition-all relative group flex items-center justify-center ${
              activeFrameIndex === i
                ? 'border-white scale-105 shadow-lg'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-white drop-shadow">#{i + 1}</span>
            {frames.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteFrame(i)
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px]"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addFrame}
          className="w-16 h-16 rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 flex items-center justify-center text-neutral-400 hover:text-white flex-shrink-0 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  )
}
