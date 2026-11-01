import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Sparkles } from 'lucide-react'

const PAD_COLORS = [
  { id: 0, activeBg: 'bg-emerald-400', idleBg: 'bg-emerald-700', label: 'Green' },
  { id: 1, activeBg: 'bg-red-400', idleBg: 'bg-red-700', label: 'Red' },
  { id: 2, activeBg: 'bg-amber-400', idleBg: 'bg-amber-700', label: 'Yellow' },
  { id: 3, activeBg: 'bg-blue-400', idleBg: 'bg-blue-700', label: 'Blue' },
]

export const MemoryChallengeGame: React.FC<AppInstanceProps> = () => {
  const [sequence, setSequence] = useState<number[]>([])
  const [playerStep, setPlayerStep] = useState(0)
  const [activePad, setActivePad] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const playSequence = (seq: number[]) => {
    setIsShowingSequence(true)
    let idx = 0

    const timer = setInterval(() => {
      if (idx >= seq.length) {
        clearInterval(timer)
        setActivePad(null)
        setIsShowingSequence(false)
        return
      }

      const padId = seq[idx]
      setActivePad(padId)
      soundService.playClick()

      setTimeout(() => {
        setActivePad(null)
      }, 350)

      idx++
    }, 600)
  }

  const startNextRound = (currentSeq: number[]) => {
    const nextPad = Math.floor(Math.random() * 4)
    const nextSeq = [...currentSeq, nextPad]
    setSequence(nextSeq)
    setPlayerStep(0)
    playSequence(nextSeq)
  }

  const startGame = () => {
    soundService.playStartup()
    setScore(0)
    setGameOver(false)
    startNextRound([])
  }

  useEffect(() => {
    startGame()
  }, [])

  const handlePadClick = (padId: number) => {
    if (isShowingSequence || gameOver) return

    soundService.playClick()
    setActivePad(padId)
    setTimeout(() => setActivePad(null), 250)

    if (sequence[playerStep] === padId) {
      // Correct step
      const nextStep = playerStep + 1
      if (nextStep === sequence.length) {
        // Round passed!
        soundService.playNotification()
        const newScore = score + 1
        setScore(newScore)
        if (newScore > highScore) setHighScore(newScore)
        setTimeout(() => startNextRound(sequence), 800)
      } else {
        setPlayerStep(nextStep)
      }
    } else {
      // Failed sequence
      soundService.playTrashEmpty()
      setGameOver(true)
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-xs flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-bold">Sequence Length: {score}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-400">High: {highScore}</span>
          <button onClick={startGame} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Quadrants Circle */}
      <div className="relative w-64 h-64 rounded-full bg-neutral-900 p-3 border-4 border-white/20 shadow-2xl flex items-center justify-center">
        <div className="grid grid-cols-2 gap-3 w-full h-full">
          {PAD_COLORS.map((pad) => {
            const isActive = activePad === pad.id
            return (
              <button
                key={pad.id}
                onClick={() => handlePadClick(pad.id)}
                className={`rounded-2xl transition-all shadow-lg active:scale-95 ${
                  isActive ? `${pad.activeBg} scale-95 shadow-[0_0_20px_white]` : pad.idleBg
                }`}
              />
            )
          })}
        </div>

        {/* Center hub */}
        <div className="absolute w-20 h-20 rounded-full bg-neutral-950 border-4 border-white/15 flex flex-col items-center justify-center text-center shadow-xl">
          <span className="text-[9px] font-bold text-neutral-400">ECHO</span>
          <span className="text-base font-black text-white leading-none">{score}</span>
        </div>

        {gameOver && (
          <div className="absolute inset-0 rounded-full bg-black/85 flex flex-col items-center justify-center z-20">
            <h3 className="text-sm font-bold text-red-500 mb-1">Pattern Missed!</h3>
            <p className="text-neutral-400 text-[10px] mb-2">Score: {score}</p>
            <button
              onClick={startGame}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 font-bold text-white rounded-lg shadow text-[10px]"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        {isShowingSequence ? 'Watch the sequence carefully...' : 'Your turn! Tap the pads in exact order'}
      </div>
    </div>
  )
}
