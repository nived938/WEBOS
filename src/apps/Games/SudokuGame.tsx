import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { RotateCcw, Check, Sparkles, HelpCircle } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

const SAMPLE_PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
]

export const SudokuGame: React.FC<AppInstanceProps> = () => {
  const [board, setBoard] = useState<number[][]>(() => SAMPLE_PUZZLE.map(r => [...r]))
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>({ r: 0, c: 2 })

  const isInitial = (r: number, c: number) => SAMPLE_PUZZLE[r][c] !== 0

  const handleInputNumber = (num: number) => {
    if (!selectedCell) return
    const { r, c } = selectedCell
    if (isInitial(r, c)) return

    soundService.playClick()
    const newBoard = board.map(row => [...row])
    newBoard[r][c] = num
    setBoard(newBoard)
  }

  const handleClear = () => {
    if (!selectedCell) return
    const { r, c } = selectedCell
    if (isInitial(r, c)) return
    soundService.playClick()
    const newBoard = board.map(row => [...row])
    newBoard[r][c] = 0
    setBoard(newBoard)
  }

  const restart = () => {
    soundService.playClick()
    setBoard(SAMPLE_PUZZLE.map(r => [...r]))
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <span className="font-bold text-white">Classic Sudoku</span>
        <button onClick={restart} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid & Numbers */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-neutral-950 space-y-4">
        {/* 9x9 Board */}
        <div className="bg-neutral-800 p-2 rounded-xl border-2 border-white/20 shadow-2xl">
          <div className="grid grid-cols-9 gap-px bg-white/10">
            {board.map((row, r) =>
              row.map((val, c) => {
                const isSelected = selectedCell?.r === r && selectedCell?.c === c
                const isFixed = isInitial(r, c)
                const borderR = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-white/30' : ''
                const borderB = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-white/30' : ''

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => {
                      soundService.playClick()
                      setSelectedCell({ r, c })
                    }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-mono font-bold text-sm cursor-pointer transition-colors ${borderR} ${borderB} ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isFixed
                        ? 'bg-neutral-900 text-neutral-300 font-extrabold'
                        : 'bg-neutral-950/80 text-blue-400 hover:bg-neutral-700'
                    }`}
                  >
                    {val > 0 ? val : ''}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Number buttons keypad */}
        <div className="flex items-center space-x-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
              key={n}
              onClick={() => handleInputNumber(n)}
              className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono font-bold text-sm border border-white/10 shadow-sm"
            >
              {n}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="px-2.5 h-8 rounded-lg bg-neutral-800 hover:bg-red-500/30 text-neutral-400 hover:text-red-400 font-mono text-xs border border-white/10"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
