import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Award } from 'lucide-react'

type CheckerPiece = {
  color: 'red' | 'black'
  isKing: boolean
}

type Board = (CheckerPiece | null)[][]

const INIT_CHECKERS: Board = Array(8).fill(null).map((_, r) =>
  Array(8).fill(null).map((_, c) => {
    if ((r + c) % 2 === 1) {
      if (r < 3) return { color: 'black', isKing: false }
      if (r > 4) return { color: 'red', isKing: false }
    }
    return null
  })
)

export const CheckersGame: React.FC<AppInstanceProps> = () => {
  const [board, setBoard] = useState<Board>(() => JSON.parse(JSON.stringify(INIT_CHECKERS)))
  const [turn, setTurn] = useState<'red' | 'black'>('red')
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [validMoves, setValidMoves] = useState<{ to: [number, number]; jump?: [number, number] }[]>([])
  const [score, setScore] = useState({ red: 0, black: 0 })
  const [status, setStatus] = useState<string>('Red Player turn (Bottom)')

  const getMoves = (r: number, c: number, currentBoard: Board) => {
    const piece = currentBoard[r][c]
    if (!piece) return []
    const moves: { to: [number, number]; jump?: [number, number] }[] = []
    const dirs: number[] = piece.isKing ? [-1, 1] : piece.color === 'red' ? [-1] : [1]
    const enemy = piece.color === 'red' ? 'black' : 'red'

    for (const dr of dirs) {
      for (const dc of [-1, 1]) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (!currentBoard[nr][nc]) {
            moves.push({ to: [nr, nc] })
          } else if (currentBoard[nr][nc]?.color === enemy) {
            const jnr = nr + dr
            const jnc = nc + dc
            if (jnr >= 0 && jnr < 8 && jnc >= 0 && jnc < 8 && !currentBoard[jnr][jnc]) {
              moves.push({ to: [jnr, jnc], jump: [nr, nc] })
            }
          }
        }
      }
    }
    return moves
  }

  const aiMove = (currentBoard: Board) => {
    setTimeout(() => {
      const allMoves: { from: [number, number]; to: [number, number]; jump?: [number, number] }[] = []
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (currentBoard[r][c]?.color === 'black') {
            const m = getMoves(r, c, currentBoard)
            m.forEach((mv) => allMoves.push({ from: [r, c], to: mv.to, jump: mv.jump }))
          }
        }
      }

      if (allMoves.length === 0) {
        setStatus('Red Wins! No moves for Black.')
        return
      }

      // Prioritize jumps
      const jumps = allMoves.filter((m) => m.jump)
      const chosen = jumps.length > 0 ? jumps[Math.floor(Math.random() * jumps.length)] : allMoves[Math.floor(Math.random() * allMoves.length)]

      const nextBoard = currentBoard.map((row) => [...row])
      const p = nextBoard[chosen.from[0]][chosen.from[1]]!
      if (chosen.to[0] === 7) p.isKing = true

      nextBoard[chosen.to[0]][chosen.to[1]] = p
      nextBoard[chosen.from[0]][chosen.from[1]] = null
      if (chosen.jump) {
        nextBoard[chosen.jump[0]][chosen.jump[1]] = null
        setScore((s) => ({ ...s, black: s.black + 1 }))
      }

      soundService.playClick()
      setBoard(nextBoard)
      setTurn('red')
      setStatus('Red Player turn')
    }, 400)
  }

  const handleCellClick = (r: number, c: number) => {
    if (turn !== 'red') return
    const piece = board[r][c]

    if (selected) {
      const [sr, sc] = selected
      const move = validMoves.find((m) => m.to[0] === r && m.to[1] === c)
      if (move) {
        const nextBoard = board.map((row) => [...row])
        const p = nextBoard[sr][sc]!
        if (r === 0) p.isKing = true

        nextBoard[r][c] = p
        nextBoard[sr][sc] = null
        if (move.jump) {
          nextBoard[move.jump[0]][move.jump[1]] = null
          setScore((s) => ({ ...s, red: s.red + 1 }))
        }

        soundService.playClick()
        setBoard(nextBoard)
        setSelected(null)
        setValidMoves([])
        setTurn('black')
        setStatus('Black (AI) thinking...')
        aiMove(nextBoard)
        return
      }
    }

    if (piece && piece.color === 'red') {
      setSelected([r, c])
      setValidMoves(getMoves(r, c, board))
      soundService.playClick()
    } else {
      setSelected(null)
      setValidMoves([])
    }
  }

  const reset = () => {
    soundService.playClick()
    setBoard(JSON.parse(JSON.stringify(INIT_CHECKERS)))
    setTurn('red')
    setSelected(null)
    setValidMoves([])
    setScore({ red: 0, black: 0 })
    setStatus('Red Player turn')
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-sm flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-red-400" />
          <span className="font-bold">{status}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-400">Score: R {score.red} - B {score.black}</span>
          <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-4 border-amber-950 rounded-xl overflow-hidden shadow-2xl bg-amber-950">
        <div className="grid grid-cols-8 w-80 h-80 sm:w-96 sm:h-96">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isDark = (r + c) % 2 === 1
              const isSelected = selected && selected[0] === r && selected[1] === c
              const isValid = validMoves.some((m) => m.to[0] === r && m.to[1] === c)

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                    isSelected ? 'bg-amber-400' : isDark ? 'bg-neutral-800' : 'bg-neutral-200'
                  }`}
                >
                  {isValid && <div className="absolute w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />}
                  {cell && (
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg border-2 ${
                        cell.color === 'red'
                          ? 'bg-red-600 border-red-300 text-white'
                          : 'bg-neutral-950 border-neutral-600 text-amber-400'
                      }`}
                    >
                      {cell.isKing && <span className="text-xs font-black">👑</span>}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Diagonal steps & jump captures • Reach back row for King promotion
      </div>
    </div>
  )
}
