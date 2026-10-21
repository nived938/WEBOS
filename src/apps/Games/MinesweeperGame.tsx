import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Bomb, Flag, Smile, Frown, Award, RotateCcw } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface Cell {
  x: number
  y: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

const DIFFICULTIES = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 12, cols: 12, mines: 22 },
}

export const MinesweeperGame: React.FC<AppInstanceProps> = () => {
  const [diff, setDiff] = useState<'beginner' | 'intermediate'>('beginner')
  const config = DIFFICULTIES[diff]
  const [grid, setGrid] = useState<Cell[][]>([])
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle')
  const [timer, setTimer] = useState(0)
  const [flagsRemaining, setFlagsRemaining] = useState(config.mines)

  // Initialize board
  const initBoard = () => {
    const { rows, cols } = config
    const newGrid: Cell[][] = []
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = []
      for (let c = 0; c < cols; c++) {
        row.push({
          x: c,
          y: r,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        })
      }
      newGrid.push(row)
    }
    setGrid(newGrid)
    setGameState('idle')
    setTimer(0)
    setFlagsRemaining(config.mines)
  }

  useEffect(() => {
    initBoard()
  }, [diff])

  useEffect(() => {
    let interval: any
    if (gameState === 'playing') {
      interval = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [gameState])

  const plantMines = (firstX: number, firstY: number, baseGrid: Cell[][]) => {
    const { rows, cols, mines } = config
    let planted = 0
    while (planted < mines) {
      const rx = Math.floor(Math.random() * cols)
      const ry = Math.floor(Math.random() * rows)
      if ((rx !== firstX || ry !== firstY) && !baseGrid[ry][rx].isMine) {
        baseGrid[ry][rx].isMine = true
        planted++
      }
    }

    // Count neighbors
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!baseGrid[r][c].isMine) {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr
              const nc = c + dc
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && baseGrid[nr][nc].isMine) {
                count++
              }
            }
          }
          baseGrid[r][c].neighborMines = count
        }
      }
    }
  }

  const revealCell = (x: number, y: number) => {
    if (gameState === 'lost' || gameState === 'won') return
    const newGrid = grid.map(r => r.map(c => ({ ...c })))

    if (gameState === 'idle') {
      plantMines(x, y, newGrid)
      setGameState('playing')
    }

    const cell = newGrid[y][x]
    if (cell.isFlagged || cell.isRevealed) return

    if (cell.isMine) {
      // Game Over: reveal all mines
      newGrid.forEach(row => row.forEach(c => {
        if (c.isMine) c.isRevealed = true
      }))
      setGrid(newGrid)
      setGameState('lost')
      soundService.playNotification()
      return
    }

    // Flood fill algorithm
    const flood = (cx: number, cy: number) => {
      if (cx < 0 || cx >= config.cols || cy < 0 || cy >= config.rows) return
      const target = newGrid[cy][cx]
      if (target.isRevealed || target.isFlagged || target.isMine) return

      target.isRevealed = true
      if (target.neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            flood(cx + dc, cy + dr)
          }
        }
      }
    }

    flood(x, y)
    soundService.playClick()
    setGrid(newGrid)

    // Check win condition
    const { rows, cols, mines } = config
    let revealedCount = 0
    newGrid.forEach(row => row.forEach(c => {
      if (c.isRevealed && !c.isMine) revealedCount++
    }))

    if (revealedCount === rows * cols - mines) {
      setGameState('won')
      soundService.playNotification()
    }
  }

  const toggleFlag = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault()
    if (gameState === 'lost' || gameState === 'won') return
    soundService.playClick()
    const newGrid = grid.map(r => r.map(c => ({ ...c })))
    const cell = newGrid[y][x]
    if (cell.isRevealed) return

    cell.isFlagged = !cell.isFlagged
    setGrid(newGrid)
    setFlagsRemaining(f => (cell.isFlagged ? f - 1 : f + 1))
  }

  const getNumberColor = (num: number) => {
    switch (num) {
      case 1: return 'text-blue-400'
      case 2: return 'text-emerald-400'
      case 3: return 'text-red-400'
      case 4: return 'text-purple-400'
      default: return 'text-amber-400'
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 bg-neutral-950 px-3 py-1 rounded-lg border border-white/5 font-mono text-sm text-red-400 font-bold">
          <Bomb className="w-4 h-4" />
          <span>{flagsRemaining.toString().padStart(2, '0')}</span>
        </div>

        <button
          onClick={initBoard}
          className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-white/10 shadow-sm"
        >
          {gameState === 'won' ? (
            <Award className="w-5 h-5 text-amber-400" />
          ) : gameState === 'lost' ? (
            <Frown className="w-5 h-5 text-rose-400" />
          ) : (
            <Smile className="w-5 h-5 text-amber-300" />
          )}
        </button>

        <div className="bg-neutral-950 px-3 py-1 rounded-lg border border-white/5 font-mono text-sm text-amber-400 font-bold">
          {timer.toString().padStart(3, '0')}
        </div>
      </div>

      {/* Main Board */}
      <div className="flex-1 flex items-center justify-center p-4 bg-neutral-950 overflow-auto">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
            gap: '2px'
          }}
          className="bg-neutral-800 p-2 rounded-xl border border-white/10 shadow-2xl"
        >
          {grid.map(row => row.map(cell => (
            <div
              key={`${cell.x}-${cell.y}`}
              onClick={() => revealCell(cell.x, cell.y)}
              onContextMenu={(e) => toggleFlag(e, cell.x, cell.y)}
              className={`w-7 h-7 flex items-center justify-center font-bold text-xs rounded-sm cursor-pointer transition-all ${
                cell.isRevealed
                  ? cell.isMine
                    ? 'bg-red-600 text-white shadow-inner'
                    : 'bg-neutral-700/80'
                  : 'bg-neutral-600 hover:bg-neutral-500 shadow-md'
              }`}
            >
              {cell.isRevealed ? (
                cell.isMine ? (
                  <Bomb className="w-3.5 h-3.5" />
                ) : cell.neighborMines > 0 ? (
                  <span className={getNumberColor(cell.neighborMines)}>{cell.neighborMines}</span>
                ) : null
              ) : cell.isFlagged ? (
                <Flag className="w-3 h-3 text-red-500 fill-red-500" />
              ) : null}
            </div>
          )))}
        </div>
      </div>

      {/* Footer difficulty tabs */}
      <div className="p-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex space-x-2">
          <button
            onClick={() => setDiff('beginner')}
            className={`px-2 py-0.5 rounded ${diff === 'beginner' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`}
          >
            Beginner (9x9)
          </button>
          <button
            onClick={() => setDiff('intermediate')}
            className={`px-2 py-0.5 rounded ${diff === 'intermediate' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`}
          >
            Intermediate (12x12)
          </button>
        </div>
        <span>Left Click: Reveal • Right Click: Flag</span>
      </div>
    </div>
  )
}
