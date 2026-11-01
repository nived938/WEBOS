import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Award } from 'lucide-react'

// 6 rows x 7 columns
type Player = 'red' | 'yellow'
type Grid = (Player | null)[][]

const ROWS = 6
const COLS = 7

export const ConnectFourGame: React.FC<AppInstanceProps> = () => {
  const [grid, setGrid] = useState<Grid>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  )
  const [turn, setTurn] = useState<Player>('red')
  const [winner, setWinner] = useState<Player | 'tie' | null>(null)
  const [scores, setScores] = useState({ red: 0, yellow: 0 })

  const checkWin = (g: Grid, r: number, c: number, p: Player): boolean => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diag down-right
      [1, -1], // diag up-right
    ]

    for (const [dr, dc] of directions) {
      let count = 1

      // Forward
      let step = 1
      while (true) {
        const nr = r + dr * step
        const nc = c + dc * step
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || g[nr][nc] !== p) break
        count++
        step++
      }

      // Backward
      step = 1
      while (true) {
        const nr = r - dr * step
        const nc = c - dc * step
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || g[nr][nc] !== p) break
        count++
        step++
      }

      if (count >= 4) return true
    }
    return false
  }

  // AI Drop in Column
  const aiTurn = (currentGrid: Grid) => {
    setTimeout(() => {
      // Find valid columns
      const validCols: number[] = []
      for (let c = 0; c < COLS; c++) {
        if (!currentGrid[0][c]) validCols.push(c)
      }

      if (validCols.length === 0) {
        setWinner('tie')
        return
      }

      // Pick center bias
      validCols.sort((a, b) => Math.abs(3 - a) - Math.abs(3 - b))
      const chosenCol = validCols[0]

      // Drop
      let targetRow = -1
      for (let r = ROWS - 1; r >= 0; r--) {
        if (!currentGrid[r][chosenCol]) {
          targetRow = r
          break
        }
      }

      if (targetRow >= 0) {
        const nextGrid = currentGrid.map((row) => [...row])
        nextGrid[targetRow][chosenCol] = 'yellow'
        soundService.playClick()
        setGrid(nextGrid)

        if (checkWin(nextGrid, targetRow, chosenCol, 'yellow')) {
          soundService.playNotification()
          setWinner('yellow')
          setScores((s) => ({ ...s, yellow: s.yellow + 1 }))
        } else {
          setTurn('red')
        }
      }
    }, 450)
  }

  const handleColumnClick = (colIdx: number) => {
    if (winner || turn !== 'red') return

    // Find lowest empty row in column
    let targetRow = -1
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!grid[r][colIdx]) {
        targetRow = r
        break
      }
    }

    if (targetRow < 0) return // Column full

    const nextGrid = grid.map((row) => [...row])
    nextGrid[targetRow][colIdx] = 'red'
    soundService.playClick()
    setGrid(nextGrid)

    if (checkWin(nextGrid, targetRow, colIdx, 'red')) {
      soundService.playNotification()
      setWinner('red')
      setScores((s) => ({ ...s, red: s.red + 1 }))
    } else {
      setTurn('yellow')
      aiTurn(nextGrid)
    }
  }

  const reset = () => {
    soundService.playClick()
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)))
    setTurn('red')
    setWinner(null)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-bold">
            {winner ? (winner === 'tie' ? 'Tie Game!' : `${winner.toUpperCase()} Wins!`) : `${turn.toUpperCase()}'s Turn`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-400">R: {scores.red} | Y: {scores.yellow}</span>
          <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7x6 Connect Four Blue Frame */}
      <div className="bg-blue-600 p-4 rounded-2xl shadow-2xl border-4 border-blue-700">
        <div className="grid grid-cols-7 gap-2">
          {Array(COLS).fill(0).map((_, c) => (
            <div
              key={c}
              onClick={() => handleColumnClick(c)}
              className="flex flex-col gap-2 cursor-pointer group"
            >
              {Array(ROWS).fill(0).map((_, r) => {
                const cell = grid[r][c]
                return (
                  <div
                    key={`${r}-${c}`}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-950 border-2 border-blue-800 flex items-center justify-center shadow-inner group-hover:border-blue-400 transition-colors"
                  >
                    {cell && (
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-lg border-2 ${
                          cell === 'red'
                            ? 'bg-red-500 border-red-300'
                            : 'bg-yellow-400 border-yellow-200'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Click any column to drop a checker • Connect 4 in a row horizontally, vertically or diagonally to win
      </div>
    </div>
  )
}
