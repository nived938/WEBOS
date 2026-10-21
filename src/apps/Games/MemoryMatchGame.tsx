import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { RotateCcw, Trophy, Award, Sparkles } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

const ICONS = ['🚀', '🛸', '🎮', '💎', '⚡', '🌟', '👾', '🎯']

interface Card {
  id: number
  icon: string
  isFlipped: boolean
  isMatched: boolean
}

export const MemoryMatchGame: React.FC<AppInstanceProps> = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [isWon, setIsWon] = useState(false)

  const shuffleDeck = () => {
    soundService.playClick()
    const pairList = [...ICONS, ...ICONS]
    const shuffled = pairList
      .sort(() => Math.random() - 0.5)
      .map((icon, id) => ({
        id,
        icon,
        isFlipped: false,
        isMatched: false
      }))
    setCards(shuffled)
    setFlippedIndices([])
    setMoves(0)
    setMatches(0)
    setIsWon(false)
  }

  useEffect(() => {
    shuffleDeck()
  }, [])

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2) return
    const card = cards[index]
    if (card.isFlipped || card.isMatched) return

    soundService.playClick()
    const newCards = [...cards]
    newCards[index].isFlipped = true
    setCards(newCards)

    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const firstCard = cards[newFlipped[0]]
      const secondCard = cards[newFlipped[1]]

      if (firstCard.icon === secondCard.icon) {
        // Matched!
        soundService.playNotification()
        setTimeout(() => {
          setCards(prev =>
            prev.map((c, i) =>
              i === newFlipped[0] || i === newFlipped[1]
                ? { ...c, isMatched: true }
                : c
            )
          )
          setFlippedIndices([])
          setMatches(m => {
            const next = m + 1
            if (next === ICONS.length) setIsWon(true)
            return next
          })
        }, 500)
      } else {
        // Mismatch flip back
        setTimeout(() => {
          setCards(prev =>
            prev.map((c, i) =>
              i === newFlipped[0] || i === newFlipped[1]
                ? { ...c, isFlipped: false }
                : c
            )
          )
          setFlippedIndices([])
        }, 800)
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3 font-mono">
          <span className="font-bold text-white">Moves: {moves}</span>
          <span className="text-neutral-500">•</span>
          <span className="text-emerald-400 font-bold">Matches: {matches} / {ICONS.length}</span>
        </div>

        <button onClick={shuffleDeck} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4x4 Cards Grid */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-neutral-950 relative">
        <div className="grid grid-cols-4 gap-3 w-72 h-72">
          {cards.map((card, idx) => {
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(idx)}
                className={`rounded-xl border flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 select-none ${
                  card.isFlipped || card.isMatched
                    ? 'bg-neutral-800 border-white/20 scale-105'
                    : 'bg-neutral-900 hover:bg-neutral-800/80 border-white/10'
                }`}
              >
                {card.isFlipped || card.isMatched ? card.icon : '✨'}
              </div>
            )
          })}
        </div>

        {isWon && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-10">
            <Award className="w-12 h-12 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">ALL MATCHES FOUND!</h2>
            <p className="text-neutral-300">Completed in <strong className="text-amber-400">{moves} moves</strong></p>
            <button
              onClick={shuffleDeck}
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
