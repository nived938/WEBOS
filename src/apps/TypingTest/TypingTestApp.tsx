import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Keyboard, RotateCcw, Award, Zap, Timer } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

const PROMPTS = [
  "Nova Operating System brings modern desktop computing directly into the browser with fluid animations and responsive glassmorphism.",
  "Computer architecture revolves around the harmonious synergy of processor scheduling, memory caching, and graphics rendering pipelines.",
  "WebAssembly empowers developers to execute compiled C and Rust code at near-native speeds across every modern client platform."
]

export const TypingTestApp: React.FC<AppInstanceProps> = () => {
  const [promptIndex, setPromptIndex] = useState(0)
  const targetText = PROMPTS[promptIndex]
  const [input, setInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [isFinished, setIsFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let timer: any
    if (startTime && !isFinished) {
      timer = setInterval(() => {
        const sec = Math.max(1, (Date.now() - startTime) / 1000)
        setElapsedSeconds(Math.floor(sec))

        // Calculate WPM: (characters typed / 5) / (seconds / 60)
        const wordsTyped = input.length / 5
        const currentWpm = Math.round((wordsTyped / sec) * 60)
        setWpm(currentWpm)

        // Calculate accuracy
        let correctChars = 0
        for (let i = 0; i < input.length; i++) {
          if (input[i] === targetText[i]) correctChars++
        }
        const acc = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100
        setAccuracy(acc)
      }, 200)
    }
    return () => clearInterval(timer)
  }, [startTime, input, isFinished, targetText])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!startTime) setStartTime(Date.now())
    soundService.playClick()
    setInput(val)

    if (val.length >= targetText.length) {
      setIsFinished(true)
      soundService.playNotification()
    }
  }

  const handleReset = () => {
    soundService.playClick()
    setInput('')
    setStartTime(null)
    setElapsedSeconds(0)
    setWpm(0)
    setAccuracy(100)
    setIsFinished(false)
    setPromptIndex(p => (p + 1) % PROMPTS.length)
    inputRef.current?.focus()
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs"
    >
      {/* Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Keyboard className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">Typing Speed Studio</span>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Prompt</span>
        </button>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-950/60 border-b border-white/5 max-w-lg mx-auto w-full text-center">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Words / Min</div>
          <div className="text-3xl font-mono font-bold text-emerald-400">{wpm}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Accuracy</div>
          <div className="text-3xl font-mono font-bold text-sky-400">{accuracy}%</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Time</div>
          <div className="text-3xl font-mono font-bold text-amber-400">{elapsedSeconds}s</div>
        </div>
      </div>

      {/* Target Text & Live Typing Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full">
        <div className="text-lg leading-relaxed font-mono p-6 bg-neutral-950/80 rounded-2xl border border-white/10 shadow-2xl relative w-full">
          {targetText.split('').map((char, index) => {
            let color = 'text-neutral-500'
            let bg = ''

            if (index < input.length) {
              if (input[index] === char) {
                color = 'text-emerald-400'
              } else {
                color = 'text-rose-400'
                bg = 'bg-rose-500/20'
              }
            } else if (index === input.length) {
              bg = 'bg-blue-500/30 text-white animate-pulse'
            }

            return (
              <span key={index} className={`${color} ${bg} rounded-xs`}>
                {char}
              </span>
            )
          })}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          disabled={isFinished}
          className="opacity-0 absolute -z-10"
          autoFocus
        />

        <div className="text-xs text-neutral-400 mt-4 text-center">
          {isFinished ? (
            <div className="text-emerald-400 font-semibold flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Test Complete! Final Speed: {wpm} WPM with {accuracy}% Accuracy.</span>
            </div>
          ) : (
            <span>Click anywhere and start typing to begin test...</span>
          )}
        </div>
      </div>
    </div>
  )
}
