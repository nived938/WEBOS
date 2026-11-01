import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, RefreshCw } from 'lucide-react'

type Suit = '♠' | '♥' | '♦' | '♣'
type CardColor = 'red' | 'black'

interface Card {
  suit: Suit
  value: number // 1 (Ace) to 13 (King)
  color: CardColor
  faceUp: boolean
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
const CARD_LABELS: Record<number, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K',
}

function createDeck(): Card[] {
  const deck: Card[] = []
  for (const s of SUITS) {
    for (let v = 1; v <= 13; v++) {
      deck.push({
        suit: s,
        value: v,
        color: s === '♥' || s === '♦' ? 'red' : 'black',
        faceUp: false,
      })
    }
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export const SolitaireGame: React.FC<AppInstanceProps> = () => {
  const [deck, setDeck] = useState<Card[]>([])
  const [waste, setWaste] = useState<Card[]>([])
  const [foundations, setFoundations] = useState<Card[][]>([[], [], [], []])
  const [tableau, setTableau] = useState<Card[][]>([[], [], [], [], [], [], []])
  const [selected, setSelected] = useState<{ source: 'waste' | 'tableau'; tCol?: number; cardIdx?: number; card: Card } | null>(null)
  const [score, setScore] = useState(0)

  const initGame = () => {
    soundService.playClick()
    const fullDeck = createDeck()
    const tabs: Card[][] = [[], [], [], [], [], [], []]

    for (let col = 0; col < 7; col++) {
      for (let i = 0; i <= col; i++) {
        const c = fullDeck.pop()!
        if (i === col) c.faceUp = true
        tabs[col].push(c)
      }
    }

    setTableau(tabs)
    setWaste([])
    setFoundations([[], [], [], []])
    setDeck(fullDeck)
    setSelected(null)
    setScore(0)
  }

  useEffect(() => {
    initGame()
  }, [])

  // Draw card from stock deck to waste pile
  const handleStockClick = () => {
    soundService.playClick()
    if (deck.length === 0) {
      if (waste.length === 0) return
      // Recycle waste to deck
      const newDeck = waste.map((c) => ({ ...c, faceUp: false })).reverse()
      setDeck(newDeck)
      setWaste([])
    } else {
      const drawn = deck[deck.length - 1]
      drawn.faceUp = true
      setWaste((w) => [...w, drawn])
      setDeck((d) => d.slice(0, d.length - 1))
    }
    setSelected(null)
  }

  // Handle Foundation click (attempt placing selected card on foundation)
  const handleFoundationClick = (fIdx: number) => {
    if (!selected) return
    const targetPile = foundations[fIdx]
    const c = selected.card

    let canPlace = false
    if (targetPile.length === 0 && c.value === 1) canPlace = true
    else if (targetPile.length > 0) {
      const top = targetPile[targetPile.length - 1]
      if (top.suit === c.suit && c.value === top.value + 1) canPlace = true
    }

    if (canPlace) {
      soundService.playNotification()
      setFoundations((prev) => {
        const next = prev.map((p) => [...p])
        next[fIdx].push(c)
        return next
      })

      // Remove from source
      if (selected.source === 'waste') {
        setWaste((w) => w.slice(0, w.length - 1))
      } else if (selected.source === 'tableau' && selected.tCol !== undefined) {
        setTableau((prev) => {
          const next = prev.map((col) => [...col])
          next[selected.tCol!].pop()
          if (next[selected.tCol!].length > 0) {
            next[selected.tCol!][next[selected.tCol!].length - 1].faceUp = true
          }
          return next
        })
      }
      setScore((s) => s + 10)
      setSelected(null)
    }
  }

  // Handle Tableau column click
  const handleTableauClick = (colIdx: number) => {
    const col = tableau[colIdx]

    if (selected) {
      // Trying to move selected onto this column
      const movingCard = selected.card
      let valid = false

      if (col.length === 0) {
        if (movingCard.value === 13) valid = true // King on empty
      } else {
        const top = col[col.length - 1]
        if (top.color !== movingCard.color && top.value === movingCard.value + 1) {
          valid = true
        }
      }

      if (valid) {
        soundService.playClick()
        if (selected.source === 'waste') {
          setTableau((prev) => {
            const next = prev.map((c) => [...c])
            next[colIdx].push(movingCard)
            return next
          })
          setWaste((w) => w.slice(0, w.length - 1))
        } else if (selected.source === 'tableau' && selected.tCol !== undefined && selected.cardIdx !== undefined) {
          const sourceCol = tableau[selected.tCol]
          const cardsToMove = sourceCol.slice(selected.cardIdx)

          setTableau((prev) => {
            const next = prev.map((c) => [...c])
            next[selected.tCol!] = next[selected.tCol!].slice(0, selected.cardIdx)
            if (next[selected.tCol!].length > 0) {
              next[selected.tCol!][next[selected.tCol!].length - 1].faceUp = true
            }
            next[colIdx].push(...cardsToMove)
            return next
          })
        }
        setScore((s) => s + 5)
        setSelected(null)
        return
      }
    }

    // Select top card if not already selected
    if (col.length > 0) {
      const top = col[col.length - 1]
      if (top.faceUp) {
        setSelected({ source: 'tableau', tCol: colIdx, cardIdx: col.length - 1, card: top })
        soundService.playClick()
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1b4332] text-white select-none p-4 text-xs">
      {/* Top Controls */}
      <div className="flex justify-between items-center bg-black/30 p-2.5 rounded-xl border border-white/10 mb-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-emerald-300">Klondike Solitaire</span>
          <span className="text-neutral-300">Score: {score}</span>
        </div>
        <button onClick={initGame} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-1.5 font-medium">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Game</span>
        </button>
      </div>

      {/* Stock & Foundations Row */}
      <div className="flex justify-between items-start mb-6">
        {/* Left: Stock & Waste */}
        <div className="flex gap-3">
          {/* Stock */}
          <div
            onClick={handleStockClick}
            className="w-16 h-24 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer bg-emerald-900/50 hover:bg-emerald-800/50 shadow-md"
          >
            {deck.length > 0 ? (
              <div className="w-full h-full rounded-md bg-blue-800 border-2 border-white/60 flex items-center justify-center text-lg font-bold text-blue-200">
                🂠
              </div>
            ) : (
              <RotateCcw className="w-5 h-5 text-white/50" />
            )}
          </div>

          {/* Waste */}
          <div
            onClick={() => {
              if (waste.length > 0) {
                setSelected({ source: 'waste', card: waste[waste.length - 1] })
                soundService.playClick()
              }
            }}
            className={`w-16 h-24 rounded-lg border-2 flex items-center justify-center cursor-pointer shadow-md ${
              selected?.source === 'waste' ? 'border-amber-400 scale-105' : 'border-white/20 bg-emerald-900/30'
            }`}
          >
            {waste.length > 0 && (
              <div className="w-full h-full bg-white rounded-md p-1.5 flex flex-col justify-between text-neutral-900 shadow">
                <span className={`font-bold ${waste[waste.length - 1].color === 'red' ? 'text-red-600' : 'text-black'}`}>
                  {CARD_LABELS[waste[waste.length - 1].value]} {waste[waste.length - 1].suit}
                </span>
                <span className="text-xl self-center leading-none">{waste[waste.length - 1].suit}</span>
                <span className={`font-bold self-end ${waste[waste.length - 1].color === 'red' ? 'text-red-600' : 'text-black'}`}>
                  {CARD_LABELS[waste[waste.length - 1].value]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: 4 Foundation Piles */}
        <div className="flex gap-2">
          {foundations.map((pile, idx) => (
            <div
              key={idx}
              onClick={() => handleFoundationClick(idx)}
              className="w-16 h-24 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer bg-emerald-900/40 hover:bg-emerald-800/40 shadow-md"
            >
              {pile.length > 0 ? (
                <div className="w-full h-full bg-white rounded-md p-1.5 flex flex-col justify-between text-neutral-900 shadow">
                  <span className={`font-bold ${pile[pile.length - 1].color === 'red' ? 'text-red-600' : 'text-black'}`}>
                    {CARD_LABELS[pile[pile.length - 1].value]} {pile[pile.length - 1].suit}
                  </span>
                  <span className="text-xl self-center">{pile[pile.length - 1].suit}</span>
                  <span className={`font-bold self-end ${pile[pile.length - 1].color === 'red' ? 'text-red-600' : 'text-black'}`}>
                    {CARD_LABELS[pile[pile.length - 1].value]}
                  </span>
                </div>
              ) : (
                <span className="text-lg opacity-30">{['♠', '♥', '♦', '♣'][idx]}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 7 Tableau Columns */}
      <div className="flex-1 grid grid-cols-7 gap-2 overflow-visible">
        {tableau.map((col, colIdx) => (
          <div
            key={colIdx}
            onClick={() => handleTableauClick(colIdx)}
            className="min-h-[140px] rounded-lg border border-white/10 bg-emerald-950/20 p-1 relative flex flex-col cursor-pointer"
          >
            {col.map((card, cIdx) => (
              <div
                key={cIdx}
                className={`w-full h-20 rounded-md p-1.5 flex flex-col justify-between shadow-md transition-all ${
                  cIdx > 0 ? '-mt-12' : ''
                } ${
                  card.faceUp
                    ? selected?.card === card
                      ? 'bg-amber-100 border-2 border-amber-500 scale-105'
                      : 'bg-white border border-neutral-300'
                    : 'bg-blue-800 border border-white/40'
                }`}
              >
                {card.faceUp ? (
                  <>
                    <span className={`font-bold text-[11px] leading-none ${card.color === 'red' ? 'text-red-600' : 'text-black'}`}>
                      {CARD_LABELS[card.value]} {card.suit}
                    </span>
                    <span className="text-base self-center leading-none">{card.suit}</span>
                    <span className={`font-bold text-[11px] self-end leading-none ${card.color === 'red' ? 'text-red-600' : 'text-black'}`}>
                      {CARD_LABELS[card.value]}
                    </span>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-300 opacity-60">
                    ★
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
