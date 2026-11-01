import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Zap } from 'lucide-react'

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'] // Red, Blue, Green, Yellow

export const ColorMatchGame: React.FC<AppInstanceProps> = () => {
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [targetColorIndex, setTargetColorIndex] = useState(0)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [orbY, setOrbY] = useState(0)
  const [orbColorIndex, setOrbColorIndex] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [speed, setSpeed] = useState(2.5)

  // Rotate wheel clockwise
  const rotateWheel = () => {
    if (gameOver) return
    soundService.playClick()
    setWheelRotation((prev) => (prev + 90) % 360)
    setTargetColorIndex((prev) => (prev + 1) % 4)
  }

  // Animation Loop
  useEffect(() => {
    if (gameOver) return
    let animId: number

    const tick = () => {
      setOrbY((y) => {
        const nextY = y + speed
        // Hit wheel at y = 140
        if (nextY >= 140) {
          // Check match
          if (orbColorIndex === targetColorIndex) {
            soundService.playNotification()
            setScore((s) => {
              const next = s + 10
              if (next > highScore) setHighScore(next)
              return next
            })
            setSpeed((spd) => Math.min(spd + 0.15, 6))
            // Pick next random orb color
            setOrbColorIndex(Math.floor(Math.random() * 4))
            return 0
          } else {
            // Failed
            soundService.playTrashEmpty()
            setGameOver(true)
            return y
          }
        }
        return nextY
      })
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [gameOver, orbColorIndex, targetColorIndex, speed, highScore])

  const reset = () => {
    soundService.playClick()
    setScore(0)
    setOrbY(0)
    setSpeed(2.5)
    setWheelRotation(0)
    setTargetColorIndex(0)
    setOrbColorIndex(Math.floor(Math.random() * 4))
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      {/* Header */}
      <div className="w-full max-w-xs flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-bold">Score: {score}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-400">High: {highScore}</span>
          <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Stage */}
      <div
        onClick={rotateWheel}
        className="relative w-64 h-72 bg-neutral-900 border-2 border-white/10 rounded-2xl flex flex-col items-center justify-between p-4 cursor-pointer overflow-hidden shadow-2xl"
      >
        {/* Incoming Color Orb */}
        <div
          style={{
            transform: `translateY(${orbY}px)`,
            backgroundColor: COLORS[orbColorIndex],
          }}
          className="w-7 h-7 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] border-2 border-white z-10 transition-transform duration-75"
        />

        {/* 4-Color Target Wheel */}
        <div
          style={{ transform: `rotate(${wheelRotation}deg)` }}
          className="w-28 h-28 rounded-full border-4 border-white/20 relative overflow-hidden transition-transform duration-150 shadow-2xl"
        >
          {/* Top (Target Color at 0 deg) */}
          <div className="absolute top-0 left-0 w-14 h-14 bg-red-500" />
          <div className="absolute top-0 right-0 w-14 h-14 bg-blue-500" />
          <div className="absolute bottom-0 right-0 w-14 h-14 bg-green-500" />
          <div className="absolute bottom-0 left-0 w-14 h-14 bg-yellow-400" />
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-30">
            <h3 className="text-base font-bold text-red-500 mb-1">Color Mismatch!</h3>
            <p className="text-neutral-400 text-xs mb-3">Score: {score}</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                reset()
              }}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 font-bold text-black rounded-lg shadow"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Click anywhere or tap Space to rotate the color wheel to match the descending orb
      </div>
    </div>
  )
}
