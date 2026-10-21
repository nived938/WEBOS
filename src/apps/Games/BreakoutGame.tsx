import React, { useRef, useEffect, useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Play, Pause, RotateCcw, Heart, Trophy } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

export const BreakoutGame: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const stateRef = useRef({
    paddleX: 180,
    paddleW: 80,
    paddleH: 12,
    ballX: 200,
    ballY: 260,
    ballVX: 3,
    ballVY: -4,
    ballR: 6,
    bricks: [] as { x: number; y: number; w: number; h: number; color: string; alive: boolean }[],
    score: 0,
    lives: 3,
    running: true
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 440
    canvas.height = 360

    // Build bricks
    const rows = 4
    const cols = 7
    const brickW = 54
    const brickH = 16
    const padding = 6
    const offsetTop = 40
    const offsetLeft = 14
    const colors = ['#f43f5e', '#f59e0b', '#10b981', '#06b6d4']

    const bricks = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: offsetLeft + c * (brickW + padding),
          y: offsetTop + r * (brickH + padding),
          w: brickW,
          h: brickH,
          color: colors[r],
          alive: true
        })
      }
    }
    stateRef.current.bricks = bricks

    let animId: number

    const update = () => {
      animId = requestAnimationFrame(update)
      if (!stateRef.current.running) return

      const s = stateRef.current

      // Ball movement
      s.ballX += s.ballVX
      s.ballY += s.ballVY

      // Left/Right Wall bounce
      if (s.ballX - s.ballR < 0) {
        s.ballX = s.ballR
        s.ballVX *= -1
      } else if (s.ballX + s.ballR > canvas.width) {
        s.ballX = canvas.width - s.ballR
        s.ballVX *= -1
      }

      // Top Wall bounce
      if (s.ballY - s.ballR < 0) {
        s.ballY = s.ballR
        s.ballVY *= -1
      }

      // Bottom fall
      if (s.ballY + s.ballR > canvas.height) {
        s.lives--
        setLives(s.lives)
        soundService.playNotification()
        if (s.lives <= 0) {
          s.running = false
          setGameOver(true)
        } else {
          // Reset ball
          s.ballX = canvas.width / 2
          s.ballY = canvas.height - 60
          s.ballVX = 3 * (Math.random() > 0.5 ? 1 : -1)
          s.ballVY = -4
        }
      }

      // Paddle collision
      const paddleY = canvas.height - 24
      if (
        s.ballY + s.ballR >= paddleY &&
        s.ballY - s.ballR <= paddleY + s.paddleH &&
        s.ballX >= s.paddleX &&
        s.ballX <= s.paddleX + s.paddleW
      ) {
        soundService.playClick()
        s.ballVY = -Math.abs(s.ballVY)
        // Adjust horizontal angle by distance from paddle center
        const hitOffset = (s.ballX - (s.paddleX + s.paddleW / 2)) / (s.paddleW / 2)
        s.ballVX = hitOffset * 5
      }

      // Bricks collision
      let remaining = 0
      s.bricks.forEach(b => {
        if (!b.alive) return
        remaining++
        if (
          s.ballX + s.ballR > b.x &&
          s.ballX - s.ballR < b.x + b.w &&
          s.ballY + s.ballR > b.y &&
          s.ballY - s.ballR < b.y + b.h
        ) {
          b.alive = false
          s.ballVY *= -1
          s.score += 20
          setScore(s.score)
          soundService.playClick()
        }
      })

      if (remaining === 0 && !won) {
        s.running = false
        setWon(true)
        soundService.playNotification()
      }

      // Render Frame
      ctx.fillStyle = '#09090b'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw bricks
      s.bricks.forEach(b => {
        if (!b.alive) return
        ctx.fillStyle = b.color
        ctx.beginPath()
        ctx.roundRect(b.x, b.y, b.w, b.h, 3)
        ctx.fill()
      })

      // Draw Paddle
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.roundRect(s.paddleX, paddleY, s.paddleW, s.paddleH, 6)
      ctx.fill()

      // Draw Ball
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(s.ballX, s.ballY, s.ballR, 0, Math.PI * 2)
      ctx.fill()
    }

    update()

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      stateRef.current.paddleX = Math.max(0, Math.min(canvas.width - stateRef.current.paddleW, mouseX - stateRef.current.paddleW / 2))
    }

    canvas.addEventListener('pointermove', handlePointerMove)

    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  const restart = () => {
    soundService.playClick()
    const s = stateRef.current
    s.score = 0
    s.lives = 3
    s.ballX = 200
    s.ballY = 260
    s.ballVX = 3
    s.ballVY = -4
    s.running = true
    s.bricks.forEach(b => (b.alive = true))
    setScore(0)
    setLives(3)
    setGameOver(false)
    setWon(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="w-4 h-4 text-cyan-400" />
          <span className="font-mono font-bold text-sm text-white">{score} PTS</span>
        </div>

        <div className="flex items-center space-x-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-neutral-600'}`}
            />
          ))}
        </div>

        <button onClick={restart} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 flex items-center justify-center p-4 bg-neutral-950 relative">
        <canvas ref={canvasRef} className="rounded-xl border border-white/10 shadow-2xl cursor-none" />

        {(gameOver || won) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-10">
            <h2 className="text-2xl font-bold text-white">{won ? 'LEVEL CLEAR!' : 'GAME OVER'}</h2>
            <p className="text-neutral-300">Final Score: <strong className="text-cyan-400">{score}</strong></p>
            <button onClick={restart} className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white">
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="p-2 text-center text-[10px] text-neutral-500 border-t border-white/5">
        Move mouse across canvas to steer the cyan paddle
      </div>
    </div>
  )
}
