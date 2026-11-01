import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Flag } from 'lucide-react'

export const MiniGolfGame: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hole, setHole] = useState(1)
  const [strokes, setStrokes] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [isAiming, setIsAiming] = useState(false)
  const [wonHole, setWonHole] = useState(false)

  const stateRef = useRef({
    ball: { x: 50, y: 150, vx: 0, vy: 0, r: 6 },
    holeTarget: { x: 260, y: 150, r: 10 },
    obstacles: [
      { x: 140, y: 80, w: 20, h: 140 },
    ],
    aimStart: { x: 0, y: 0 },
    aimCurrent: { x: 0, y: 0 },
  })

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || wonHole) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Only aim if ball is stationary
    const b = stateRef.current.ball
    if (Math.hypot(b.vx, b.vy) < 0.2) {
      setIsAiming(true)
      stateRef.current.aimStart = { x, y }
      stateRef.current.aimCurrent = { x, y }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAiming) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    stateRef.current.aimCurrent = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleMouseUp = () => {
    if (!isAiming) return
    setIsAiming(false)
    const st = stateRef.current
    const dx = st.aimStart.x - st.aimCurrent.x
    const dy = st.aimStart.y - st.aimCurrent.y
    const power = Math.min(Math.hypot(dx, dy) * 0.12, 12)
    const angle = Math.atan2(dy, dx)

    soundService.playClick()
    st.ball.vx = Math.cos(angle) * power
    st.ball.vy = Math.sin(angle) * power
    setStrokes((s) => s + 1)
  }

  // Golf loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const friction = 0.98

    const loop = () => {
      animId = requestAnimationFrame(loop)
      const st = stateRef.current
      const b = st.ball
      const h = st.holeTarget

      // Ball Physics
      b.vx *= friction
      b.vy *= friction
      b.x += b.vx
      b.y += b.vy

      if (Math.hypot(b.vx, b.vy) < 0.05) {
        b.vx = 0
        b.vy = 0
      }

      // Walls
      if (b.x - b.r < 15) { b.x = 15 + b.r; b.vx = -b.vx * 0.8; soundService.playClick() }
      if (b.x + b.r > 285) { b.x = 285 - b.r; b.vx = -b.vx * 0.8; soundService.playClick() }
      if (b.y - b.r < 15) { b.y = 15 + b.r; b.vy = -b.vy * 0.8; soundService.playClick() }
      if (b.y + b.r > 285) { b.y = 285 - b.r; b.vy = -b.vy * 0.8; soundService.playClick() }

      // Obstacles
      st.obstacles.forEach((ob) => {
        if (
          b.x + b.r > ob.x &&
          b.x - b.r < ob.x + ob.w &&
          b.y + b.r > ob.y &&
          b.y - b.r < ob.y + ob.h
        ) {
          b.vx = -b.vx * 0.8
          b.vy = -b.vy * 0.8
          soundService.playClick()
        }
      })

      // Check In Hole
      if (!wonHole && Math.hypot(b.x - h.x, b.y - h.y) < h.r && Math.hypot(b.vx, b.vy) < 2) {
        soundService.playNotification()
        b.vx = 0
        b.vy = 0
        b.x = h.x
        b.y = h.y
        setWonHole(true)
        setTotalScore((t) => t + strokes + 1)
      }

      // Render Green
      ctx.fillStyle = '#064e3b'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 4
      ctx.strokeRect(10, 10, 280, 280)

      // Hole
      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(h.x, h.y - 18, 2, 18)
      ctx.beginPath()
      ctx.moveTo(h.x + 2, h.y - 18)
      ctx.lineTo(h.x + 12, h.y - 12)
      ctx.lineTo(h.x + 2, h.y - 8)
      ctx.fill()

      // Obstacles
      ctx.fillStyle = '#1e293b'
      st.obstacles.forEach((ob) => {
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h)
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 2
        ctx.strokeRect(ob.x, ob.y, ob.w, ob.h)
      })

      // Ball
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fill()

      // Aim Line
      if (isAiming) {
        ctx.strokeStyle = '#facc15'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(b.x, b.y)
        ctx.lineTo(b.x + (st.aimStart.x - st.aimCurrent.x), b.y + (st.aimStart.y - st.aimCurrent.y))
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [isAiming, wonHole, strokes])

  const nextHole = () => {
    soundService.playStartup()
    setHole((h) => h + 1)
    setStrokes(0)
    setWonHole(false)
    stateRef.current.ball = { x: 50, y: 150, vx: 0, vy: 0, r: 6 }
    stateRef.current.holeTarget = {
      x: 230 + Math.floor(Math.random() * 40),
      y: 60 + Math.floor(Math.random() * 180),
      r: 10,
    }
  }

  const reset = () => {
    soundService.playClick()
    setHole(1)
    setStrokes(0)
    setTotalScore(0)
    setWonHole(false)
    stateRef.current.ball = { x: 50, y: 150, vx: 0, vy: 0, r: 6 }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-xs flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-emerald-500/30">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">Hole {hole} (Par 3)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-300">Strokes: {strokes}</span>
          <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative border-4 border-emerald-500/50 rounded-2xl overflow-hidden shadow-2xl bg-neutral-950">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="cursor-crosshair block"
        />

        {wonHole && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <Trophy className="w-10 h-10 text-yellow-400 mb-1 animate-bounce" />
            <h3 className="text-base font-bold text-emerald-400">Hole Completed!</h3>
            <p className="text-neutral-400 text-xs mb-3">Strokes taken: {strokes}</p>
            <button
              onClick={nextHole}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 font-bold text-black rounded-lg shadow"
            >
              Next Hole ➔
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Click & drag away from the ball to set slingshot power and aim • Release to putt
      </div>
    </div>
  )
}
