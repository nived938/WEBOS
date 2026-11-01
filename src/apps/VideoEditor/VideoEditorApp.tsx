import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Play, Pause, Film, Download, Sliders, Scissors } from 'lucide-react'

export const VideoEditorApp: React.FC<AppInstanceProps> = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(12)
  const [filter, setFilter] = useState<'normal' | 'cinema' | 'cyberpunk' | 'mono'>('normal')
  const [textOverlay, setTextOverlay] = useState('NOVA OS Clip 01')

  const togglePlay = () => {
    soundService.play('buttonClick')
    setIsPlaying(!isPlaying)
  }

  const getFilterStyle = () => {
    switch (filter) {
      case 'cinema':
        return 'contrast(125%) saturate(85%) sepia(20%)'
      case 'cyberpunk':
        return 'contrast(140%) hue-rotate(180deg) saturate(150%)'
      case 'mono':
        return 'grayscale(100%) contrast(120%)'
      default:
        return 'none'
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film size={16} className="text-blue-400" />
          <span className="font-semibold text-white text-xs">Video Timeline Studio</span>
        </div>

        <button
          onClick={() => {
            soundService.play('buttonClick')
            alert('Video rendered and saved to Downloads folder.')
          }}
          className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
        >
          <Download size={13} /> Export Render
        </button>
      </div>

      {/* Video Viewport */}
      <div className="flex-1 bg-black p-6 flex items-center justify-center relative overflow-hidden">
        <div
          style={{ filter: getFilterStyle() }}
          className="w-full max-w-xl aspect-video bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-xl border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden"
        >
          {/* Simulated Video Content */}
          <div className="text-center">
            <Film size={48} className="mx-auto text-blue-400/40 mb-3" />
            <h2 className="text-xl font-bold text-white tracking-wider drop-shadow-md">
              {textOverlay}
            </h2>
            <span className="text-xs text-neutral-400 font-mono">00:{currentTime}:00 / 01:00:00</span>
          </div>
        </div>
      </div>

      {/* Timeline & Controls */}
      <div className="h-32 border-t border-white/10 bg-black/40 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <span className="font-mono text-xs text-neutral-300">
              00:{currentTime.toString().padStart(2, '0')}s
            </span>
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400 mr-1">LUT Filter:</span>
            {(['normal', 'cinema', 'cyberpunk', 'mono'] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  soundService.play('buttonClick')
                  setFilter(f)
                }}
                className={`px-2.5 py-1 rounded text-xs capitalize ${
                  filter === f ? 'bg-white/20 text-white font-medium' : 'bg-white/5 text-neutral-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline scrubber bar */}
        <div>
          <input
            type="range"
            min={0}
            max={60}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
