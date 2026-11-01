import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Award } from 'lucide-react'

type Piece = string | null

const INITIAL_BOARD: Piece[][] = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
]

export const ChessTrainerApp: React.FC<AppInstanceProps> = () => {
  const [board, setBoard] = useState<Piece[][]>(INITIAL_BOARD)
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [turn, setTurn] = useState<'white' | 'black'>('white')
  const [moves, setMoves] = useState<string[]>([])

  const handleSquareClick = (r: number, c: number) => {
    soundService.play('buttonClick')
    if (selected) {
      const [sr, sc] = selected
      if (sr === r && sc === c) {
        setSelected(null)
        return
      }

      // Move piece
      const nextBoard = board.map((row) => [...row])
      const piece = nextBoard[sr][sc]
      nextBoard[r][c] = piece
      nextBoard[sr][sc] = null
      setBoard(nextBoard)
      setSelected(null)

      const colLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      const moveNotation = `${piece || ''}${colLetters[sc]}${8 - sr} → ${colLetters[c]}${8 - r}`
      setMoves((prev) => [moveNotation, ...prev])
      setTurn((t) => (t === 'white' ? 'black' : 'white'))
    } else {
      if (board[r][c]) {
        setSelected([r, c])
      }
    }
  }

  const resetBoard = () => {
    soundService.play('buttonClick')
    setBoard(INITIAL_BOARD)
    setSelected(null)
    setMoves([])
    setTurn('white')
  }

  return (
    <div className="flex h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Chessboard Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black/40">
        <div className="border-4 border-amber-950/60 rounded-xl overflow-hidden shadow-2xl">
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((piece, c) => {
                const isDark = (r + c) % 2 === 1
                const isSelected = selected && selected[0] === r && selected[1] === c
                return (
                  <div
                    key={c}
                    onClick={() => handleSquareClick(r, c)}
                    className={`w-12 h-12 flex items-center justify-center text-3xl cursor-pointer select-none transition-colors ${
                      isSelected
                        ? 'bg-amber-400/80 ring-2 ring-white'
                        : isDark
                        ? 'bg-[#b58863]'
                        : 'bg-[#f0d9b5]'
                    } ${piece && ['♜', '♞', '♝', '♛', '♚', '♟'].includes(piece) ? 'text-black' : 'text-neutral-900 font-bold'}`}
                  >
                    {piece}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* History and Controls Sidebar */}
      <div className="w-64 bg-black/30 border-l border-white/10 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs font-bold text-white">Chess Master</h3>
            <button
              onClick={resetBoard}
              className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white"
              title="Reset Board"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="my-3 text-xs flex justify-between items-center bg-white/5 p-2 rounded-lg">
            <span className="text-neutral-400">Turn to move:</span>
            <span className="font-bold text-white capitalize">{turn}</span>
          </div>

          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Move Ledger
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1 text-xs font-mono">
            {moves.map((m, idx) => (
              <div key={idx} className="p-1 rounded bg-black/20 text-neutral-300">
                #{moves.length - idx}: {m}
              </div>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-neutral-500 text-center">
          Tap pieces to view highlights and play moves
        </div>
      </div>
    </div>
  )
}
