import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Heart, Flag } from 'lucide-react'

export const PlatformAdventureGame: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [won, setWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const stateRef = useRef({
    hero: { x: 40, y: 200, vx: 0, vy: 0, isGrounded: false },
    cameraX: 0,
    platforms: [
      { x: 0, y: 260, w: 300, h: 40 },
      { x: 360, y: 220, w: 120, h: 20 },
      { x: 540, y: 170, w: 140, h: 20 },
      { x: 740, y: 220, w: 100, h: 20 },
      { x: 900, y: 260, w: 400, h: 40 },
    ],
    coins: [
      { x: 120, y: 220, collected: false },
      { x: 200, y: 220, collected: false },
      { x: 410, y: 180, collected: false },
      { x: 600, y: 130, collected: false },
      { x: 780, y: 180, collected: false },
      { x: 1000, y: 220, collected: false },
    ],
    finishFlag: { x: 1200, y: 180 },
    keys: { left: false, right: false, up: false },
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') stateRef.current.keys.left = true
      if (e.key === 'ArrowRight' || e.key === 'd') stateRef.current.keys.right = true
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && stateRef.current.hero.isGrounded) {
        stateRef.current.hero.vy = -11
        stateRef.current.hero.isGrounded = false
        soundService.playClick()
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') stateRef.current.keys.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') stateRef.current.keys.right = false
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Physics loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || gameOver || won) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const gravity = 0.55

    const loop = () => {
      animId = requestAnimationFrame(loop)
      const st = stateRef.current
      const hero = st.hero

      // Horizontal movement
      if (st.keys.left) hero.vx = -4
      else if (st.keys.right) hero.vx = 4
      else hero.vx *= 0.8

      // Gravity
      hero.vy += gravity
      hero.x += hero.vx
      hero.y += hero.vy

      // Platform collisions
      hero.isGrounded = false
      st.platforms.forEach((p) => {
        if (
          hero.x + 12 > p.x &&
          hero.x - 12 < p.x + p.w &&
          hero.y + 16 >= p.y &&
          hero.y + 16 <= p.y + 15 &&
          hero.vy >= 0
        ) {
          hero.y = p.y - 16
          hero.vy = 0
          hero.isGrounded = true
        }
      })

      // Collect coins
      st.coins.forEach((c) => {
        if (!c.collected && Math.hypot(hero.x - c.x, hero.y - c.y) < 20) {
          c.collected = true
          soundService.playNotification()
          setScore((s) => s + 100)
        }
      })

      // Finish flag
      if (hero.x >= st.finishFlag.x) {
        soundService.playStartup()
        setWon(true)
      }

      // Fall off bottom
      if (hero.y > 320) {
        soundService.playTrashEmpty()
        setLives((l) => {
          if (l <= 1) {
            setGameOver(true)
            return 0
          }
          hero.x = 40
          hero.y = 200
          hero.vx = 0
          hero.vy = 0
          return l - 1
        })
      }

      // Camera follow
      st.cameraX += (hero.x - 180 - st.cameraX) * 0.1

      // Render
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.save()
      ctx.translate(-st.cameraX, 0)

      // Draw Platforms
      ctx.fillStyle = '#10b981'
      st.platforms.forEach((p) => {
        ctx.fillRect(p.x, p.y, p.w, p.h)
        ctx.fillStyle = '#059669'
        ctx.fillRect(p.x, p.y + 4, p.w, p.h - 4)
        ctx.fillStyle = '#10b981'
      })

      // Draw Coins
      st.coins.forEach((c) => {
        if (!c.collected) {
          ctx.fillStyle = '#facc15'
          ctx.beginPath()
          ctx.arc(c.x, c.y, 6, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Finish Flag
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(st.finishFlag.x, st.finishFlag.y - 40, 4, 80)
      ctx.fillStyle = '#f43f5e'
      ctx.beginPath()
      ctx.moveTo(st.finishFlag.x + 4, st.finishFlag.y - 40)
      ctx.lineTo(st.finishFlag.x + 24, st.finishFlag.y - 30)
      ctx.lineTo(st.finishFlag.x + 4, st.finishFlag.y - 20)
      ctx.fill()

      // Hero
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.arc(hero.x, hero.y, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(hero.x + 4, hero.y - 3, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [gameOver, won])

  const reset = () => {
    soundService.playClick()
    stateRef.current.hero = { x: 40, y: 200, vx: 0, vy: 0, isGrounded: false }
    stateRef.current.cameraX = 0
    stateRef.current.coins.forEach((c) => (c.collected = false))
    setScore(0)
    setLives(3)
    setWon(false)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-md flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-emerald-400">Pixel Quest Adventure</span>
          <span className="text-neutral-300">Score: {score}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array(lives).fill(0).map((_, i) => (
              <Heart key={i} className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            ))}
          </div>
          <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative border-2 border-emerald-500/50 rounded-2xl overflow-hidden shadow-2xl bg-neutral-950">
        <canvas ref={canvasRef} width={460} height={300} className="block" />

        {won && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <Trophy className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
            <h3 className="text-base font-bold text-emerald-400">Level Complete!</h3>
            <p className="text-neutral-400 text-xs mb-3">Total Coins Score: {score}</p>
            <button onClick={reset} className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 font-bold text-black rounded-lg">
              Play Again
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-red-500 mb-1">Hero Defeated</h3>
            <p className="text-neutral-400 text-xs mb-3">Score: {score}</p>
            <button onClick={reset} className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 font-bold text-black rounded-lg">
              Restart Run
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        WASD or Arrows to Move & Jump • Collect Gold Coins and reach the Finish Flag
      </div>
    </div>
  )
}
