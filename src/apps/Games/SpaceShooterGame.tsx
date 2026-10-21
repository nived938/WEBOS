import React, { useRef, useEffect, useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { RotateCcw, Trophy, Shield, Zap } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

export const SpaceShooterGame: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(100)
  const [gameOver, setGameOver] = useState(false)

  const stateRef = useRef({
    playerX: 180,
    playerY: 340,
    lasers: [] as { x: number; y: number }[],
    enemies: [] as { x: number; y: number; vx: number; hp: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    score: 0,
    health: 100,
    dead: false,
    keys: {} as { [k: string]: boolean }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 400
    canvas.height = 400

    let animId: number
    let lastSpawn = 0
    let lastFire = 0

    const update = (time: number) => {
      animId = requestAnimationFrame(update)
      const s = stateRef.current
      if (s.dead) return

      // Controls
      const speed = 4
      if (s.keys['arrowleft'] || s.keys['a']) s.playerX = Math.max(16, s.playerX - speed)
      if (s.keys['arrowright'] || s.keys['d']) s.playerX = Math.min(canvas.width - 16, s.playerX + speed)

      // Auto / space fire
      if (time - lastFire > 180) {
        s.lasers.push({ x: s.playerX - 8, y: s.playerY })
        s.lasers.push({ x: s.playerX + 8, y: s.playerY })
        lastFire = time
      }

      // Spawn enemy
      if (time - lastSpawn > 800) {
        s.enemies.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: -20,
          vx: (Math.random() - 0.5) * 2,
          hp: 2
        })
        lastSpawn = time
      }

      // Move lasers
      for (let i = s.lasers.length - 1; i >= 0; i--) {
        s.lasers[i].y -= 8
        if (s.lasers[i].y < 0) s.lasers.splice(i, 1)
      }

      // Move enemies
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const e = s.enemies[i]
        e.y += 2.2
        e.x += e.vx
        if (e.x < 10 || e.x > canvas.width - 10) e.vx *= -1

        // Collision with lasers
        for (let j = s.lasers.length - 1; j >= 0; j--) {
          const l = s.lasers[j]
          if (Math.abs(l.x - e.x) < 14 && Math.abs(l.y - e.y) < 14) {
            s.lasers.splice(j, 1)
            e.hp--
            if (e.hp <= 0) {
              soundService.playClick()
              // Spawn particles
              for (let p = 0; p < 8; p++) {
                s.particles.push({
                  x: e.x,
                  y: e.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  life: 15,
                  color: '#f59e0b'
                })
              }
              s.enemies.splice(i, 1)
              s.score += 50
              setScore(s.score)
              break
            }
          }
        }

        // Enemy hits bottom or player
        if (e && e.y > canvas.height) {
          s.enemies.splice(i, 1)
          s.health -= 15
          setHealth(Math.max(0, s.health))
          if (s.health <= 0) {
            s.dead = true
            setGameOver(true)
            soundService.playNotification()
          }
        }
      }

      // Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life--
        if (p.life <= 0) s.particles.splice(i, 1)
      }

      // Draw Render
      ctx.fillStyle = '#05070e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Starfield background
      ctx.fillStyle = '#ffffff'
      for (let st = 0; st < 25; st++) {
        ctx.fillRect((st * 47) % canvas.width, (st * 89 + time * 0.1) % canvas.height, 1.5, 1.5)
      }

      // Draw Lasers
      ctx.fillStyle = '#00f0ff'
      s.lasers.forEach(l => {
        ctx.fillRect(l.x - 1.5, l.y, 3, 10)
      })

      // Draw Enemies
      s.enemies.forEach(e => {
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.moveTo(e.x, e.y + 12)
        ctx.lineTo(e.x - 12, e.y - 8)
        ctx.lineTo(e.x + 12, e.y - 8)
        ctx.closePath()
        ctx.fill()
      })

      // Draw Particles
      s.particles.forEach(p => {
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, 2.5, 2.5)
      })

      // Draw Player Ship
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.moveTo(s.playerX, s.playerY - 14)
      ctx.lineTo(s.playerX - 14, s.playerY + 12)
      ctx.lineTo(s.playerX + 14, s.playerY + 12)
      ctx.closePath()
      ctx.fill()
    }

    animId = requestAnimationFrame(update)

    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const restart = () => {
    soundService.playClick()
    const s = stateRef.current
    s.playerX = 180
    s.playerY = 340
    s.lasers = []
    s.enemies = []
    s.particles = []
    s.score = 0
    s.health = 100
    s.dead = false
    setScore(0)
    setHealth(100)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2 font-mono">
          <Trophy className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm text-white">{score} PTS</span>
        </div>

        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <div className="w-24 bg-white/10 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${health}%` }} />
          </div>
        </div>

        <button onClick={restart} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-neutral-950 relative">
        <canvas ref={canvasRef} className="rounded-xl border border-white/10 shadow-2xl" />

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-10">
            <h2 className="text-2xl font-bold text-rose-500">MOTHERSHIP LOST</h2>
            <p className="text-neutral-300">Final Score: <strong className="text-cyan-400">{score}</strong></p>
            <button onClick={restart} className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
              Deploy Again
            </button>
          </div>
        )}
      </div>

      <div className="p-2 text-center text-[10px] text-neutral-500 border-t border-white/5">
        Arrow Keys or A/D to Maneuver • Lasers fire automatically
      </div>
    </div>
  )
}
