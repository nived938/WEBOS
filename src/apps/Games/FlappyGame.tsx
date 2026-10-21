import React, { useRef, useEffect, useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { RotateCcw, Trophy, Sparkles } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

export const FlappyGame: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('nova_flappy_high') || 0))
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)

  const stateRef = useRef({
    birdY: 150,
    birdVY: 0,
    gravity: 0.38,
    jump: -6.5,
    pipes: [] as { x: number; topH: number; bottomY: number; passed: boolean }[],
    pipeSpeed: 2.5,
    pipeGap: 100,
    score: 0,
    dead: false,
    started: false
  })

  const jump = () => {
    if (stateRef.current.dead) return
    soundService.playClick()
    if (!stateRef.current.started) {
      stateRef.current.started = true
      setStarted(true)
    }
    stateRef.current.birdVY = stateRef.current.jump
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 360
    canvas.height = 420

    let animId: number

    const spawnPipe = (x: number) => {
      const topH = Math.floor(Math.random() * (canvas.height - 220)) + 40
      stateRef.current.pipes.push({
        x,
        topH,
        bottomY: topH + stateRef.current.pipeGap,
        passed: false
      })
    }

    // Initial pipes
    stateRef.current.pipes = []
    spawnPipe(380)
    spawnPipe(560)

    const update = () => {
      animId = requestAnimationFrame(update)
      const s = stateRef.current

      if (s.started && !s.dead) {
        // Bird physics
        s.birdVY += s.gravity
        s.birdY += s.birdVY

        // Ground / ceiling
        if (s.birdY > canvas.height - 20) {
          s.birdY = canvas.height - 20
          s.dead = true
          setGameOver(true)
          soundService.playNotification()
        }
        if (s.birdY < 0) s.birdY = 0

        // Move pipes
        for (let i = s.pipes.length - 1; i >= 0; i--) {
          const p = s.pipes[i]
          p.x -= s.pipeSpeed

          // Collision check
          const birdX = 60
          const birdR = 12
          if (birdX + birdR > p.x && birdX - birdR < p.x + 44) {
            if (s.birdY - birdR < p.topH || s.birdY + birdR > p.bottomY) {
              s.dead = true
              setGameOver(true)
              soundService.playNotification()
            }
          }

          // Score pass
          if (!p.passed && p.x + 44 < birdX) {
            p.passed = true
            s.score += 1
            setScore(s.score)
            soundService.playClick()
          }

          // Recycle pipe
          if (p.x < -60) {
            s.pipes.splice(i, 1)
            spawnPipe(canvas.width + 20)
          }
        }
      }

      // Render
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw Pipes
      ctx.fillStyle = '#10b981'
      s.pipes.forEach(p => {
        // Top pipe
        ctx.fillRect(p.x, 0, 44, p.topH)
        // Bottom pipe
        ctx.fillRect(p.x, p.bottomY, 44, canvas.height - p.bottomY)
      })

      // Draw Bird
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.arc(60, s.birdY, 12, 0, Math.PI * 2)
      ctx.fill()

      // Eye
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(64, s.birdY - 3, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    update()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const restart = () => {
    soundService.playClick()
    const s = stateRef.current
    s.birdY = 150
    s.birdVY = 0
    s.score = 0
    s.dead = false
    s.started = false
    s.pipes = [
      { x: 380, topH: 120, bottomY: 220, passed: false },
      { x: 560, topH: 160, bottomY: 260, passed: false }
    ]
    setScore(0)
    setGameOver(false)
    setStarted(false)
  }

  return (
    <div
      onClick={jump}
      className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs cursor-pointer"
    >
      {/* Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2 font-mono">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-sm text-white">{score}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            restart()
          }}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-neutral-950 relative">
        <canvas ref={canvasRef} className="rounded-xl border border-white/10 shadow-2xl" />

        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <h3 className="text-xl font-bold text-white">Flappy Nova</h3>
            <p className="text-neutral-400 text-xs">Press Space or Click to Jump</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-10">
            <h2 className="text-2xl font-bold text-rose-500">CRASHED!</h2>
            <p className="text-neutral-300">Score: <strong className="text-white">{score}</strong></p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                restart()
              }}
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
