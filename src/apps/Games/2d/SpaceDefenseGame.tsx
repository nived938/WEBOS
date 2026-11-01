import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Shield, Globe } from 'lucide-react'

interface Asteroid {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

export const SpaceDefenseGame: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [earthHp, setEarthHp] = useState(100)
  const [shieldAngle, setShieldAngle] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const stateRef = useRef({
    asteroids: [] as Asteroid[],
    spawnTimer: 0,
    angle: 0,
  })

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left - 150
    const my = e.clientY - rect.top - 150
    const ang = Math.atan2(my, mx)
    setShieldAngle(ang)
    stateRef.current.angle = ang
  }

  // Physics loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || gameOver) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let lastTime = performance.now()
    const cx = 150
    const cy = 150
    const earthRadius = 24
    const shieldDist = 55

    const loop = (t: number) => {
      animId = requestAnimationFrame(loop)
      const dt = (t - lastTime) / 1000
      lastTime = t

      const st = stateRef.current

      // Spawn Asteroids from circle periphery
      st.spawnTimer += dt
      if (st.spawnTimer > 1.1) {
        st.spawnTimer = 0
        const spawnAng = Math.random() * Math.PI * 2
        const spawnDist = 160
        const ax = cx + Math.cos(spawnAng) * spawnDist
        const ay = cy + Math.sin(spawnAng) * spawnDist

        // Velocity towards Earth center
        const toEarth = Math.atan2(cy - ay, cx - ax)
        const spd = 45 + Math.random() * 25

        st.asteroids.push({
          x: ax,
          y: ay,
          vx: Math.cos(toEarth) * spd,
          vy: Math.sin(toEarth) * spd,
          radius: 7,
        })
      }

      // Update Asteroids
      for (let i = st.asteroids.length - 1; i >= 0; i--) {
        const a = st.asteroids[i]
        a.x += a.vx * dt
        a.y += a.vy * dt

        const distToCenter = Math.hypot(a.x - cx, a.y - cy)

        // Shield Deflection Check
        if (Math.abs(distToCenter - shieldDist) < 12) {
          const asteroidAngle = Math.atan2(a.y - cy, a.x - cx)
          let angleDiff = Math.abs(asteroidAngle - st.angle)
          if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff

          if (angleDiff < 0.45) {
            // Deflected!
            soundService.playClick()
            st.asteroids.splice(i, 1)
            setScore((s) => s + 50)
            continue
          }
        }

        // Earth Impact Check
        if (distToCenter < earthRadius + a.radius) {
          soundService.playTrashEmpty()
          st.asteroids.splice(i, 1)
          setEarthHp((hp) => {
            const next = hp - 20
            if (next <= 0) setGameOver(true)
            return Math.max(0, next)
          })
        }
      }

      // Clear & Draw Space
      ctx.fillStyle = '#090d16'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Orbit guide ring
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(cx, cy, shieldDist, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw Earth
      ctx.fillStyle = '#0284c7'
      ctx.beginPath()
      ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#10b981'
      ctx.beginPath()
      ctx.arc(cx - 5, cy - 4, 10, 0, Math.PI * 2)
      ctx.fill()

      // Draw Shield Arc
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 6
      ctx.shadowColor = '#06b6d4'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(cx, cy, shieldDist, st.angle - 0.45, st.angle + 0.45)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw Asteroids
      ctx.fillStyle = '#94a3b8'
      st.asteroids.forEach((a) => {
        ctx.beginPath()
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#cbd5e1'
        ctx.lineWidth = 1.5
        ctx.stroke()
      })
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [gameOver])

  const reset = () => {
    soundService.playClick()
    stateRef.current.asteroids = []
    setEarthHp(100)
    setScore(0)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-xs flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-sky-500/30">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-sky-300">Defense: {score}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-emerald-400 font-bold">Earth: {earthHp}%</span>
          <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative border-4 border-sky-500/50 rounded-2xl overflow-hidden shadow-2xl bg-neutral-950">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          onMouseMove={handleMouseMove}
          className="cursor-crosshair block"
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-red-500 mb-1">Earth Destroyed!</h3>
            <p className="text-neutral-400 text-xs mb-3">Asteroids Deflected: {score / 50}</p>
            <button onClick={reset} className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 font-bold text-black rounded-lg">
              Protect Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Rotate mouse 360° to aim orbital energy shield • Intercept incoming meteors before impact
      </div>
    </div>
  )
}
