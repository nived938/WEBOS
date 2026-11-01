import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Target } from 'lucide-react'

const BUBBLE_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']

interface Bubble {
  r: number
  c: number
  color: string
}

export const BubbleShooterGame: React.FC<AppInstanceProps> = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [currentShooterColor, setCurrentShooterColor] = useState('#ef4444')
  const [cannonAngle, setCannonAngle] = useState(-Math.PI / 2)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const stateRef = useRef({
    flyingBubble: null as { x: number; y: number; vx: number; vy: number; color: string } | null,
    bubbles: [] as Bubble[],
  })

  // Initialize top 4 rows of bubbles
  const initBubbles = () => {
    soundService.playClick()
    const initList: Bubble[] = []
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        initList.push({
          r,
          c,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        })
      }
    }
    setBubbles(initList)
    stateRef.current.bubbles = initList
    stateRef.current.flyingBubble = null
    setCurrentShooterColor(BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)])
    setScore(0)
    setGameOver(false)
  }

  useEffect(() => {
    initBubbles()
  }, [])

  // Mouse aim
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const angle = Math.atan2(my - 300, mx - 135)
    setCannonAngle(Math.max(-Math.PI * 0.9, Math.min(-Math.PI * 0.1, angle)))
  }

  // Shoot
  const handleShoot = () => {
    if (stateRef.current.flyingBubble || gameOver) return
    soundService.playClick()

    stateRef.current.flyingBubble = {
      x: 135,
      y: 290,
      vx: Math.cos(cannonAngle) * 9,
      vy: Math.sin(cannonAngle) * 9,
      color: currentShooterColor,
    }

    setCurrentShooterColor(BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)])
  }

  // Physics loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || gameOver) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const bubbleRadius = 15

    const loop = () => {
      animId = requestAnimationFrame(loop)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const fb = stateRef.current.flyingBubble

      // Update Flying Bubble
      if (fb) {
        fb.x += fb.vx
        fb.y += fb.vy

        // Bounce off walls
        if (fb.x - bubbleRadius < 0 || fb.x + bubbleRadius > canvas.width) {
          fb.vx = -fb.vx
        }

        // Hit top ceiling or grid
        if (fb.y - bubbleRadius <= 0 || fb.y < 120) {
          soundService.playNotification()
          // Snap to row/col
          const targetR = Math.max(0, Math.floor(fb.y / (bubbleRadius * 2)))
          const targetC = Math.max(0, Math.min(7, Math.floor(fb.x / (bubbleRadius * 2))))

          const newBubble: Bubble = { r: targetR, c: targetC, color: fb.color }
          stateRef.current.bubbles.push(newBubble)
          stateRef.current.flyingBubble = null

          // Check color matches
          const matches = stateRef.current.bubbles.filter((b) => b.color === fb.color)
          if (matches.length >= 3) {
            // Clear matches
            stateRef.current.bubbles = stateRef.current.bubbles.filter((b) => b.color !== fb.color)
            setScore((s) => s + matches.length * 30)
          }

          setBubbles([...stateRef.current.bubbles])
        }
      }

      // Draw Grid Bubbles
      stateRef.current.bubbles.forEach((b) => {
        const bx = b.c * (bubbleRadius * 2) + bubbleRadius + (b.r % 2 ? bubbleRadius / 2 : 0)
        const by = b.r * (bubbleRadius * 2) + bubbleRadius

        ctx.fillStyle = b.color
        ctx.beginPath()
        ctx.arc(bx, by, bubbleRadius - 1, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Draw Cannon
      ctx.save()
      ctx.translate(135, 300)
      ctx.rotate(cannonAngle)
      ctx.fillStyle = '#334155'
      ctx.fillRect(0, -6, 32, 12)
      ctx.restore()

      // Draw Shooter Base & Ready Bubble
      ctx.fillStyle = currentShooterColor
      ctx.beginPath()
      ctx.arc(135, 300, bubbleRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw Flying Bubble
      if (fb) {
        ctx.fillStyle = fb.color
        ctx.beginPath()
        ctx.arc(fb.x, fb.y, bubbleRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.stroke()
      }
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [cannonAngle, currentShooterColor, gameOver])

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-xs flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-pink-400" />
          <span className="font-bold">Score: {score}</span>
        </div>
        <button onClick={initBubbles} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative border-4 border-pink-500/50 rounded-2xl overflow-hidden shadow-2xl bg-neutral-950">
        <canvas
          ref={canvasRef}
          width={270}
          height={320}
          onMouseMove={handleMouseMove}
          onClick={handleShoot}
          className="cursor-crosshair block"
        />
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Aim mouse to position laser cannon • Click to launch colored bubble
      </div>
    </div>
  )
}
