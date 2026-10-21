import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Layers, RotateCcw, Check, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface Card {
  front: string
  back: string
  category: string
}

const DECKS: Record<string, { name: string; cards: Card[] }> = {
  webdev: {
    name: 'Web Engineering',
    cards: [
      { front: 'What is the purpose of React 19 Actions?', back: 'Actions allow automatic state management for async transitions, form handling, and optimistic UI updates.', category: 'Web' },
      { front: 'How does CSS transform translate3d achieve 60 FPS?', back: 'It prompts the browser compositor to promote the element to a dedicated GPU texture layer, avoiding CPU layout reflows.', category: 'Web' },
      { front: 'What is the Event Loop in JavaScript?', back: 'A single-threaded loop that monitors the Call Stack and Task Queues, executing microtasks (Promises) then macrotasks (Timers).', category: 'Web' },
      { front: 'Why does Vite provide faster HMR than Webpack?', back: 'Vite serves source code over native ESM, leveraging esbuild for pre-bundling dependencies and only compiling files on demand.', category: 'Web' },
    ]
  },
  space: {
    name: 'Cosmic Exploration',
    cards: [
      { front: 'How long does sunlight take to reach Earth?', back: 'Approximately 8 minutes and 20 seconds (499 seconds).', category: 'Science' },
      { front: 'What is the fastest spacecraft launched from Earth?', back: 'The Parker Solar Probe, reaching speeds of over 390,000 mph (630,000 km/h) using Venus gravity assists.', category: 'Science' },
      { front: 'What is an event horizon?', back: 'The boundary surrounding a black hole beyond which nothing, not even light, can escape the gravitational pull.', category: 'Science' },
    ]
  }
}

export const FlashcardsApp: React.FC<AppInstanceProps> = () => {
  const [activeDeckKey, setActiveDeckKey] = useState<string>('webdev')
  const [cardIndex, setCardIndex] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState<boolean>(false)
  const [completedCount, setCompletedCount] = useState<number>(0)

  const activeDeck = DECKS[activeDeckKey] || DECKS.webdev
  const currentCard = activeDeck.cards[cardIndex] || activeDeck.cards[0]
  const totalCards = activeDeck.cards.length

  const handleFlip = () => {
    soundService.playClick()
    setIsFlipped(f => !f)
  }

  const handleNext = () => {
    soundService.playClick()
    setIsFlipped(false)
    setCardIndex(i => (i + 1) % totalCards)
    setCompletedCount(c => c + 1)
  }

  const handlePrev = () => {
    soundService.playClick()
    setIsFlipped(false)
    setCardIndex(i => (i - 1 + totalCards) % totalCards)
  }

  const resetDeck = () => {
    soundService.playClick()
    setIsFlipped(false)
    setCardIndex(0)
    setCompletedCount(0)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Deck Selector */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">Study Flashcards</span>
        </div>

        <div className="flex items-center space-x-2">
          {Object.entries(DECKS).map(([k, d]) => (
            <button
              key={k}
              onClick={() => {
                soundService.playClick()
                setActiveDeckKey(k)
                setCardIndex(0)
                setIsFlipped(false)
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeDeckKey === k ? 'bg-amber-500 text-black font-semibold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        <button onClick={resetDeck} className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white" title="Reset Deck">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-950 h-1">
        <div
          className="bg-amber-400 h-full transition-all duration-300"
          style={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
        />
      </div>

      {/* Main Study Arena */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="text-neutral-400 text-xs font-mono">
          Card {cardIndex + 1} of {totalCards}
        </div>

        {/* 3D Flip Card */}
        <div
          onClick={handleFlip}
          className="w-full max-w-md h-64 cursor-pointer perspective-1000 group"
        >
          <div
            className={`w-full h-full rounded-2xl p-8 flex flex-col justify-between border border-white/10 shadow-2xl transition-all duration-300 transform select-none ${
              isFlipped
                ? 'bg-neutral-800/90 border-amber-500/40 rotate-x-180'
                : 'bg-neutral-950/80 hover:border-white/20'
            }`}
          >
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider">
              <span className="text-amber-400 font-bold">{isFlipped ? 'Answer' : 'Question'}</span>
              <span className="text-neutral-500">Click to flip</span>
            </div>

            <div className="text-center my-auto">
              <p className="text-base font-medium text-white leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            <div className="text-center text-[10px] text-neutral-500">
              {currentCard.category}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleFlip}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-md transition-colors"
          >
            {isFlipped ? 'Show Question' : 'Reveal Answer'}
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
