import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Clock as ClockIcon, Timer as TimerIcon, Play, Pause, RotateCcw, Flag } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

export const ClockApp: React.FC<AppInstanceProps> = () => {
  const [activeTab, setActiveTab] = useState<'world' | 'stopwatch'>('world')
  const [now, setNow] = useState(new Date())

  // Stopwatch state
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [laps, setLaps] = useState<number[]>([])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let interval: any
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime(t => t + 10)
      }, 10)
    }
    return () => clearInterval(interval)
  }, [stopwatchRunning])

  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    const millis = Math.floor((ms % 1000) / 10)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`
  }

  const getTimeInZone = (tz: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(now)
  }

  const worldCities = [
    { name: 'Cupertino / Local', tz: 'America/Los_Angeles', diff: 'Local Time' },
    { name: 'New York', tz: 'America/New_York', diff: '+3 HRS' },
    { name: 'London', tz: 'Europe/London', diff: '+8 HRS' },
    { name: 'Tokyo', tz: 'Asia/Tokyo', diff: '+17 HRS' },
    { name: 'Sydney', tz: 'Australia/Sydney', diff: '+19 HRS' },
  ]

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-2.5 bg-neutral-800/80 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">World Clock & Stopwatch</span>
        </div>

        <div className="flex bg-neutral-950 rounded-lg p-0.5 border border-white/10">
          <button
            onClick={() => setActiveTab('world')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'world' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            World Clock
          </button>
          <button
            onClick={() => setActiveTab('stopwatch')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'stopwatch' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'world' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {worldCities.map((c, i) => (
            <div
              key={i}
              className="p-4 bg-neutral-950/60 rounded-xl border border-white/5 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-white">{c.name}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">{c.diff}</div>
              </div>
              <div className="text-2xl font-mono font-light text-neutral-100 tracking-tight">
                {getTimeInZone(c.tz)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
          <div className="text-5xl font-mono font-light tracking-tight text-white">
            {formatStopwatch(stopwatchTime)}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                soundService.playClick()
                if (stopwatchRunning) {
                  setLaps(l => [stopwatchTime, ...l])
                } else {
                  setStopwatchTime(0)
                  setLaps([])
                }
              }}
              className="w-16 h-16 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white flex flex-col items-center justify-center font-semibold text-xs border border-white/10"
            >
              {stopwatchRunning ? 'Lap' : 'Reset'}
            </button>

            <button
              onClick={() => {
                soundService.playClick()
                setStopwatchRunning(r => !r)
              }}
              className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-semibold text-xs transition-colors ${
                stopwatchRunning
                  ? 'bg-red-600/30 text-red-400 border border-red-500/40'
                  : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {stopwatchRunning ? 'Stop' : 'Start'}
            </button>
          </div>

          {/* Lap list */}
          {laps.length > 0 && (
            <div className="w-full max-w-xs max-h-36 overflow-y-auto divide-y divide-white/5 font-mono text-xs">
              {laps.map((lapTime, idx) => (
                <div key={idx} className="flex justify-between py-1.5 text-neutral-400">
                  <span>Lap {laps.length - idx}</span>
                  <span className="text-white">{formatStopwatch(lapTime)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
