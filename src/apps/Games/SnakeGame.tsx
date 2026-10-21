import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Play, Pause, RotateCcw, Trophy } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

const GRID_SIZE = 20

export const SnakeGame: React.FC<AppInstanceProps> = () => {
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ])
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 15, y: 10 })
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT')
  const [isGameOver, setIsGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('nova_snake_high') || 0)
  })
  const [isPaused, setIsPaused] = useState(false)

  const dirRef = useRef(direction)
  dirRef.current = direction

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if ((k === 'arrowup' || k === 'w') && dirRef.current !== 'DOWN') setDirection('UP')
      else if ((k === 'arrowdown' || k === 's') && dirRef.current !== 'UP') setDirection('DOWN')
      else if ((k === 'arrowleft' || k === 'a') && dirRef.current !== 'RIGHT') setDirection('LEFT')
      else if ((k === 'arrowright' || k === 'd') && dirRef.current !== 'LEFT') setDirection('RIGHT')
      else if (k === ' ') setIsPaused(p => !p)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Game tick loop
  useEffect(() => {
    if (isGameOver || isPaused) return

    const tick = setInterval(() => {
      setSnake(prev => {
        const head = { ...prev[0] }
        if (dirRef.current === 'UP') head.y -= 1
        if (dirRef.current === 'DOWN') head.y += 1
        if (dirRef.current === 'LEFT') head.x -= 1
        if (dirRef.current === 'RIGHT') head.x += 1

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsGameOver(true)
          soundService.playNotification()
          return prev
        }

        // Self collision
        if (prev.some(segment => segment.x === head.x && segment.y === head.y)) {
          setIsGameOver(true)
          soundService.playNotification()
          return prev
        }

        const newSnake = [head, ...prev]

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          soundService.playClick()
          setScore(s => {
            const nextScore = s + 10
            if (nextScore > highScore) {
              setHighScore(nextScore)
              localStorage.setItem('nova_snake_high', String(nextScore))
            }
            return nextScore
          })
          // Random new food
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          })
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, 110)

    return () => clearInterval(tick)
  }, [food, isGameOver, isPaused, highScore])

  const restart = () => {
    soundService.playClick()
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ])
    setFood({ x: 15, y: 10 })
    setDirection('RIGHT')
    setIsGameOver(false)
    setScore(0)
    setIsPaused(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span className="font-bold font-mono text-sm text-white">{score} PTS</span>
          <span className="text-neutral-500">•</span>
          <span className="text-[10px] text-amber-400 font-bold">BEST: {highScore}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={restart}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid Canvas Board */}
      <div className="flex-1 flex items-center justify-center p-4 bg-neutral-950 relative">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: '380px',
            height: '380px'
          }}
          className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl relative"
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE
            const y = Math.floor(idx / GRID_SIZE)
            const isHead = snake[0].x === x && snake[0].y === y
            const isBody = snake.slice(1).some(s => s.x === x && s.y === y)
            const isFood = food.x === x && food.y === y

            return (
              <div
                key={idx}
                className={`w-full h-full border border-white/2 transition-colors ${
                  isHead
                    ? 'bg-emerald-400 rounded-sm shadow-md'
                    : isBody
                    ? 'bg-emerald-600 rounded-xs'
                    : isFood
                    ? 'bg-rose-500 rounded-full animate-pulse'
                    : 'bg-transparent'
                }`}
              />
            )
          })}
        </div>

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-10">
            <h2 className="text-2xl font-bold text-rose-500">GAME OVER</h2>
            <p className="text-neutral-300">Final Score: <strong className="text-white">{score}</strong></p>
            <button
              onClick={restart}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="p-2 text-center text-[10px] text-neutral-500 border-t border-white/5">
        Control with Arrow Keys or WASD • Press Space to Pause
      </div>
    </div>
  )
}
