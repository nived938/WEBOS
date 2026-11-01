import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Timer, Play, Pause, RotateCcw, Flag } from 'lucide-react'

interface Lap {
  index: number
  time: number
  split: number
}

export const StopwatchApp: React.FC<AppInstanceProps> = () => {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])

  useEffect(() => {
    let interval: any = null
    if (isRunning) {
      interval = setInterval(() => {
        setTime((t) => t + 10)
      }, 10)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const toggleRun = () => {
    soundService.play('buttonClick')
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    soundService.play('buttonClick')
    setIsRunning(false)
    setTime(0)
    setLaps([])
  }

  const handleLap = () => {
    if (!isRunning) return
    soundService.play('buttonClick')
    const lastLapTime = laps.length > 0 ? laps[0].time : 0
    const newLap: Lap = {
      index: laps.length + 1,
      time,
      split: time - lastLapTime,
    }
    setLaps([newLap, ...laps])
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = Math.floor((ms % 1000) / 10)
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden items-center justify-center p-6">
      <div className="w-full max-w-sm bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
          <Timer size={16} className="text-emerald-400" />
          <span>PRECISION STOPWATCH</span>
        </div>

        {/* Digital readout */}
        <div className="text-4xl font-mono font-bold text-white tracking-widest">
          {formatTime(time)}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleRun}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all ${
              isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <button
            onClick={handleLap}
            disabled={!isRunning}
            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 disabled:opacity-30 text-white flex items-center justify-center transition-colors"
            title="Lap"
          >
            <Flag size={18} />
          </button>
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 text-neutral-300 flex items-center justify-center transition-colors"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Laps List */}
        {laps.length > 0 && (
          <div className="w-full max-h-40 overflow-y-auto divide-y divide-white/5 border-t border-white/10 pt-3">
            {laps.map((lap) => (
              <div key={lap.index} className="flex justify-between py-1.5 text-xs font-mono">
                <span className="text-neutral-400">Lap {lap.index}</span>
                <span className="text-neutral-300">+{formatTime(lap.split)}</span>
                <span className="text-white font-semibold">{formatTime(lap.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
