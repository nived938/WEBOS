import React, { useRef, useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Calculator, Play, RotateCcw } from 'lucide-react'

export const MathematicsStudioApp: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [expression, setExpression] = useState('Math.sin(x) * 2')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#15151c'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const scale = 30

    // Grid lines
    ctx.strokeStyle = '#272733'
    ctx.lineWidth = 1

    for (let x = 0; x < canvas.width; x += scale) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += scale) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, cy)
    ctx.lineTo(canvas.width, cy)
    ctx.moveTo(cx, 0)
    ctx.lineTo(cx, canvas.height)
    ctx.stroke()

    // Plot function
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2.5
    ctx.beginPath()

    let started = false

    for (let px = 0; px < canvas.width; px++) {
      const x = (px - cx) / scale
      try {
        const fn = new Function('x', 'Math', `return ${expression};`)
        const y = fn(x, Math)
        const py = cy - y * scale

        if (!started) {
          ctx.moveTo(px, py)
          started = true
        } else {
          ctx.lineTo(px, py)
        }
      } catch {
        // syntax error
      }
    }
    ctx.stroke()
  }, [expression])

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-cyan-400" />
          <span className="font-semibold text-white text-xs">Mathematics & Function Plotter</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Presets:</span>
          {['Math.sin(x) * 2', 'x * x * 0.1', 'Math.cos(x) + Math.sin(2*x)'].map((p) => (
            <button
              key={p}
              onClick={() => {
                soundService.play('buttonClick')
                setExpression(p)
              }}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-[10px]"
            >
              f(x)
            </button>
          ))}
        </div>
      </div>

      {/* Expression input */}
      <div className="p-3 bg-black/20 border-b border-white/10 flex items-center gap-3">
        <span className="text-xs font-mono font-bold text-cyan-400">f(x) =</span>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Plot Canvas */}
      <div className="flex-1 p-4 bg-black/60 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={380}
          className="border border-white/10 rounded-xl shadow-2xl bg-[#15151c]"
        />
      </div>
    </div>
  )
}
