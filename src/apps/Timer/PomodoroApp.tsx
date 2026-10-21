import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Play, Pause, RotateCcw, SkipForward, Coffee, Flame } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

type TimerMode = 'pomodoro' | 'short' | 'long'

const MODES = {
  pomodoro: { label: 'Focus', minutes: 25 },
  short: { label: 'Short Break', minutes: 5 },
  long: { label: 'Long Break', minutes: 15 }
}

export const PomodoroApp: React.FC<AppInstanceProps> = () => {
  const [mode, setMode] = useState<TimerMode>('pomodoro')
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    let interval: any
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      soundService.playNotification()
      setIsRunning(false)
      if (mode === 'pomodoro') {
        setCycles(c => c + 1)
        setMode('short')
        setTimeLeft(MODES.short.minutes * 60)
      } else {
        setMode('pomodoro')
        setTimeLeft(MODES.pomodoro.minutes * 60)
      }
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, mode])

  const toggleTimer = () => {
    soundService.playClick()
    setIsRunning(r => !r)
  }

  const resetTimer = () => {
    soundService.playClick()
    setIsRunning(false)
    setTimeLeft(MODES[mode].minutes * 60)
  }

  const switchMode = (m: TimerMode) => {
    soundService.playClick()
    setIsRunning(false)
    setMode(m)
    setTimeLeft(MODES[m].minutes * 60)
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const totalDuration = MODES[mode].minutes * 60
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Mode Tabs */}
      <div className="flex items-center justify-center p-3 bg-neutral-800/80 border-b border-white/10">
        <div className="flex bg-neutral-950 p-1 rounded-xl border border-white/10 space-x-1">
          {(['pomodoro', 'short', 'long'] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mode === m
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dial View */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Circular progress SVG */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="90"
              className="text-neutral-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="112"
              cy="112"
              r="90"
              className="text-rose-500 transition-all duration-300"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 90}
              strokeDashoffset={2 * Math.PI * 90 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-mono font-light text-white tracking-tight">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[11px] text-neutral-400 mt-1 uppercase font-semibold">
              {MODES[mode].label}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={resetTimer}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className="px-8 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-900/40 active:scale-95 transition-all"
          >
            {isRunning ? 'PAUSE' : 'START'}
          </button>

          <button
            onClick={() => {
              soundService.playClick()
              setTimeLeft(0)
            }}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title="Skip to next"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Cycles Counter */}
        <div className="flex items-center space-x-2 text-xs text-neutral-400 pt-2">
          <Flame className="w-4 h-4 text-rose-500" />
          <span>Completed Focus Cycles: <strong className="text-white">{cycles}</strong></span>
        </div>
      </div>
    </div>
  )
}
