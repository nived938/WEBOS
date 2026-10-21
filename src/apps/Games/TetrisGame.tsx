import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Play, Pause, RotateCcw, Trophy } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

const COLS = 10
const ROWS = 20

const TETROMINOES: Record<string, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-400' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-amber-400' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-emerald-500' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-rose-500' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-500' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-500' },
}

export const TetrisGame: React.FC<AppInstanceProps> = () => {
  const [board, setBoard] = useState<string[][]>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  )
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const currentPieceRef = useRef<{ type: string; shape: number[][]; x: number; y: number }>({
    type: 'T',
    shape: TETROMINOES.T.shape,
    x: 3,
    y: 0
  })

  const [currentPiece, setCurrentPiece] = useState(currentPieceRef.current)

  const spawnRandomPiece = () => {
    const keys = Object.keys(TETROMINOES)
    const randKey = keys[Math.floor(Math.random() * keys.length)]
    const newPiece = {
      type: randKey,
      shape: TETROMINOES[randKey].shape,
      x: 3,
      y: 0
    }
    currentPieceRef.current = newPiece
    setCurrentPiece(newPiece)

    // Check game over
    if (checkCollision(newPiece.shape, newPiece.x, newPiece.y, board)) {
      setIsGameOver(true)
      soundService.playNotification()
    }
  }

  const checkCollision = (shape: number[][], offsetX: number, offsetY: number, currentBoard: string[][]) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = offsetX + c
          const newY = offsetY + r
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true
          if (newY >= 0 && currentBoard[newY][newX]) return true
        }
      }
    }
    return false
  }

  const rotate = (matrix: number[][]) => {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse())
  }

  const lockPiece = () => {
    const { shape, x, y, type } = currentPieceRef.current
    const newBoard = board.map(row => [...row])

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] && y + r >= 0) {
          newBoard[y + r][x + c] = TETROMINOES[type].color
        }
      }
    }

    // Clear completed lines
    let cleared = 0
    const filteredBoard = newBoard.filter(row => {
      const isComplete = row.every(cell => cell !== '')
      if (isComplete) cleared++
      return !isComplete
    })

    while (filteredBoard.length < ROWS) {
      filteredBoard.unshift(Array(COLS).fill(''))
    }

    if (cleared > 0) {
      soundService.playNotification()
      setLines(l => l + cleared)
      setScore(s => s + cleared * 100 * cleared)
    } else {
      soundService.playClick()
    }

    setBoard(filteredBoard)
    spawnRandomPiece()
  }

  const move = (dx: number, dy: number) => {
    if (isGameOver || isPaused) return
    const p = currentPieceRef.current
    if (!checkCollision(p.shape, p.x + dx, p.y + dy, board)) {
      p.x += dx
      p.y += dy
      currentPieceRef.current = { ...p }
      setCurrentPiece({ ...p })
      return true
    } else if (dy > 0) {
      lockPiece()
      return false
    }
    return false
  }

  const hardDrop = () => {
    if (isGameOver || isPaused) return
    let droppedY = currentPieceRef.current.y
    while (!checkCollision(currentPieceRef.current.shape, currentPieceRef.current.x, droppedY + 1, board)) {
      droppedY++
    }
    currentPieceRef.current.y = droppedY
    currentPieceRef.current = { ...currentPieceRef.current }
    setCurrentPiece({ ...currentPieceRef.current })
    lockPiece()
  }

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'arrowleft' || k === 'a') move(-1, 0)
      else if (k === 'arrowright' || k === 'd') move(1, 0)
      else if (k === 'arrowdown' || k === 's') move(0, 1)
      else if (k === 'arrowup' || k === 'w') {
        const rotated = rotate(currentPieceRef.current.shape)
        if (!checkCollision(rotated, currentPieceRef.current.x, currentPieceRef.current.y, board)) {
          soundService.playClick()
          currentPieceRef.current.shape = rotated
          setCurrentPiece({ ...currentPieceRef.current })
        }
      } else if (k === ' ') {
        e.preventDefault()
        hardDrop()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [board, isGameOver, isPaused])

  // Gravity timer loop
  useEffect(() => {
    if (isGameOver || isPaused) return
    const interval = setInterval(() => {
      move(0, 1)
    }, 600)
    return () => clearInterval(interval)
  }, [board, isGameOver, isPaused])

  const restart = () => {
    soundService.playClick()
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill('')))
    setScore(0)
    setLines(0)
    setIsGameOver(false)
    setIsPaused(false)
    spawnRandomPiece()
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Bar */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-bold text-sm text-white">{score} PTS</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400">Lines: {lines}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setIsPaused(p => !p)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button onClick={restart} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tetris Board */}
      <div className="flex-1 flex items-center justify-center p-4 bg-neutral-950 relative">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            width: '240px',
            height: '420px'
          }}
          className="bg-neutral-900 border-2 border-white/15 rounded-lg overflow-hidden shadow-2xl relative"
        >
          {Array.from({ length: ROWS * COLS }).map((_, idx) => {
            const x = idx % COLS
            const y = Math.floor(idx / COLS)
            let cellColor = board[y][x]

            // Check if cell is active piece
            const p = currentPiece
            if (
              y >= p.y &&
              y < p.y + p.shape.length &&
              x >= p.x &&
              x < p.x + p.shape[0].length
            ) {
              if (p.shape[y - p.y][x - p.x]) {
                cellColor = TETROMINOES[p.type].color
              }
            }

            return (
              <div
                key={idx}
                className={`w-full h-full border border-white/5 ${cellColor || 'bg-transparent'}`}
              />
            )
          })}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-10">
            <h2 className="text-2xl font-bold text-rose-500">GAME OVER</h2>
            <p className="text-neutral-300">Final Score: <strong className="text-white">{score}</strong></p>
            <button onClick={restart} className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold">
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="p-2 text-center text-[10px] text-neutral-500 border-t border-white/5">
        Arrow Keys: Move & Rotate • Spacebar: Hard Drop
      </div>
    </div>
  )
}
