import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Languages, Volume2, Check, X, RotateCcw } from 'lucide-react'

interface Flashcard {
  foreign: string
  translation: string
  language: string
  options: string[]
}

const CARDS: Flashcard[] = [
  { foreign: 'Hola Mundo', translation: 'Hello World', language: 'Spanish', options: ['Hello World', 'Goodbye Friend', 'Good Morning', 'Thank You'] },
  { foreign: 'Bonjour le monde', translation: 'Hello World', language: 'French', options: ['Good Night', 'Hello World', 'See You Soon', 'Please'] },
  { foreign: 'こんにちは世界', translation: 'Hello World', language: 'Japanese', options: ['Good Afternoon', 'Thank You Very Much', 'Hello World', 'Welcome'] },
  { foreign: 'Guten Tag', translation: 'Good Day', language: 'German', options: ['Good Night', 'Good Day', 'See You Later', 'Excuse Me'] },
]

export const LanguageLearningApp: React.FC<AppInstanceProps> = () => {
  const [cardIndex, setCardIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const card = CARDS[cardIndex]

  const handleSelectOption = (opt: string) => {
    soundService.play('buttonClick')
    setSelectedOption(opt)
    if (opt === card.translation) {
      setScore((s) => s + 10)
    }
  }

  const handleNext = () => {
    soundService.play('buttonClick')
    setSelectedOption(null)
    setCardIndex((c) => (c + 1) % CARDS.length)
  }

  const speak = (text: string) => {
    soundService.play('buttonClick')
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden items-center justify-center p-6">
      <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Languages size={18} className="text-pink-400" />
            <h2 className="text-sm font-bold text-white">Polyglot Language Studio</h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">Score: {score}</span>
        </div>

        {/* Card Front */}
        <div className="bg-gradient-to-tr from-purple-900/40 to-pink-900/40 border border-white/15 p-8 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-lg">
          <span className="text-[10px] uppercase font-mono tracking-widest text-pink-300">
            {card.language}
          </span>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-white">{card.foreign}</h3>
            <button
              onClick={() => speak(card.foreign)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white"
              title="Pronounce"
            >
              <Volume2 size={18} />
            </button>
          </div>
        </div>

        {/* Multiple Choice Options */}
        <div className="grid grid-cols-2 gap-2.5">
          {card.options.map((opt) => {
            const isChosen = selectedOption === opt
            const isCorrect = opt === card.translation
            let btnClass = 'bg-white/5 hover:bg-white/10 text-neutral-200'

            if (selectedOption) {
              if (isCorrect) btnClass = 'bg-emerald-600 text-white'
              else if (isChosen) btnClass = 'bg-red-600 text-white'
            }

            return (
              <button
                key={opt}
                onClick={() => !selectedOption && handleSelectOption(opt)}
                className={`p-3 rounded-xl text-xs font-medium transition-colors ${btnClass}`}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {/* Next Card Button */}
        {selectedOption && (
          <button
            onClick={handleNext}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow"
          >
            Next Flashcard &rarr;
          </button>
        )}
      </div>
    </div>
  )
}
