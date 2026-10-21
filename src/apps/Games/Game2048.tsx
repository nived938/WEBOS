import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { RotateCcw, Trophy } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

const TILE_COLORS: Record<number, string> = {
  2: 'bg-neutral-700 text-white',
  4: 'bg-neutral-600 text-white',
  8: 'bg-amber-600 text-white font-bold',
  16: 'bg-orange-600 text-white font-bold',
  32: 'bg-rose-600 text-white font-bold',
  64: 'bg-red-600 text-white font-bold shadow-lg',
  128: 'bg-yellow-500 text-black font-extrabold shadow-lg',
  256: 'bg-yellow-400 text-black font-extrabold shadow-xl',
  512: 'bg-yellow-300 text-black font-black shadow-xl',
  1024: 'bg-emerald-500 text-white font-black shadow-2xl',
  2048: 'bg-purple-600 text-white font-black shadow-2xl animate-pulse',
}

export const Game2048: React.FC<AppInstanceProps> = () => {
  const [board, setBoard] = useState<number[][]>(() => {
    const b = Array.from({ length: 4 }, () => Array(4).fill(0))
    // Add two initial tiles
    addRandom(b)
    addRandom(b)
    return b
  })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('nova_2048_high') || 0)
  })
  const [gameOver, setGameOver] = useState(false)

  function addRandom(grid: number[][]) {
    const emptyCells: { r: number; c: number }[] = []
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) emptyCells.push({ r, c })
      }
    }
    if (emptyCells.length === 0) return
    const rand = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    grid[rand.r][rand.c] = Math.random() < 0.9 ? 2 : 4
  }

  const slideRow = (row: number[]) => {
    let arr = row.filter(val => val !== 0)
    let gained = 0
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2
        gained += arr[i]
        arr[i + 1] = 0
      }
    }
    arr = arr.filter(val => val !== 0)
    while (arr.length < 4) arr.push(0)
    return { arr, gained }
  }

  const move = (direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    if (gameOver) return
    let changed = false
    let totalGained = 0
    const newBoard = board.map(r => [...r])

    if (direction === 'LEFT') {
      for (let r = 0; r < 4; r++) {
        const { arr, gained } = slideRow(newBoard[r])
        totalGained += gained
        if (arr.some((val, i) => val !== newBoard[r][i])) changed = true
        newBoard[r] = arr
      }
    } else if (direction === 'RIGHT') {
      for (let r = 0; r < 4; r++) {
        const reversed = [...newBoard[r]].reverse()
        const { arr, gained } = slideRow(reversed)
        totalGained += gained
        arr.reverse()
        if (arr.some((val, i) => val !== newBoard[r][i])) changed = true
        newBoard[r] = arr
      }
    } else if (direction === 'UP') {
      for (let c = 0; c < 4; c++) {
        const col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]]
        const { arr, gained } = slideRow(col)
        totalGained += gained
        for (let r = 0; r < 4; r++) {
          if (newBoard[r][c] !== arr[r]) changed = true
          newBoard[r][c] = arr[r]
        }
      }
    } else if (direction === 'DOWN') {
      for (let c = 0; c < 4; c++) {
        const col = [newBoard[3][c], newBoard[2][c], newBoard[1][c], newBoard[0][c]]
        const { arr, gained } = slideRow(col)
        totalGained += gained
        arr.reverse()
        for (let r = 0; r < 4; r++) {
          if (newBoard[r][c] !== arr[r]) changed = true
          newBoard[r][c] = arr[r]
        }
      }
    }

    if (changed) {
      soundService.playClick()
      addRandom(newBoard)
      setBoard(newBoard)
      if (totalGained > 0) {
        setScore(s => {
          const next = s + totalGained
          if (next > highScore) {
            setHighScore(next)
            localStorage.setItem('nova_2048_high', String(next))
          }
          return next
        })
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'arrowleft' || k === 'a') move('LEFT')
      else if (k === 'arrowright' || k === 'd') move('RIGHT')
      else if (k === 'arrowup' || k === 'w') move('UP')
      else if (k === 'arrowdown' || k === 's') move('DOWN')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [board, gameOver, highScore])

  const restart = () => {
    soundService.playClick()
    const b = Array.from({ length: 4 }, () => Array(4).fill(0))
    addRandom(b)
    addRandom(b)
    setBoard(b)
    setScore(0)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Bar */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-bold text-sm text-white">{score} PTS</span>
          <span className="text-neutral-500">•</span>
          <span className="text-[10px] text-amber-400 font-bold">BEST: {highScore}</span>
        </div>

        <button
          onClick={restart}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
          title="Restart"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2048 Board */}
      <div className="flex-1 flex items-center justify-center p-4 bg-neutral-950">
        <div className="bg-neutral-900 p-3 rounded-2xl border border-white/10 shadow-2xl grid grid-cols-4 gap-2.5 w-72 h-72">
          {board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-full h-full rounded-xl flex items-center justify-center font-bold text-base transition-all duration-100 ${
                  val ? TILE_COLORS[val] || 'bg-purple-600 text-white' : 'bg-neutral-800/50'
                }`}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-2 text-center text-[10px] text-neutral-500 border-t border-white/5">
        Slide tiles using Arrow Keys or WASD • Merge equal numbers to reach 2048!
      </div>
    </div>
  )
}
