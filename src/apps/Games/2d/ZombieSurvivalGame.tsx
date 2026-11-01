import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Heart, Shield, Award } from 'lucide-react'

interface Zombie {
  id: number
  x: number
  y: number
  hp: number
  speed: number
}

interface Bullet {
  x: number
  y: number
  vx: number
  vy: number
}

export const ZombieSurvivalGame: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [wave, setWave] = useState(1)
  const [hp, setHp] = useState(100)
  const [ammo, setAmmo] = useState(30)
  const [gameOver, setGameOver] = useState(false)

  const stateRef = useRef({
    player: { x: 200, y: 150, angle: 0 },
    bullets: [] as Bullet[],
    zombies: [] as Zombie[],
    nextZId: 1,
    keys: { w: false, a: false, s: false, d: false },
    mouse: { x: 200, y: 150 },
    spawnTimer: 0,
    waveZombiesLeft: 10,
  })

  // Keyboard & Mouse inputs
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') stateRef.current.keys.w = true
      if (e.key === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.a = true
      if (e.key === 's' || e.key === 'ArrowDown') stateRef.current.keys.s = true
      if (e.key === 'd' || e.key === 'ArrowRight') stateRef.current.keys.d = true
      if (e.key === 'r') {
        soundService.playClick()
        setAmmo(30)
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') stateRef.current.keys.w = false
      if (e.key === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.a = false
      if (e.key === 's' || e.key === 'ArrowDown') stateRef.current.keys.s = false
      if (e.key === 'd' || e.key === 'ArrowRight') stateRef.current.keys.d = false
    }

    const mouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      stateRef.current.mouse.x = e.clientX - rect.left
      stateRef.current.mouse.y = e.clientY - rect.top
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('mousemove', mouseMove)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('mousemove', mouseMove)
    }
  }, [])

  // Shoot on click
  const handleMouseDown = () => {
    if (gameOver || ammo <= 0) return
    const st = stateRef.current
    const p = st.player
    const angle = Math.atan2(st.mouse.y - p.y, st.mouse.x - p.x)

    soundService.playClick()
    setAmmo((a) => a - 1)

    st.bullets.push({
      x: p.x,
      y: p.y,
      vx: Math.cos(angle) * 12,
      vy: Math.sin(angle) * 12,
    })
  }

  // Survival Game Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || gameOver) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let lastTime = performance.now()

    const loop = (t: number) => {
      animId = requestAnimationFrame(loop)
      const dt = (t - lastTime) / 1000
      lastTime = t

      const st = stateRef.current
      const p = st.player

      // Player Movement
      const moveSpeed = 110 * dt
      if (st.keys.w) p.y = Math.max(16, p.y - moveSpeed)
      if (st.keys.s) p.y = Math.min(canvas.height - 16, p.y + moveSpeed)
      if (st.keys.a) p.x = Math.max(16, p.x - moveSpeed)
      if (st.keys.d) p.x = Math.min(canvas.width - 16, p.x + moveSpeed)

      p.angle = Math.atan2(st.mouse.y - p.y, st.mouse.x - p.x)

      // Spawn Zombies
      st.spawnTimer += dt
      if (st.spawnTimer > 1.2 && st.waveZombiesLeft > 0) {
        st.spawnTimer = 0
        st.waveZombiesLeft--
        const side = Math.floor(Math.random() * 4)
        let zx = 0, zy = 0
        if (side === 0) { zx = Math.random() * canvas.width; zy = -10 }
        if (side === 1) { zx = canvas.width + 10; zy = Math.random() * canvas.height }
        if (side === 2) { zx = Math.random() * canvas.width; zy = canvas.height + 10 }
        if (side === 3) { zx = -10; zy = Math.random() * canvas.height }

        st.zombies.push({
          id: st.nextZId++,
          x: zx,
          y: zy,
          hp: 20 + wave * 5,
          speed: 40 + Math.random() * 20 + wave * 5,
        })
      }

      // Update Bullets
      for (let i = st.bullets.length - 1; i >= 0; i--) {
        const b = st.bullets[i]
        b.x += b.vx
        b.y += b.vy
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
          st.bullets.splice(i, 1)
        }
      }

      // Update Zombies
      for (let i = st.zombies.length - 1; i >= 0; i--) {
        const z = st.zombies[i]
        const angle = Math.atan2(p.y - z.y, p.x - z.x)
        z.x += Math.cos(angle) * z.speed * dt
        z.y += Math.sin(angle) * z.speed * dt

        // Check bite player
        if (Math.hypot(p.x - z.x, p.y - z.y) < 16) {
          setHp((h) => {
            const next = h - 1
            if (next <= 0) setGameOver(true)
            return Math.max(0, next)
          })
        }

        // Bullet collisions
        for (let j = st.bullets.length - 1; j >= 0; j--) {
          const b = st.bullets[j]
          if (Math.hypot(b.x - z.x, b.y - z.y) < 14) {
            z.hp -= 25
            st.bullets.splice(j, 1)
            if (z.hp <= 0) {
              st.zombies.splice(i, 1)
              setScore((s) => s + 50)
              soundService.playClick()
              break
            }
          }
        }
      }

      // Wave advancement
      if (st.waveZombiesLeft === 0 && st.zombies.length === 0) {
        soundService.playNotification()
        setWave((w) => w + 1)
        st.waveZombiesLeft = 12 + wave * 4
        setAmmo(30)
      }

      // Render
      ctx.fillStyle = '#090d16'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw Grid ground
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw Bullets
      ctx.fillStyle = '#facc15'
      st.bullets.forEach((b) => {
        ctx.beginPath()
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw Zombies
      ctx.fillStyle = '#22c55e'
      st.zombies.forEach((z) => {
        ctx.beginPath()
        ctx.arc(z.x, z.y, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ef4444'
        ctx.fillRect(z.x - 8, z.y - 14, 16, 2)
        ctx.fillStyle = '#22c55e'
      })

      // Draw Player
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.arc(0, 0, 11, 0, Math.PI * 2)
      ctx.fill()
      // Gun barrel
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(6, -2, 10, 4)
      ctx.restore()
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [gameOver, wave])

  const reset = () => {
    soundService.playClick()
    stateRef.current.player = { x: 200, y: 150, angle: 0 }
    stateRef.current.bullets = []
    stateRef.current.zombies = []
    stateRef.current.waveZombiesLeft = 10
    setHp(100)
    setAmmo(30)
    setScore(0)
    setWave(1)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-md flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-red-500/30">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-red-400">Outbreak 2D</span>
          <span className="text-emerald-400 font-bold">HP: {hp}%</span>
          <span className="text-amber-300 font-bold">Ammo: {ammo}/30</span>
          <span className="text-neutral-400">Wave: {wave}</span>
        </div>
        <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative border-2 border-red-500/50 rounded-2xl overflow-hidden shadow-2xl bg-neutral-950">
        <canvas
          ref={canvasRef}
          width={420}
          height={300}
          onMouseDown={handleMouseDown}
          className="cursor-crosshair block"
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-red-500 mb-1">Infection Overrun!</h3>
            <p className="text-neutral-400 text-xs mb-3">Score: {score} • Survived to Wave {wave}</p>
            <button onClick={reset} className="px-4 py-1.5 bg-red-600 hover:bg-red-500 font-bold text-white rounded-lg">
              Fight Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        WASD to Move • Mouse Aim & Click to Shoot • Press 'R' to Reload Ammo
      </div>
    </div>
  )
}
