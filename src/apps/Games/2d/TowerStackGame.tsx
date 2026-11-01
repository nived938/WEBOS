import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Layers } from 'lucide-react'

interface StackBlock {
  x: number
  w: number
  color: string
}

const PALETTE = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16', '#eab308', '#f97316']

export const TowerStackGame: React.FC<AppInstanceProps> = () => {
  const [stack, setStack] = useState<StackBlock[]>([
    { x: 50, w: 140, color: PALETTE[0] },
  ])
  const [movingX, setMovingX] = useState(0)
  const [movingDir, setMovingDir] = useState(1)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const currentWRef = useRef(140)
  const speedRef = useRef(3.5)

  // Oscillating block loop
  useEffect(() => {
    if (gameOver) return
    let animId: number

    const tick = () => {
      setMovingX((x) => {
        let nx = x + movingDir * speedRef.current
        if (nx > 160) {
          nx = 160
          setMovingDir(-1)
        } else if (nx < -40) {
          nx = -40
          setMovingDir(1)
        }
        return nx
      })
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [gameOver, movingDir])

  // Drop block
  const handleDrop = () => {
    if (gameOver) return
    const top = stack[stack.length - 1]
    const curW = currentWRef.current
    const diff = movingX - top.x

    if (Math.abs(diff) >= curW) {
      // Missed completely!
      soundService.playTrashEmpty()
      setGameOver(true)
      return
    }

    // Cut block
    const newW = curW - Math.abs(diff)
    const newX = diff > 0 ? movingX : top.x

    currentWRef.current = newW
    soundService.playNotification()

    setStack((prev) => [
      ...prev,
      { x: newX, w: newW, color: PALETTE[prev.length % PALETTE.length] },
    ])
    setScore((s) => {
      const next = s + 1
      if (next > highScore) setHighScore(next)
      return next
    })
    speedRef.current = Math.min(speedRef.current + 0.1, 7)
  }

  const reset = () => {
    soundService.playClick()
    currentWRef.current = 140
    speedRef.current = 3.5
    setStack([{ x: 50, w: 140, color: PALETTE[0] }])
    setMovingX(0)
    setMovingDir(1)
    setScore(0)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      {/* Header */}
      <div className="w-full max-w-xs flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-pink-400" />
          <span className="font-bold">Height: {score}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-400">High: {highScore}</span>
          <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stacking Stage */}
      <div
        onClick={handleDrop}
        className="relative w-64 h-80 bg-gradient-to-b from-indigo-950/60 to-neutral-900 border-2 border-white/10 rounded-2xl overflow-hidden cursor-pointer shadow-2xl flex flex-col justify-end p-4"
      >
        {/* Moving Block at top */}
        {!gameOver && (
          <div
            style={{
              left: `${movingX}px`,
              width: `${currentWRef.current}px`,
              backgroundColor: PALETTE[stack.length % PALETTE.length],
            }}
            className="absolute top-12 h-6 rounded-md shadow-lg border border-white/30"
          />
        )}

        {/* Stacked Blocks */}
        <div className="relative flex flex-col-reverse items-center w-full">
          {stack.slice(-10).map((b, idx) => (
            <div
              key={idx}
              style={{
                width: `${b.w}px`,
                marginLeft: `${(b.x - 50) * 1.5}px`,
                backgroundColor: b.color,
              }}
              className="h-6 rounded-md my-0.5 border border-white/20 shadow-md"
            />
          ))}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-20">
            <h3 className="text-base font-bold text-red-500 mb-1">Tower Collapsed!</h3>
            <p className="text-neutral-400 text-xs mb-3">Total Blocks: {score}</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                reset()
              }}
              className="px-4 py-1.5 bg-pink-500 hover:bg-pink-400 font-bold text-white rounded-lg shadow"
            >
              Stack Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Click anywhere to drop oscillating block • Align precisely to avoid slicing
      </div>
    </div>
  )
}
