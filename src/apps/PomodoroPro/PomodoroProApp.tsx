import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Play, Pause, RotateCcw, Coffee, Flame, CheckCircle, Bell } from 'lucide-react'

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak'

const MODE_CONFIG: Record<PomodoroMode, { label: string; duration: number; color: string }> = {
  work: { label: 'Focus Session', duration: 25 * 60, color: 'text-rose-500 border-rose-500' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, color: 'text-emerald-400 border-emerald-400' },
  longBreak: { label: 'Long Break', duration: 15 * 60, color: 'text-blue-400 border-blue-400' },
}

export const PomodoroProApp: React.FC<AppInstanceProps> = () => {
  const [mode, setMode] = useState<PomodoroMode>('work')
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.work.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(3)

  useEffect(() => {
    let interval: any = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false)
      soundService.play('notification')
      if (mode === 'work') {
        setSessionsCompleted((s) => s + 1)
        setMode('shortBreak')
        setTimeLeft(MODE_CONFIG.shortBreak.duration)
      } else {
        setMode('work')
        setTimeLeft(MODE_CONFIG.work.duration)
      }
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, mode])

  const switchMode = (m: PomodoroMode) => {
    soundService.play('buttonClick')
    setIsRunning(false)
    setMode(m)
    setTimeLeft(MODE_CONFIG[m].duration)
  }

  const toggleRun = () => {
    soundService.play('buttonClick')
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    soundService.play('buttonClick')
    setIsRunning(false)
    setTimeLeft(MODE_CONFIG[mode].duration)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentConfig = MODE_CONFIG[mode]
  const progressPercent = ((currentConfig.duration - timeLeft) / currentConfig.duration) * 100

  return (
    <div className="flex flex-col h-full bg-[#16161c] text-neutral-200 font-sans select-none items-center justify-center p-6">
      {/* Mode Selectors */}
      <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 mb-8">
        {(['work', 'shortBreak', 'longBreak'] as PomodoroMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === m
                ? 'bg-white/15 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {MODE_CONFIG[m].label}
          </button>
        ))}
      </div>

      {/* Circular Timer Display */}
      <div className="relative w-64 h-64 rounded-full flex items-center justify-center border-4 border-white/10 shadow-2xl mb-8 bg-black/30">
        <div className="flex flex-col items-center">
          <span className="text-5xl font-mono font-extrabold text-white tracking-wider">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs text-neutral-400 mt-2 uppercase tracking-widest font-semibold">
            {currentConfig.label}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={toggleRun}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 ${
            isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        <button
          onClick={resetTimer}
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-neutral-300 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Telemetry Footer */}
      <div className="flex items-center gap-6 text-xs text-neutral-400 border-t border-white/10 pt-4 w-72 justify-center">
        <div className="flex items-center gap-1.5">
          <Flame size={15} className="text-amber-500" />
          <span>Sessions: {sessionsCompleted}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Bell size={15} className="text-blue-400" />
          <span>Sound Alerts: ON</span>
        </div>
      </div>
    </div>
  )
}
