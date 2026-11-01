import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Award } from 'lucide-react'

export const PinballGame: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [balls, setBalls] = useState(3)
  const [gameOver, setGameOver] = useState(false)

  const stateRef = useRef({
    ball: { x: 260, y: 350, vx: 0, vy: -12, radius: 6 },
    leftFlipper: { angle: 0.3, targetAngle: 0.3 },
    rightFlipper: { angle: -0.3, targetAngle: -0.3 },
    bumpers: [
      { x: 100, y: 120, r: 18, color: '#ec4899', points: 100 },
      { x: 200, y: 120, r: 18, color: '#3b82f6', points: 100 },
      { x: 150, y: 190, r: 22, color: '#eab308', points: 250 },
    ],
    keys: { left: false, right: false },
  })

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'z') {
        stateRef.current.keys.left = true
        stateRef.current.leftFlipper.targetAngle = -0.5
        soundService.playClick()
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === '/') {
        stateRef.current.keys.right = true
        stateRef.current.rightFlipper.targetAngle = 0.5
        soundService.playClick()
      }
    }

    const handleUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'z') {
        stateRef.current.keys.left = false
        stateRef.current.leftFlipper.targetAngle = 0.3
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === '/') {
        stateRef.current.keys.right = false
        stateRef.current.rightFlipper.targetAngle = -0.3
      }
    }

    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
    }
  }, [])

  // Physics loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || gameOver) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const gravity = 0.22

    const loop = () => {
      animId = requestAnimationFrame(loop)
      const st = stateRef.current
      const ball = st.ball

      // Clear
      ctx.fillStyle = '#090d16'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update flippers
      st.leftFlipper.angle += (st.leftFlipper.targetAngle - st.leftFlipper.angle) * 0.35
      st.rightFlipper.angle += (st.rightFlipper.targetAngle - st.rightFlipper.angle) * 0.35

      // Ball physics
      ball.vy += gravity
      ball.x += ball.vx
      ball.y += ball.vy

      // Wall collisions
      if (ball.x - ball.radius < 20) {
        ball.x = 20 + ball.radius
        ball.vx = Math.abs(ball.vx) * 0.8
        soundService.playClick()
      }
      if (ball.x + ball.radius > 280) {
        ball.x = 280 - ball.radius
        ball.vx = -Math.abs(ball.vx) * 0.8
        soundService.playClick()
      }
      if (ball.y - ball.radius < 20) {
        ball.y = 20 + ball.radius
        ball.vy = Math.abs(ball.vy) * 0.8
        soundService.playClick()
      }

      // Bumpers collision
      st.bumpers.forEach((b) => {
        const dx = ball.x - b.x
        const dy = ball.y - b.y
        const dist = Math.hypot(dx, dy)
        if (dist < ball.radius + b.r) {
          // Bounce
          const angle = Math.atan2(dy, dx)
          ball.vx = Math.cos(angle) * 9
          ball.vy = Math.sin(angle) * 9
          soundService.playNotification()
          setScore((s) => {
            const next = s + b.points
            if (next > highScore) setHighScore(next)
            return next
          })
        }

        // Draw Bumper
        ctx.fillStyle = b.color
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.stroke()
      })

      // Flippers
      const leftPivot = { x: 70, y: 380 }
      const rightPivot = { x: 230, y: 380 }
      const flipperLen = 50

      // Draw Left Flipper
      ctx.save()
      ctx.translate(leftPivot.x, leftPivot.y)
      ctx.rotate(st.leftFlipper.angle)
      ctx.fillStyle = '#06b6d4'
      ctx.fillRect(0, -6, flipperLen, 12)
      ctx.restore()

      // Draw Right Flipper
      ctx.save()
      ctx.translate(rightPivot.x, rightPivot.y)
      ctx.rotate(st.rightFlipper.angle)
      ctx.fillStyle = '#06b6d4'
      ctx.fillRect(-flipperLen, -6, flipperLen, 12)
      ctx.restore()

      // Flipper collision check
      if (ball.y > 360 && ball.y < 400) {
        if (ball.x > 70 && ball.x < 120 && st.keys.left) {
          ball.vy = -12
          ball.vx += 4
          soundService.playClick()
        } else if (ball.x > 180 && ball.x < 230 && st.keys.right) {
          ball.vy = -12
          ball.vx -= 4
          soundService.playClick()
        }
      }

      // Ball drain
      if (ball.y > 430) {
        soundService.playTrashEmpty()
        setBalls((b) => {
          if (b <= 1) {
            setGameOver(true)
            return 0
          }
          // Reset ball
          ball.x = 260
          ball.y = 350
          ball.vx = 0
          ball.vy = -12
          return b - 1
        })
      }

      // Draw Ball
      ctx.fillStyle = '#f8fafc'
      ctx.shadowColor = '#38bdf8'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Table Outline
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 3
      ctx.strokeRect(15, 15, 270, 410)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [gameOver, highScore])

  const resetGame = () => {
    soundService.playClick()
    stateRef.current.ball = { x: 260, y: 350, vx: 0, vy: -12, radius: 6 }
    setScore(0)
    setBalls(3)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-xs flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-cyan-500/30">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white">Score: {score}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-400">Balls: {balls}</span>
          <button onClick={resetGame} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative border-4 border-cyan-500/50 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.3)] bg-neutral-950">
        <canvas ref={canvasRef} width={300} height={440} className="block" />
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-red-500 mb-1">Game Over</h3>
            <p className="text-neutral-400 text-xs mb-3">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg shadow"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Left Arrow / A = Left Flipper • Right Arrow / D = Right Flipper
      </div>
    </div>
  )
}
