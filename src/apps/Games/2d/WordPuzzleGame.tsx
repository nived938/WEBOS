import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Delete } from 'lucide-react'

const WORDS = [
  'REACT', 'NOVA', 'VOXEL', 'CLOUD', 'SPEED', 'GAMES', 'LOGIC', 'PIXEL',
  'CYBER', 'SOLAR', 'PRISM', 'EARTH', 'FLASH', 'SPACE', 'TRACK', 'SMART',
  'DREAM', 'QUEST', 'POWER', 'LIGHT',
]

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
]

export const WordPuzzleGame: React.FC<AppInstanceProps> = () => {
  const [targetWord, setTargetWord] = useState<string>(() => WORDS[Math.floor(Math.random() * WORDS.length)].padEnd(5, 'X').slice(0, 5))
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [won, setWon] = useState(false)
  const [lost, setLost] = useState(false)

  const handleChar = (ch: string) => {
    if (won || lost) return
    if (ch === 'DEL') {
      setCurrentGuess((prev) => prev.slice(0, -1))
      soundService.playClick()
    } else if (ch === 'ENTER') {
      if (currentGuess.length === 5) {
        soundService.playClick()
        const newGuesses = [...guesses, currentGuess]
        setGuesses(newGuesses)

        if (currentGuess === targetWord) {
          soundService.playNotification()
          setWon(true)
        } else if (newGuesses.length >= 6) {
          soundService.playTrashEmpty()
          setLost(true)
        }
        setCurrentGuess('')
      }
    } else if (currentGuess.length < 5) {
      soundService.playClick()
      setCurrentGuess((prev) => prev + ch)
    }
  }

  const getLetterStatus = (letter: string, index: number, word: string) => {
    if (targetWord[index] === letter) return 'correct' // Green
    if (targetWord.includes(letter)) return 'present' // Yellow
    return 'absent' // Gray
  }

  const reset = () => {
    soundService.playClick()
    const w = WORDS[Math.floor(Math.random() * WORDS.length)].padEnd(5, 'X').slice(0, 5)
    setTargetWord(w)
    setGuesses([])
    setCurrentGuess('')
    setWon(false)
    setLost(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-white/10">
        <span className="font-bold text-sm text-emerald-400">Lexicon Word Master</span>
        <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 6 Guesses Grid (5 letters each) */}
      <div className="grid grid-rows-6 gap-1.5 my-2">
        {Array(6).fill(0).map((_, rIdx) => {
          const guess = guesses[rIdx] || (rIdx === guesses.length ? currentGuess.padEnd(5, ' ') : '     ')
          const isSubmitted = rIdx < guesses.length

          return (
            <div key={rIdx} className="grid grid-cols-5 gap-1.5">
              {guess.split('').map((ch, cIdx) => {
                let bg = 'bg-neutral-900 border-neutral-700'
                if (isSubmitted) {
                  const status = getLetterStatus(ch, cIdx, guesses[rIdx])
                  if (status === 'correct') bg = 'bg-emerald-600 border-emerald-500 text-white'
                  else if (status === 'present') bg = 'bg-amber-500 border-amber-400 text-white'
                  else bg = 'bg-neutral-700 border-neutral-600 text-neutral-400'
                } else if (ch !== ' ') {
                  bg = 'bg-neutral-800 border-neutral-500'
                }

                return (
                  <div
                    key={cIdx}
                    className={`w-11 h-11 border-2 rounded-lg flex items-center justify-center text-lg font-black transition-colors ${bg}`}
                  >
                    {ch.trim()}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Win / Loss banner */}
      {won && <span className="font-bold text-emerald-400">Splendid! You guessed {targetWord}!</span>}
      {lost && <span className="font-bold text-red-400">Game Over! The word was {targetWord}.</span>}

      {/* Virtual Keyboard */}
      <div className="w-full max-w-md space-y-1">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((k) => (
              <button
                key={k}
                onClick={() => handleChar(k)}
                className={`py-2 rounded-lg font-bold text-[11px] transition-colors ${
                  k === 'ENTER' || k === 'DEL'
                    ? 'px-2.5 bg-neutral-700 hover:bg-neutral-600 text-white'
                    : 'w-7 sm:w-8 bg-neutral-800 hover:bg-neutral-700 text-white'
                }`}
              >
                {k === 'DEL' ? <Delete className="w-3.5 h-3.5 mx-auto" /> : k}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
