import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Gauge } from 'lucide-react'

export const RetroRacingGame: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [speed, setSpeed] = useState(0)
  const [distance, setDistance] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const stateRef = useRef({
    player: { x: 150, y: 320, width: 26, height: 44, speed: 0 },
    roadOffset: 0,
    traffic: [
      { x: 90, y: -60, speed: 3, color: '#ef4444' },
      { x: 150, y: -220, speed: 4, color: '#eab308' },
      { x: 210, y: -380, speed: 3.5, color: '#06b6d4' },
    ],
    keys: { left: false, right: false, up: false, down: false },
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') stateRef.current.keys.left = true
      if (e.key === 'ArrowRight' || e.key === 'd') stateRef.current.keys.right = true
      if (e.key === 'ArrowUp' || e.key === 'w') stateRef.current.keys.up = true
      if (e.key === 'ArrowDown' || e.key === 's') stateRef.current.keys.down = true
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') stateRef.current.keys.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') stateRef.current.keys.right = false
      if (e.key === 'ArrowUp' || e.key === 'w') stateRef.current.keys.up = false
      if (e.key === 'ArrowDown' || e.key === 's') stateRef.current.keys.down = false
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Racing Game Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || gameOver) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const loop = () => {
      animId = requestAnimationFrame(loop)
      const st = stateRef.current
      const p = st.player

      // Acceleration / Braking
      if (st.keys.up) p.speed = Math.min(p.speed + 0.15, 8.5)
      else if (st.keys.down) p.speed = Math.max(p.speed - 0.25, 0)
      else p.speed = Math.max(p.speed - 0.05, 0)

      // Steering
      if (st.keys.left) p.x = Math.max(p.x - 4, 60)
      if (st.keys.right) p.x = Math.min(p.x + 4, 240)

      setSpeed(Math.floor(p.speed * 20))
      setDistance((d) => {
        const next = d + Math.floor(p.speed)
        if (next > highScore) setHighScore(next)
        return next
      })

      // Road scroll
      st.roadOffset = (st.roadOffset + p.speed * 4) % 40

      // Clear & Draw Road
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Road asphalt
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(50, 0, 200, canvas.height)

      // Road borders
      ctx.fillStyle = '#ef4444'
      for (let y = -40; y < canvas.height; y += 40) {
        ctx.fillRect(45, (y + st.roadOffset) % (canvas.height + 40), 5, 20)
        ctx.fillRect(250, (y + st.roadOffset) % (canvas.height + 40), 5, 20)
      }

      // Center dashed lines
      ctx.fillStyle = '#f8fafc'
      for (let y = -40; y < canvas.height; y += 40) {
        ctx.fillRect(115, (y + st.roadOffset) % (canvas.height + 40), 4, 20)
        ctx.fillRect(180, (y + st.roadOffset) % (canvas.height + 40), 4, 20)
      }

      // Traffic
      st.traffic.forEach((car) => {
        car.y += p.speed - car.speed
        if (car.y > canvas.height + 60) {
          car.y = -80
          const lanes = [80, 150, 210]
          car.x = lanes[Math.floor(Math.random() * lanes.length)]
        }

        // Draw traffic car
        ctx.fillStyle = car.color
        ctx.fillRect(car.x - 12, car.y - 20, 24, 40)
        ctx.fillStyle = '#000000'
        ctx.fillRect(car.x - 14, car.y - 14, 4, 8)
        ctx.fillRect(car.x + 10, car.y - 14, 4, 8)
        ctx.fillRect(car.x - 14, car.y + 6, 4, 8)
        ctx.fillRect(car.x + 10, car.y + 6, 4, 8)

        // Collision Check
        if (
          Math.abs(p.x - car.x) < 22 &&
          Math.abs(p.y - car.y) < 36
        ) {
          soundService.playTrashEmpty()
          setGameOver(true)
        }
      })

      // Draw Player Car
      ctx.fillStyle = '#38bdf8'
      ctx.fillRect(p.x - 13, p.y - 22, p.width, p.height)
      // Windshield
      ctx.fillStyle = '#0284c7'
      ctx.fillRect(p.x - 9, p.y - 10, 18, 12)
      // Wheels
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(p.x - 16, p.y - 16, 4, 10)
      ctx.fillRect(p.x + 12, p.y - 16, 4, 10)
      ctx.fillRect(p.x - 16, p.y + 6, 4, 10)
      ctx.fillRect(p.x + 12, p.y + 6, 4, 10)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [gameOver, highScore])

  const reset = () => {
    soundService.playClick()
    stateRef.current.player = { x: 150, y: 320, width: 26, height: 44, speed: 0 }
    stateRef.current.traffic = [
      { x: 90, y: -60, speed: 3, color: '#ef4444' },
      { x: 150, y: -220, speed: 4, color: '#eab308' },
      { x: 210, y: -380, speed: 3.5, color: '#06b6d4' },
    ]
    setDistance(0)
    setSpeed(0)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-xs flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-sky-500/30">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-sky-400" />
          <span className="font-bold">{speed} KM/H</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-300">Dist: {distance}m</span>
          <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative border-4 border-sky-500/50 rounded-2xl overflow-hidden shadow-2xl bg-neutral-950">
        <canvas ref={canvasRef} width={300} height={400} className="block" />

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-red-500 mb-1">Crash!</h3>
            <p className="text-neutral-400 text-xs mb-3">Total Distance: {distance} meters</p>
            <button onClick={reset} className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 font-bold text-black rounded-lg">
              Drive Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Up / W = Accelerate • Down / S = Brake • Left / Right = Steer
      </div>
    </div>
  )
}
