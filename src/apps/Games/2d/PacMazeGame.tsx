import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Heart } from 'lucide-react'

// 15x15 Maze Grid
// 1 = Wall, 0 = Dot, 2 = Empty, 3 = Power Pellet
const MAZE_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 3, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 2, 1, 1, 1, 2, 1, 0, 1, 1, 1],
  [2, 2, 0, 0, 2, 2, 1, 2, 1, 2, 2, 0, 0, 2, 2],
  [1, 1, 1, 0, 1, 2, 1, 1, 1, 2, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 3, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

export const PacMazeGame: React.FC<AppInstanceProps> = () => {
  const [grid, setGrid] = useState<number[][]>(() => MAZE_MAP.map((r) => [...r]))
  const [player, setPlayer] = useState<{ x: number; y: number; dir: string }>({ x: 7, y: 11, dir: 'left' })
  const [ghosts, setGhosts] = useState<{ x: number; y: number; color: string }[]>([
    { x: 6, y: 7, color: '#ef4444' },
    { x: 7, y: 7, color: '#06b6d4' },
    { x: 8, y: 7, color: '#ec4899' },
  ])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [powerTime, setPowerTime] = useState(0)

  // Game loop
  useEffect(() => {
    if (gameOver) return

    const interval = setInterval(() => {
      // Move ghosts
      setGhosts((prev) =>
        prev.map((g) => {
          const dirs = [
            [0, 1], [0, -1], [1, 0], [-1, 0],
          ]
          const valid = dirs.filter(([dx, dy]) => {
            const nx = g.x + dx
            const ny = g.y + dy
            return (
              nx >= 0 &&
              nx < 15 &&
              ny >= 0 &&
              ny < 15 &&
              grid[ny][nx] !== 1
            )
          })
          if (valid.length === 0) return g
          const [dx, dy] = valid[Math.floor(Math.random() * valid.length)]
          return { ...g, x: g.x + dx, y: g.y + dy }
        })
      )

      if (powerTime > 0) setPowerTime((p) => p - 1)
    }, 280)

    return () => clearInterval(interval)
  }, [gameOver, grid, powerTime])

  // Player controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return
      let dx = 0
      let dy = 0
      let dir = player.dir

      if (e.key === 'ArrowUp' || e.key === 'w') { dy = -1; dir = 'up' }
      else if (e.key === 'ArrowDown' || e.key === 's') { dy = 1; dir = 'down' }
      else if (e.key === 'ArrowLeft' || e.key === 'a') { dx = -1; dir = 'left' }
      else if (e.key === 'ArrowRight' || e.key === 'd') { dx = 1; dir = 'right' }
      else return

      const nx = (player.x + dx + 15) % 15
      const ny = (player.y + dy + 15) % 15

      if (grid[ny][nx] !== 1) {
        // Collect dot
        if (grid[ny][nx] === 0) {
          soundService.playClick()
          setScore((s) => s + 10)
          setGrid((g) => {
            const ng = g.map((row) => [...row])
            ng[ny][nx] = 2
            return ng
          })
        } else if (grid[ny][nx] === 3) {
          // Power pellet
          soundService.playNotification()
          setScore((s) => s + 50)
          setPowerTime(25)
          setGrid((g) => {
            const ng = g.map((row) => [...row])
            ng[ny][nx] = 2
            return ng
          })
        }

        setPlayer({ x: nx, y: ny, dir })
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [player, grid, gameOver])

  // Collision with ghosts
  useEffect(() => {
    ghosts.forEach((g) => {
      if (g.x === player.x && g.y === player.y) {
        if (powerTime > 0) {
          // Eat ghost
          soundService.playNotification()
          setScore((s) => s + 200)
          g.x = 7
          g.y = 7
        } else {
          soundService.playTrashEmpty()
          if (lives > 1) {
            setLives((l) => l - 1)
            setPlayer({ x: 7, y: 11, dir: 'left' })
          } else {
            setGameOver(true)
          }
        }
      }
    })
  }, [player, ghosts, powerTime, lives])

  const resetGame = () => {
    soundService.playClick()
    setGrid(MAZE_MAP.map((r) => [...r]))
    setPlayer({ x: 7, y: 11, dir: 'left' })
    setGhosts([
      { x: 6, y: 7, color: '#ef4444' },
      { x: 7, y: 7, color: '#06b6d4' },
      { x: 8, y: 7, color: '#ec4899' },
    ])
    setScore(0)
    setLives(3)
    setGameOver(false)
    setPowerTime(0)
  }

  return (
    <div className="flex flex-col h-full bg-black text-white select-none p-4 text-xs items-center justify-between">
      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-blue-500/30">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400 text-sm">Neon Maze Runner</span>
          <span className="text-neutral-300">Score: {score}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array(lives).fill(0).map((_, i) => (
              <Heart key={i} className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            ))}
          </div>
          <button onClick={resetGame} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Maze Grid */}
      <div className="relative border-2 border-blue-500/60 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-neutral-950">
        <div className="grid grid-cols-15 w-72 h-72 sm:w-80 sm:h-80">
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const isPlayer = player.x === x && player.y === y
              const ghost = ghosts.find((g) => g.x === x && g.y === y)

              return (
                <div
                  key={`${x}-${y}`}
                  className={`relative flex items-center justify-center ${
                    cell === 1 ? 'bg-blue-900/80 border border-blue-700/50' : 'bg-black'
                  }`}
                >
                  {cell === 0 && !isPlayer && !ghost && (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-200 shadow-sm" />
                  )}
                  {cell === 3 && !isPlayer && !ghost && (
                    <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping shadow-[0_0_8px_#facc15]" />
                  )}

                  {/* Player Pac */}
                  {isPlayer && (
                    <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] flex items-center justify-center text-[10px] font-black text-black">
                      ●
                    </div>
                  )}

                  {/* Ghost Drone */}
                  {ghost && !isPlayer && (
                    <div
                      className={`w-4 h-4 rounded-t-full rounded-b-sm flex items-center justify-center ${
                        powerTime > 0 ? 'bg-blue-400' : ''
                      }`}
                      style={{ backgroundColor: powerTime > 0 ? '#3b82f6' : ghost.color }}
                    >
                      <div className="w-1 h-1 bg-white rounded-full mx-0.5" />
                      <div className="w-1 h-1 bg-white rounded-full mx-0.5" />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-red-500 mb-1">Game Over!</h3>
            <p className="text-neutral-400 text-xs mb-3">Score: {score}</p>
            <button
              onClick={resetGame}
              className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg shadow"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Use WASD or Arrow Keys to navigate • Power Pellets allow eating ghosts
      </div>
    </div>
  )
}
