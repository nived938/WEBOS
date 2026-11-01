import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Keyboard, RotateCcw, Award } from 'lucide-react'

const LESSON_TEXT =
  'The quick brown fox jumps over the lazy dog while the NOVA OS optical compositor renders liquid glass refraction shaders with zero frame loss.'

export const TypingTrainerApp: React.FC<AppInstanceProps> = () => {
  const [userInput, setUserInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setUserInput(val)

    if (!startTime) {
      setStartTime(Date.now())
    }

    // Calculate accuracy
    let correct = 0
    for (let i = 0; i < val.length; i++) {
      if (val[i] === LESSON_TEXT[i]) correct++
    }
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100
    setAccuracy(acc)

    // Calculate WPM
    if (startTime) {
      const elapsedMinutes = (Date.now() - startTime) / 60000
      if (elapsedMinutes > 0.05) {
        const words = val.length / 5
        setWpm(Math.round(words / elapsedMinutes))
      }
    }
  }

  const restartLesson = () => {
    soundService.play('buttonClick')
    setUserInput('')
    setStartTime(null)
    setWpm(0)
    setAccuracy(100)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden items-center justify-center p-6">
      <div className="w-full max-w-xl bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white">Typing Speed & Accuracy Trainer</h2>
          </div>
          <button
            onClick={restartLesson}
            className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white"
            title="Restart"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Live Metrics Header */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
              Typing Speed
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-400">{wpm} WPM</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
              Accuracy
            </span>
            <span className="text-2xl font-mono font-bold text-blue-400">{accuracy}%</span>
          </div>
        </div>

        {/* Text Prompt */}
        <div className="bg-black/60 border border-white/10 p-4 rounded-xl text-sm font-mono leading-relaxed select-none">
          {LESSON_TEXT.split('').map((char, idx) => {
            let color = 'text-neutral-500'
            if (idx < userInput.length) {
              color = userInput[idx] === char ? 'text-emerald-400' : 'text-red-400 bg-red-500/20'
            }
            return (
              <span key={idx} className={color}>
                {char}
              </span>
            )
          })}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Start typing the text above..."
          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
          autoFocus
        />
      </div>
    </div>
  )
}
