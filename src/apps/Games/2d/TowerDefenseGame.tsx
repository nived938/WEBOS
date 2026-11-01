import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Shield, Coins, Zap } from 'lucide-react'

interface Enemy {
  id: number
  x: number
  y: number
  hp: number
  maxHp: number
  speed: number
  pathIdx: number
}

interface Turret {
  id: number
  x: number
  y: number
  type: 'laser' | 'plasma' | 'cryo'
  range: number
  damage: number
  cooldown: number
  lastShot: number
}

// Pathway checkpoints (normalized 0 to 1)
const PATH = [
  { x: 0, y: 0.2 },
  { x: 0.4, y: 0.2 },
  { x: 0.4, y: 0.7 },
  { x: 0.75, y: 0.7 },
  { x: 0.75, y: 0.35 },
  { x: 1.0, y: 0.35 },
]

export const TowerDefenseGame: React.FC<AppInstanceProps> = () => {
  const [money, setMoney] = useState(150)
  const [lives, setLives] = useState(20)
  const [wave, setWave] = useState(1)
  const [score, setScore] = useState(0)
  const [selectedTurretType, setSelectedTurretType] = useState<'laser' | 'plasma' | 'cryo'>('laser')
  const [turrets, setTurrets] = useState<Turret[]>([])
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [gameOver, setGameOver] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    money: 150,
    lives: 20,
    turrets: [] as Turret[],
    enemies: [] as Enemy[],
    nextEnemyId: 1,
    nextTurretId: 1,
    waveSpawned: 0,
    waveTotal: 8,
    isWaveActive: true,
  })

  // Synchronize stateRef with state
  useEffect(() => {
    stateRef.current.money = money
    stateRef.current.lives = lives
    stateRef.current.turrets = turrets
  }, [money, lives, turrets])

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let lastSpawn = performance.now()
    let lastTime = performance.now()

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop)
      const dt = (time - lastTime) / 1000
      lastTime = time

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Draw Pathway
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 32
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(PATH[0].x * w, PATH[0].y * h)
      for (let i = 1; i < PATH.length; i++) {
        ctx.lineTo(PATH[i].x * w, PATH[i].y * h)
      }
      ctx.stroke()

      // Spawn Enemies in Wave
      if (stateRef.current.waveSpawned < stateRef.current.waveTotal && time - lastSpawn > 1400) {
        lastSpawn = time
        stateRef.current.waveSpawned++
        stateRef.current.enemies.push({
          id: stateRef.current.nextEnemyId++,
          x: PATH[0].x * w,
          y: PATH[0].y * h,
          hp: 40 + wave * 25,
          maxHp: 40 + wave * 25,
          speed: 45 + wave * 5,
          pathIdx: 0,
        })
      }

      // Update & Draw Enemies
      for (let i = stateRef.current.enemies.length - 1; i >= 0; i--) {
        const e = stateRef.current.enemies[i]
        const targetPoint = PATH[e.pathIdx + 1]

        if (!targetPoint) {
          // Reached end!
          stateRef.current.enemies.splice(i, 1)
          setLives((l) => {
            const nextL = l - 1
            if (nextL <= 0) setGameOver(true)
            return Math.max(0, nextL)
          })
          soundService.playTrashEmpty()
          continue
        }

        const tx = targetPoint.x * w
        const ty = targetPoint.y * h
        const dx = tx - e.x
        const dy = ty - e.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 4) {
          e.pathIdx++
        } else {
          e.x += (dx / dist) * e.speed * dt
          e.y += (dy / dist) * e.speed * dt
        }

        // Draw Enemy
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.arc(e.x, e.y, 8, 0, Math.PI * 2)
        ctx.fill()

        // HP bar
        ctx.fillStyle = '#1e293b'
        ctx.fillRect(e.x - 10, e.y - 14, 20, 3)
        ctx.fillStyle = '#22c55e'
        ctx.fillRect(e.x - 10, e.y - 14, (e.hp / e.maxHp) * 20, 3)
      }

      // Update & Draw Turrets & Firing Lasers
      stateRef.current.turrets.forEach((turret) => {
        // Find nearest enemy in range
        let nearest: Enemy | null = null
        let nearestDist = turret.range

        for (const e of stateRef.current.enemies) {
          const d = Math.hypot(e.x - turret.x, e.y - turret.y)
          if (d < nearestDist) {
            nearestDist = d
            nearest = e
          }
        }

        // Shoot
        if (nearest && time - turret.lastShot > turret.cooldown) {
          turret.lastShot = time
          nearest.hp -= turret.damage

          // Draw laser line
          ctx.strokeStyle = turret.type === 'laser' ? '#38bdf8' : turret.type === 'plasma' ? '#ec4899' : '#06b6d4'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(turret.x, turret.y)
          ctx.lineTo(nearest.x, nearest.y)
          ctx.stroke()

          if (nearest.hp <= 0) {
            // Killed
            const idx = stateRef.current.enemies.indexOf(nearest)
            if (idx >= 0) stateRef.current.enemies.splice(idx, 1)
            setMoney((m) => m + 15)
            setScore((s) => s + 25)
            soundService.playClick()
          }
        }

        // Draw Turret
        ctx.fillStyle = turret.type === 'laser' ? '#0284c7' : turret.type === 'plasma' ? '#be185d' : '#0891b2'
        ctx.beginPath()
        ctx.arc(turret.x, turret.y, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // Check Next Wave
      if (
        stateRef.current.waveSpawned >= stateRef.current.waveTotal &&
        stateRef.current.enemies.length === 0
      ) {
        soundService.playNotification()
        setWave((w) => w + 1)
        stateRef.current.waveSpawned = 0
        stateRef.current.waveTotal += 4
      }
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [wave])

  // Place turret on click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || gameOver) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const costs = { laser: 50, plasma: 90, cryo: 75 }
    const cost = costs[selectedTurretType]

    if (money >= cost) {
      soundService.playClick()
      setMoney((m) => m - cost)
      const newTurret: Turret = {
        id: stateRef.current.nextTurretId++,
        x,
        y,
        type: selectedTurretType,
        range: selectedTurretType === 'laser' ? 90 : selectedTurretType === 'plasma' ? 120 : 75,
        damage: selectedTurretType === 'laser' ? 14 : selectedTurretType === 'plasma' ? 35 : 8,
        cooldown: selectedTurretType === 'laser' ? 250 : selectedTurretType === 'plasma' ? 600 : 200,
        lastShot: 0,
      }
      setTurrets((prev) => [...prev, newTurret])
    }
  }

  const resetGame = () => {
    soundService.playClick()
    setMoney(150)
    setLives(20)
    setWave(1)
    setScore(0)
    setTurrets([])
    stateRef.current.enemies = []
    stateRef.current.waveSpawned = 0
    stateRef.current.waveTotal = 8
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      {/* Header Stats */}
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm text-cyan-400">Cyber Tower Defense</span>
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <Coins className="w-3.5 h-3.5" /> ${money}
          </span>
          <span className="flex items-center gap-1 text-red-400 font-bold">
            <Shield className="w-3.5 h-3.5" /> {lives} HP
          </span>
          <span className="text-neutral-400">Wave: {wave}</span>
        </div>
        <button onClick={resetGame} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas */}
      <div className="relative border-2 border-slate-700 rounded-xl overflow-hidden shadow-2xl bg-slate-950">
        <canvas
          ref={canvasRef}
          width={480}
          height={320}
          onClick={handleCanvasClick}
          className="cursor-crosshair block"
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-red-500 mb-1">Defense Breached!</h3>
            <p className="text-neutral-400 text-xs mb-3">Score: {score} • Reached Wave {wave}</p>
            <button
              onClick={resetGame}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg shadow"
            >
              Restart Mission
            </button>
          </div>
        )}
      </div>

      {/* Turret Selection Toolbar */}
      <div className="flex items-center gap-3 bg-neutral-900/70 p-2 rounded-xl border border-white/10">
        <span className="text-[11px] text-neutral-400 font-medium">Turrets:</span>
        <button
          onClick={() => setSelectedTurretType('laser')}
          className={`px-3 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${
            selectedTurretType === 'laser'
              ? 'bg-sky-600 border-sky-400 text-white'
              : 'border-white/10 text-neutral-400 hover:text-white'
          }`}
        >
          <Zap className="w-3 h-3 text-sky-300" />
          <span>Pulse Laser ($50)</span>
        </button>
        <button
          onClick={() => setSelectedTurretType('plasma')}
          className={`px-3 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${
            selectedTurretType === 'plasma'
              ? 'bg-pink-600 border-pink-400 text-white'
              : 'border-white/10 text-neutral-400 hover:text-white'
          }`}
        >
          <Zap className="w-3 h-3 text-pink-300" />
          <span>Heavy Plasma ($90)</span>
        </button>
      </div>
    </div>
  )
}
