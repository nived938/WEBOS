import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Zap, Heart } from 'lucide-react'

interface Brick {
  x: number
  y: number
  w: number
  h: number
  hp: number
  color: string
}

export const BrickBreakerDeluxeGame: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [powerUpActive, setPowerUpActive] = useState<string | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const stateRef = useRef({
    paddle: { x: 130, w: 70, h: 10 },
    ball: { x: 160, y: 240, vx: 3.5, vy: -4, radius: 5 },
    bricks: [] as Brick[],
    powerUpTimer: 0,
  })

  const initGame = () => {
    soundService.playClick()
    const bricks: Brick[] = []
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4']
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 7; c++) {
        bricks.push({
          x: 20 + c * 40,
          y: 35 + r * 18,
          w: 36,
          h: 14,
          hp: r === 0 ? 2 : 1,
          color: colors[r],
        })
      }
    }
    stateRef.current.bricks = bricks
    stateRef.current.ball = { x: 160, y: 240, vx: 3.5, vy: -4, radius: 5 }
    stateRef.current.paddle = { x: 130, w: 70, h: 10 }
    setScore(0)
    setLives(3)
    setPowerUpActive(null)
    setGameOver(false)
    setWon(false)
  }

  useEffect(() => {
    initGame()
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    stateRef.current.paddle.x = Math.max(0, Math.min(canvas.width - stateRef.current.paddle.w, mx - stateRef.current.paddle.w / 2))
  }

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || gameOver || won) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const loop = () => {
      animId = requestAnimationFrame(loop)
      const st = stateRef.current
      const ball = st.ball
      const pad = st.paddle

      // Clear
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Move Ball
      ball.x += ball.vx
      ball.y += ball.vy

      // Wall bounce
      if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.vx = -ball.vx
        soundService.playClick()
      }
      if (ball.y - ball.radius < 0) {
        ball.vy = -ball.vy
        soundService.playClick()
      }

      // Paddle collision
      if (
        ball.y + ball.radius >= 280 &&
        ball.y - ball.radius <= 290 &&
        ball.x >= pad.x &&
        ball.x <= pad.x + pad.w &&
        ball.vy > 0
      ) {
        soundService.playClick()
        const hitOffset = (ball.x - (pad.x + pad.w / 2)) / (pad.w / 2)
        ball.vx = hitOffset * 5.5
        ball.vy = -Math.abs(ball.vy)
      }

      // Ball falls below bottom
      if (ball.y > canvas.height) {
        soundService.playTrashEmpty()
        setLives((l) => {
          if (l <= 1) {
            setGameOver(true)
            return 0
          }
          ball.x = 160
          ball.y = 240
          ball.vx = 3.5
          ball.vy = -4
          return l - 1
        })
      }

      // Brick collisions
      for (let i = st.bricks.length - 1; i >= 0; i--) {
        const b = st.bricks[i]
        if (
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + b.w &&
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + b.h
        ) {
          ball.vy = -ball.vy
          soundService.playNotification()
          b.hp--
          setScore((s) => s + 20)

          if (b.hp <= 0) {
            st.bricks.splice(i, 1)
            // Power-up chance
            if (Math.random() < 0.2) {
              pad.w = 100 // Wide paddle powerup
              setPowerUpActive('Wide Laser Paddle!')
              setTimeout(() => {
                pad.w = 70
                setPowerUpActive(null)
              }, 6000)
            }
          }

          if (st.bricks.length === 0) {
            soundService.playStartup()
            setWon(true)
          }
          break
        }
      }

      // Draw Bricks
      st.bricks.forEach((b) => {
        ctx.fillStyle = b.color
        ctx.fillRect(b.x, b.y, b.w, b.h)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        ctx.strokeRect(b.x, b.y, b.w, b.h)
      })

      // Draw Paddle
      ctx.fillStyle = '#38bdf8'
      ctx.shadowColor = '#0284c7'
      ctx.shadowBlur = 8
      ctx.fillRect(pad.x, 280, pad.w, pad.h)
      ctx.shadowBlur = 0

      // Draw Ball
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [gameOver, won])

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-xs flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-bold">Score: {score}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array(lives).fill(0).map((_, i) => (
              <Heart key={i} className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            ))}
          </div>
          <button onClick={initGame} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative border-4 border-sky-500/50 rounded-2xl overflow-hidden shadow-2xl bg-neutral-950">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          onMouseMove={handleMouseMove}
          className="cursor-none block"
        />

        {powerUpActive && (
          <div className="absolute top-2 inset-x-0 text-center font-bold text-amber-300 animate-pulse pointer-events-none">
            {powerUpActive}
          </div>
        )}

        {won && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <Trophy className="w-10 h-10 text-yellow-400 mb-1 animate-bounce" />
            <h3 className="text-base font-bold text-emerald-400">All Bricks Cleared!</h3>
            <p className="text-neutral-400 text-xs mb-3">Score: {score}</p>
            <button onClick={initGame} className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 font-bold text-black rounded-lg">
              Play Again
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-red-500 mb-1">Out of Balls</h3>
            <p className="text-neutral-400 text-xs mb-3">Score: {score}</p>
            <button onClick={initGame} className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 font-bold text-black rounded-lg">
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Move mouse left/right to steer paddle • Break multi-tiered bricks and collect power-ups
      </div>
    </div>
  )
}
