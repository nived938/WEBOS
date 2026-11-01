import React, { useRef, useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Activity, Play, Pause, Waves, Sparkles, Disc } from 'lucide-react'

export const MusicVisualizerApp: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [visualMode, setVisualMode] = useState<'bars' | 'wave' | 'particles'>('bars')

  useEffect(() => {
    let animId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let phase = 0

    const render = () => {
      ctx.fillStyle = 'rgba(15, 15, 25, 0.25)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      phase += 0.05
      const barCount = 48
      const barWidth = canvas.width / barCount

      if (visualMode === 'bars') {
        for (let i = 0; i < barCount; i++) {
          const height = isPlaying
            ? Math.abs(Math.sin(phase + i * 0.2)) * (canvas.height * 0.7) + 15
            : 10

          const grad = ctx.createLinearGradient(0, canvas.height, 0, 0)
          grad.addColorStop(0, '#3b82f6')
          grad.addColorStop(0.5, '#ec4899')
          grad.addColorStop(1, '#00F2C3')

          ctx.fillStyle = grad
          ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 3, height)
        }
      } else if (visualMode === 'wave') {
        ctx.beginPath()
        ctx.strokeStyle = '#00F2C3'
        ctx.lineWidth = 3
        for (let x = 0; x < canvas.width; x += 4) {
          const y =
            canvas.height / 2 +
            (isPlaying ? Math.sin(x * 0.02 + phase) * 60 * Math.cos(phase * 0.5) : 0)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      } else {
        // Particles
        for (let p = 0; p < 30; p++) {
          const px = ((p * 25 + phase * 40) % canvas.width)
          const py =
            canvas.height / 2 +
            (isPlaying ? Math.sin(phase + p) * 100 : 0)
          ctx.fillStyle = '#ec4899'
          ctx.beginPath()
          ctx.arc(px, py, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [isPlaying, visualMode])

  const togglePlayback = () => {
    soundService.play('buttonClick')
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="flex flex-col h-full bg-[#121218] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" />
          <span className="font-semibold text-white text-xs">Audio Spectrum Visualizer</span>
        </div>

        <div className="flex items-center gap-1.5">
          {(['bars', 'wave', 'particles'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                soundService.play('buttonClick')
                setVisualMode(m)
              }}
              className={`px-2.5 py-1 rounded text-xs capitalize ${
                visualMode === m ? 'bg-white/20 text-white font-medium' : 'bg-white/5 text-neutral-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        <canvas ref={canvasRef} width={640} height={380} className="w-full h-full" />

        {/* Center overlay play control */}
        <div className="absolute bottom-6 flex items-center gap-4 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl">
          <button
            onClick={togglePlayback}
            className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center shadow-lg transition-transform active:scale-95"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
          </button>
          <div>
            <div className="text-xs font-semibold text-white">NOVA Ambient Synth 01</div>
            <div className="text-[10px] text-neutral-400 font-mono">
              {isPlaying ? 'Playing 44.1 kHz Audio' : 'Paused'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
