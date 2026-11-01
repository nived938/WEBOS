import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Award } from 'lucide-react'

// 4x4 Dots grid -> 3x3 Boxes
const GRID_SIZE = 4

export const DotsAndBoxesGame: React.FC<AppInstanceProps> = () => {
  // Horiz lines: (GRID_SIZE) rows of (GRID_SIZE - 1) lines
  const [hLines, setHLines] = useState<boolean[][]>(() =>
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE - 1).fill(false))
  )
  // Vert lines: (GRID_SIZE - 1) rows of (GRID_SIZE) lines
  const [vLines, setVLines] = useState<boolean[][]>(() =>
    Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE).fill(false))
  )
  // Boxes: (GRID_SIZE - 1) x (GRID_SIZE - 1)
  const [boxes, setBoxes] = useState<(string | null)[][]>(() =>
    Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE - 1).fill(null))
  )
  const [turn, setTurn] = useState<'P1' | 'AI'>('P1')
  const [scores, setScores] = useState({ P1: 0, AI: 0 })

  // Check if box completed
  const checkBoxes = (
    currentHLines: boolean[][],
    currentVLines: boolean[][],
    currentBoxes: (string | null)[][],
    claimer: string
  ): { newBoxes: (string | null)[][]; claimedCount: number } => {
    let claimedCount = 0
    const nextBoxes = currentBoxes.map((r) => [...r])

    for (let r = 0; r < GRID_SIZE - 1; r++) {
      for (let c = 0; c < GRID_SIZE - 1; c++) {
        if (!nextBoxes[r][c]) {
          const top = currentHLines[r][c]
          const bottom = currentHLines[r + 1][c]
          const left = currentVLines[r][c]
          const right = currentVLines[r][c + 1]

          if (top && bottom && left && right) {
            nextBoxes[r][c] = claimer
            claimedCount++
          }
        }
      }
    }

    return { newBoxes: nextBoxes, claimedCount }
  }

  // Handle Horizontal Line Click
  const handleHLineClick = (r: number, c: number) => {
    if (hLines[r][c] || turn !== 'P1') return
    soundService.playClick()

    const nextH = hLines.map((row) => [...row])
    nextH[r][c] = true
    setHLines(nextH)

    const { newBoxes, claimedCount } = checkBoxes(nextH, vLines, boxes, 'P1')
    if (claimedCount > 0) {
      soundService.playNotification()
      setBoxes(newBoxes)
      setScores((s) => ({ ...s, P1: s.P1 + claimedCount }))
      // Extra turn on claim
    } else {
      setTurn('AI')
      aiTurn(nextH, vLines, boxes)
    }
  }

  // Handle Vertical Line Click
  const handleVLineClick = (r: number, c: number) => {
    if (vLines[r][c] || turn !== 'P1') return
    soundService.playClick()

    const nextV = vLines.map((row) => [...row])
    nextV[r][c] = true
    setVLines(nextV)

    const { newBoxes, claimedCount } = checkBoxes(hLines, nextV, boxes, 'P1')
    if (claimedCount > 0) {
      soundService.playNotification()
      setBoxes(newBoxes)
      setScores((s) => ({ ...s, P1: s.P1 + claimedCount }))
    } else {
      setTurn('AI')
      aiTurn(hLines, nextV, boxes)
    }
  }

  // Simple AI Turn
  const aiTurn = (currentH: boolean[][], currentV: boolean[][], currentBoxes: (string | null)[][]) => {
    setTimeout(() => {
      // Find all empty lines
      const available: { type: 'h' | 'v'; r: number; c: number }[] = []
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE - 1; c++) {
          if (!currentH[r][c]) available.push({ type: 'h', r, c })
        }
      }
      for (let r = 0; r < GRID_SIZE - 1; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (!currentV[r][c]) available.push({ type: 'v', r, c })
        }
      }

      if (available.length === 0) return

      const pick = available[Math.floor(Math.random() * available.length)]
      const nextH = currentH.map((row) => [...row])
      const nextV = currentV.map((row) => [...row])

      if (pick.type === 'h') nextH[pick.r][pick.c] = true
      else nextV[pick.r][pick.c] = true

      setHLines(nextH)
      setVLines(nextV)

      const { newBoxes, claimedCount } = checkBoxes(nextH, nextV, currentBoxes, 'AI')
      if (claimedCount > 0) {
        soundService.playNotification()
        setBoxes(newBoxes)
        setScores((s) => ({ ...s, AI: s.AI + claimedCount }))
        setTurn('P1')
      } else {
        setTurn('P1')
      }
    }, 400)
  }

  const reset = () => {
    soundService.playClick()
    setHLines(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE - 1).fill(false)))
    setVLines(Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE).fill(false)))
    setBoxes(Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE - 1).fill(null)))
    setScores({ P1: 0, AI: 0 })
    setTurn('P1')
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">{turn === 'P1' ? 'Your Turn (Blue)' : 'AI Turn (Red)'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-300">P1: {scores.P1} | AI: {scores.AI}</span>
          <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dots and Lines Grid */}
      <div className="relative p-6 bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl">
        {Array(GRID_SIZE).fill(0).map((_, r) => (
          <React.Fragment key={r}>
            {/* Horizontal Line Row */}
            <div className="flex items-center">
              {Array(GRID_SIZE).fill(0).map((_, c) => (
                <React.Fragment key={c}>
                  {/* Dot */}
                  <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] z-20" />
                  {/* Horizontal Segment */}
                  {c < GRID_SIZE - 1 && (
                    <div
                      onClick={() => handleHLineClick(r, c)}
                      className={`h-2.5 w-16 cursor-pointer transition-colors ${
                        hLines[r][c]
                          ? 'bg-blue-500 shadow-[0_0_6px_#3b82f6]'
                          : 'bg-neutral-800 hover:bg-neutral-600'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Vertical Line Row & Box Centers */}
            {r < GRID_SIZE - 1 && (
              <div className="flex items-center">
                {Array(GRID_SIZE).fill(0).map((_, c) => (
                  <React.Fragment key={c}>
                    {/* Vertical Segment */}
                    <div
                      onClick={() => handleVLineClick(r, c)}
                      className={`w-2.5 h-16 cursor-pointer transition-colors ${
                        vLines[r][c]
                          ? 'bg-blue-500 shadow-[0_0_6px_#3b82f6]'
                          : 'bg-neutral-800 hover:bg-neutral-600'
                      }`}
                    />
                    {/* Box Cell */}
                    {c < GRID_SIZE - 1 && (
                      <div
                        className={`w-16 h-16 flex items-center justify-center font-black text-sm rounded transition-all ${
                          boxes[r][c] === 'P1'
                            ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                            : boxes[r][c] === 'AI'
                            ? 'bg-red-600/30 text-red-400 border border-red-500/40'
                            : 'bg-transparent'
                        }`}
                      >
                        {boxes[r][c]}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Click gray segments between dots to draw lines • Close a 4-sided box to claim a point and get an extra turn
      </div>
    </div>
  )
}
