import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Sparkles, Shuffle } from 'lucide-react'

interface MahjongTile {
  id: number
  symbol: string
  type: string
  layer: number
  x: number
  y: number
  isRemoved: boolean
}

const TILE_SYMBOLS = ['🀀', '🀁', '🀂', '🀃', '🀄', '🀅', '🀆', '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏', '🀐', '🀑']

export const MahjongGame: React.FC<AppInstanceProps> = () => {
  const [tiles, setTiles] = useState<MahjongTile[]>([])
  const [selectedTile, setSelectedTile] = useState<MahjongTile | null>(null)
  const [score, setScore] = useState(0)
  const [remainingPairs, setRemainingPairs] = useState(18)

  const initBoard = () => {
    soundService.playClick()
    const newTiles: MahjongTile[] = []
    let id = 0

    // Create 18 pairs (36 tiles total)
    const symbolsToUse: string[] = []
    for (const sym of TILE_SYMBOLS) {
      symbolsToUse.push(sym, sym)
    }

    // Shuffle symbols
    for (let i = symbolsToUse.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[symbolsToUse[i], symbolsToUse[j]] = [symbolsToUse[j], symbolsToUse[i]]
    }

    // Form 6x6 grid with 2 layers
    let symIdx = 0
    // Layer 0: 6x4 = 24 tiles
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        newTiles.push({
          id: id++,
          symbol: symbolsToUse[symIdx++],
          type: 'standard',
          layer: 0,
          x: c,
          y: r,
          isRemoved: false,
        })
      }
    }

    // Layer 1: 4x3 = 12 tiles
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        newTiles.push({
          id: id++,
          symbol: symbolsToUse[symIdx++],
          type: 'standard',
          layer: 1,
          x: c + 1,
          y: r + 0.5,
          isRemoved: false,
        })
      }
    }

    setTiles(newTiles)
    setSelectedTile(null)
    setScore(0)
    setRemainingPairs(18)
  }

  useEffect(() => {
    initBoard()
  }, [])

  // Check if tile is free (no tile on top of it, and free on either left or right)
  const isTileFree = (tile: MahjongTile): boolean => {
    if (tile.isRemoved) return false

    // Check layer above
    const tileAbove = tiles.some(
      (t) =>
        !t.isRemoved &&
        t.layer > tile.layer &&
        Math.abs(t.x - tile.x) < 0.9 &&
        Math.abs(t.y - tile.y) < 0.9
    )
    if (tileAbove) return false

    // Check left and right blocked in same layer
    const leftBlocked = tiles.some(
      (t) =>
        !t.isRemoved &&
        t.layer === tile.layer &&
        Math.abs(t.y - tile.y) < 0.5 &&
        t.x === tile.x - 1
    )
    const rightBlocked = tiles.some(
      (t) =>
        !t.isRemoved &&
        t.layer === tile.layer &&
        Math.abs(t.y - tile.y) < 0.5 &&
        t.x === tile.x + 1
    )

    return !leftBlocked || !rightBlocked
  }

  const handleTileClick = (tile: MahjongTile) => {
    if (!isTileFree(tile)) return

    if (selectedTile) {
      if (selectedTile.id === tile.id) {
        setSelectedTile(null)
        return
      }

      if (selectedTile.symbol === tile.symbol) {
        // Match!
        soundService.playNotification()
        setTiles((prev) =>
          prev.map((t) =>
            t.id === tile.id || t.id === selectedTile.id
              ? { ...t, isRemoved: true }
              : t
          )
        )
        setScore((s) => s + 50)
        setRemainingPairs((r) => r - 1)
        setSelectedTile(null)
      } else {
        soundService.playClick()
        setSelectedTile(tile)
      }
    } else {
      soundService.playClick()
      setSelectedTile(tile)
    }
  }

  const shuffleTiles = () => {
    soundService.playClick()
    const active = tiles.filter((t) => !t.isRemoved)
    const activeSymbols = active.map((t) => t.symbol)

    for (let i = activeSymbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[activeSymbols[i], activeSymbols[j]] = [activeSymbols[j], activeSymbols[i]]
    }

    let idx = 0
    setTiles((prev) =>
      prev.map((t) => {
        if (!t.isRemoved) {
          return { ...t, symbol: activeSymbols[idx++] }
        }
        return t
      })
    )
    setSelectedTile(null)
  }

  return (
    <div className="flex flex-col h-full bg-[#1e293b] text-white select-none p-4 text-xs items-center justify-between">
      {/* Top Bar */}
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-amber-300">Mahjong Solitaire</span>
          <span className="text-neutral-400">Score: {score}</span>
          <span className="text-neutral-400">Pairs: {remainingPairs}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={shuffleTiles}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-1"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
          <button onClick={initBoard} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mahjong Board */}
      <div className="relative w-80 h-72 sm:w-96 sm:h-80 bg-emerald-950/40 border-2 border-amber-900/50 rounded-2xl p-4 shadow-2xl overflow-hidden flex items-center justify-center">
        {tiles.map((tile) => {
          if (tile.isRemoved) return null
          const free = isTileFree(tile)
          const isSelected = selectedTile?.id === tile.id

          return (
            <div
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              style={{
                left: `${tile.x * 50 + 20 + tile.layer * 4}px`,
                top: `${tile.y * 60 + 20 - tile.layer * 4}px`,
                zIndex: tile.layer * 10 + 1,
              }}
              className={`absolute w-11 h-14 rounded-lg flex items-center justify-center text-3xl font-bold shadow-xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-300 border-amber-500 scale-105 shadow-amber-400/50'
                  : free
                  ? 'bg-[#fef9c3] border-amber-300 text-neutral-900 hover:scale-105'
                  : 'bg-neutral-600/70 border-neutral-700 text-neutral-400 opacity-60 cursor-not-allowed'
              }`}
            >
              <span className="drop-shadow-sm select-none">{tile.symbol}</span>
            </div>
          )
        })}

        {remainingPairs === 0 && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-2xl z-50">
            <Trophy className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
            <h2 className="text-lg font-bold text-white">Board Cleared!</h2>
            <p className="text-neutral-400 text-xs mb-3">Total Score: {score}</p>
            <button
              onClick={initBoard}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 font-bold text-black rounded-lg"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        Match identical free tiles (uncovered with at least one free edge)
      </div>
    </div>
  )
}
