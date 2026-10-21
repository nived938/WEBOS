import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { RotateCcw, User, Cpu } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

type CellValue = 'X' | 'O' | null

export const TicTacToeGame: React.FC<AppInstanceProps> = () => {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [vsAI, setVsAI] = useState(true)
  const [scores, setScores] = useState({ x: 0, o: 0, ties: 0 })

  const checkWinner = (squares: CellValue[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] }
      }
    }
    if (squares.every(s => s !== null)) return { winner: 'TIE', line: [] as number[] }
    return null
  }

  const result = checkWinner(board)

  const minimax = (newBoard: CellValue[], depth: number, isMaximizing: boolean): number => {
    const res = checkWinner(newBoard)
    if (res?.winner === 'O') return 10 - depth
    if (res?.winner === 'X') return depth - 10
    if (res?.winner === 'TIE') return 0

    if (isMaximizing) {
      let maxEval = -Infinity
      for (let i = 0; i < 9; i++) {
        if (!newBoard[i]) {
          newBoard[i] = 'O'
          const evaluation = minimax(newBoard, depth + 1, false)
          newBoard[i] = null
          maxEval = Math.max(maxEval, evaluation)
        }
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (let i = 0; i < 9; i++) {
        if (!newBoard[i]) {
          newBoard[i] = 'X'
          const evaluation = minimax(newBoard, depth + 1, true)
          newBoard[i] = null
          minEval = Math.min(minEval, evaluation)
        }
      }
      return minEval
    }
  }

  const getBestMove = (currentBoard: CellValue[]): number => {
    let bestScore = -Infinity
    let move = -1
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        currentBoard[i] = 'O'
        const score = minimax(currentBoard, 0, false)
        currentBoard[i] = null
        if (score > bestScore) {
          bestScore = score
          move = i
        }
      }
    }
    return move
  }

  const handleClick = (idx: number) => {
    if (board[idx] || result) return
    soundService.playClick()

    const newBoard = [...board]
    newBoard[idx] = isXNext ? 'X' : 'O'
    setBoard(newBoard)

    const nextRes = checkWinner(newBoard)
    if (nextRes) {
      updateScore(nextRes.winner)
      return
    }

    if (vsAI && isXNext) {
      // AI Move
      setTimeout(() => {
        const aiMove = getBestMove(newBoard)
        if (aiMove !== -1) {
          soundService.playClick()
          newBoard[aiMove] = 'O'
          setBoard([...newBoard])
          const finalRes = checkWinner(newBoard)
          if (finalRes) updateScore(finalRes.winner)
        }
      }, 200)
    } else {
      setIsXNext(!isXNext)
    }
  }

  const updateScore = (winner: string) => {
    soundService.playNotification()
    if (winner === 'X') setScores(s => ({ ...s, x: s.x + 1 }))
    else if (winner === 'O') setScores(s => ({ ...s, o: s.o + 1 }))
    else setScores(s => ({ ...s, ties: s.ties + 1 }))
  }

  const resetGame = () => {
    soundService.playClick()
    setBoard(Array(9).fill(null))
    setIsXNext(true)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <button
          onClick={() => {
            soundService.playClick()
            setVsAI(a => !a)
            resetGame()
          }}
          className="flex items-center space-x-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white"
        >
          {vsAI ? <Cpu className="w-3.5 h-3.5 text-purple-400" /> : <User className="w-3.5 h-3.5 text-blue-400" />}
          <span>{vsAI ? 'vs Minimax AI' : '2 Players'}</span>
        </button>

        <div className="flex items-center space-x-3 font-mono font-bold">
          <span className="text-blue-400">X: {scores.x}</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400">Ties: {scores.ties}</span>
          <span className="text-neutral-500">•</span>
          <span className="text-rose-400">O: {scores.o}</span>
        </div>

        <button onClick={resetGame} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main 3x3 Grid */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-neutral-950">
        <div className="grid grid-cols-3 gap-3 w-64 h-64">
          {board.map((cell, idx) => {
            const isWinningCell = result?.line.includes(idx)
            return (
              <div
                key={idx}
                onClick={() => handleClick(idx)}
                className={`rounded-2xl border flex items-center justify-center font-bold text-3xl font-mono cursor-pointer transition-all ${
                  isWinningCell
                    ? 'bg-emerald-500/30 border-emerald-500 text-emerald-400 scale-105'
                    : 'bg-neutral-800/60 hover:bg-neutral-800 border-white/10'
                } ${cell === 'X' ? 'text-blue-400' : 'text-rose-400'}`}
              >
                {cell}
              </div>
            )
          })}
        </div>

        {result && (
          <div className="mt-4 text-center font-bold text-sm">
            {result.winner === 'TIE' ? (
              <span className="text-amber-400">It's a Draw!</span>
            ) : (
              <span className={result.winner === 'X' ? 'text-blue-400' : 'text-rose-400'}>
                Player {result.winner} Wins!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
