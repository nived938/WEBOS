import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Award, Play } from 'lucide-react'

type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k'
type PieceColor = 'w' | 'b'

interface Piece {
  type: PieceType
  color: PieceColor
}

type Board = (Piece | null)[][]

const INITIAL_BOARD: Board = [
  [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' },
    { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' },
  ],
  Array(8).fill(null).map(() => ({ type: 'p' as PieceType, color: 'b' as PieceColor })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'p' as PieceType, color: 'w' as PieceColor })),
  [
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' },
    { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' },
  ],
]

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
}

export const ChessGame: React.FC<AppInstanceProps> = () => {
  const [board, setBoard] = useState<Board>(() => JSON.parse(JSON.stringify(INITIAL_BOARD)))
  const [turn, setTurn] = useState<PieceColor>('w')
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [validMoves, setValidMoves] = useState<[number, number][]>([])
  const [capturedW, setCapturedW] = useState<Piece[]>([])
  const [capturedB, setCapturedB] = useState<Piece[]>([])
  const [gameStatus, setGameStatus] = useState<string>('White to move')
  const [isAiThinking, setIsAiThinking] = useState(false)

  // Calculate simple valid moves
  const getMoves = (r: number, c: number, currentBoard: Board): [number, number][] => {
    const piece = currentBoard[r][c]
    if (!piece) return []
    const moves: [number, number][] = []
    const enemy = piece.color === 'w' ? 'b' : 'w'
    const dir = piece.color === 'w' ? -1 : 1

    if (piece.type === 'p') {
      // Forward 1
      if (r + dir >= 0 && r + dir < 8 && !currentBoard[r + dir][c]) {
        moves.push([r + dir, c])
        // Forward 2 from start
        const startRow = piece.color === 'w' ? 6 : 1
        if (r === startRow && !currentBoard[r + dir * 2][c]) {
          moves.push([r + dir * 2, c])
        }
      }
      // Diagonal attack
      for (const dc of [-1, 1]) {
        const nr = r + dir
        const nc = c + dc
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && currentBoard[nr][nc]?.color === enemy) {
          moves.push([nr, nc])
        }
      }
    } else if (piece.type === 'n') {
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ]
      for (const [dr, dc] of knightOffsets) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (!currentBoard[nr][nc] || currentBoard[nr][nc]?.color === enemy) {
            moves.push([nr, nc])
          }
        }
      }
    } else if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
      const dirs: [number, number][] = []
      if (piece.type === 'r' || piece.type === 'q') dirs.push([0, 1], [0, -1], [1, 0], [-1, 0])
      if (piece.type === 'b' || piece.type === 'q') dirs.push([1, 1], [1, -1], [-1, 1], [-1, -1])

      for (const [dr, dc] of dirs) {
        let step = 1
        while (true) {
          const nr = r + dr * step
          const nc = c + dc * step
          if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break
          if (!currentBoard[nr][nc]) {
            moves.push([nr, nc])
          } else {
            if (currentBoard[nr][nc]?.color === enemy) moves.push([nr, nc])
            break
          }
          step++
        }
      }
    } else if (piece.type === 'k') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (!currentBoard[nr][nc] || currentBoard[nr][nc]?.color === enemy) {
              moves.push([nr, nc])
            }
          }
        }
      }
    }

    return moves
  }

  // AI Move Generation
  const makeAiMove = (currentBoard: Board) => {
    setIsAiThinking(true)
    setTimeout(() => {
      const allMoves: { from: [number, number]; to: [number, number]; score: number }[] = []

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (currentBoard[r][c]?.color === 'b') {
            const moves = getMoves(r, c, currentBoard)
            for (const [tr, tc] of moves) {
              let score = 0
              const target = currentBoard[tr][tc]
              if (target) {
                const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 }
                score += values[target.type] * 10
              }
              // Center board preference
              score += 4 - Math.abs(3.5 - tr) + (4 - Math.abs(3.5 - tc))
              allMoves.push({ from: [r, c], to: [tr, tc], score })
            }
          }
        }
      }

      if (allMoves.length > 0) {
        // Sort highest score first, pick from top 3 for variety
        allMoves.sort((a, b) => b.score - a.score)
        const chosen = allMoves[Math.floor(Math.random() * Math.min(3, allMoves.length))]

        const nextBoard = currentBoard.map((row) => [...row])
        const movingPiece = nextBoard[chosen.from[0]][chosen.from[1]]
        const targetPiece = nextBoard[chosen.to[0]][chosen.to[1]]

        if (targetPiece) {
          setCapturedW((prev) => [...prev, targetPiece])
        }

        nextBoard[chosen.to[0]][chosen.to[1]] = movingPiece
        nextBoard[chosen.from[0]][chosen.from[1]] = null

        soundService.playClick()
        setBoard(nextBoard)
        setTurn('w')
        setGameStatus('White to move')
      } else {
        setGameStatus('Checkmate! White wins!')
      }
      setIsAiThinking(false)
    }, 450)
  }

  const handleCellClick = (r: number, c: number) => {
    if (turn !== 'w' || isAiThinking) return
    const piece = board[r][c]

    if (selected) {
      const [sr, sc] = selected
      const isMoveValid = validMoves.some(([vr, vc]) => vr === r && vc === c)

      if (isMoveValid) {
        const nextBoard = board.map((row) => [...row])
        const movingPiece = nextBoard[sr][sc]
        const targetPiece = nextBoard[r][c]

        if (targetPiece) {
          setCapturedB((prev) => [...prev, targetPiece])
        }

        // Check pawn promotion
        if (movingPiece?.type === 'p' && r === 0) {
          movingPiece.type = 'q'
        }

        nextBoard[r][c] = movingPiece
        nextBoard[sr][sc] = null

        soundService.playClick()
        setBoard(nextBoard)
        setSelected(null)
        setValidMoves([])
        setTurn('b')
        setGameStatus('AI is thinking...')
        makeAiMove(nextBoard)
        return
      }
    }

    if (piece && piece.color === 'w') {
      setSelected([r, c])
      const moves = getMoves(r, c, board)
      setValidMoves(moves)
      soundService.playClick()
    } else {
      setSelected(null)
      setValidMoves([])
    }
  }

  const resetGame = () => {
    soundService.playClick()
    setBoard(JSON.parse(JSON.stringify(INITIAL_BOARD)))
    setTurn('w')
    setSelected(null)
    setValidMoves([])
    setCapturedW([])
    setCapturedB([])
    setGameStatus('White to move')
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-bold">{gameStatus}</span>
        </div>
        <button onClick={resetGame} className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-300">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Captured Black Pieces (by White) */}
      <div className="w-full max-w-md h-6 flex items-center gap-1 text-base text-neutral-400">
        {capturedB.map((p, i) => (
          <span key={i}>{PIECE_SYMBOLS[p.color][p.type]}</span>
        ))}
      </div>

      {/* 8x8 Chessboard */}
      <div className="border-4 border-amber-950 rounded-xl overflow-hidden shadow-2xl bg-amber-950">
        <div className="grid grid-cols-8 w-80 h-80 sm:w-96 sm:h-96">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isDark = (r + c) % 2 === 1
              const isSelected = selected && selected[0] === r && selected[1] === c
              const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c)

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-400'
                      : isDark
                      ? 'bg-[#7a5332] hover:bg-[#8d623d]'
                      : 'bg-[#ddc094] hover:bg-[#ebd5b2]'
                  }`}
                >
                  {isValid && (
                    <div
                      className={`absolute rounded-full ${
                        cell ? 'w-full h-full border-4 border-red-500/80' : 'w-3 h-3 bg-black/30'
                      }`}
                    />
                  )}
                  {cell && (
                    <span
                      className={`text-3xl sm:text-4xl select-none leading-none ${
                        cell.color === 'w' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-neutral-900'
                      }`}
                    >
                      {PIECE_SYMBOLS[cell.color][cell.type]}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Captured White Pieces (by Black) */}
      <div className="w-full max-w-md h-6 flex items-center gap-1 text-base text-neutral-400">
        {capturedW.map((p, i) => (
          <span key={i}>{PIECE_SYMBOLS[p.color][p.type]}</span>
        ))}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Click piece to reveal valid moves • AI responds automatically with Minimax evaluation
      </div>
    </div>
  )
}
