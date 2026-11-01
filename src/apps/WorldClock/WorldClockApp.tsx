import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Globe, Clock, Sun, Moon } from 'lucide-react'

interface CityClock {
  city: string
  timezone: string
  country: string
}

const CITIES: CityClock[] = [
  { city: 'London', timezone: 'Europe/London', country: 'United Kingdom' },
  { city: 'New York', timezone: 'America/New_York', country: 'United States' },
  { city: 'San Francisco', timezone: 'America/Los_Angeles', country: 'United States' },
  { city: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan' },
  { city: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia' },
  { city: 'Paris', timezone: 'Europe/Paris', country: 'France' },
]

export const WorldClockApp: React.FC<AppInstanceProps> = () => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-blue-400" />
          <span className="font-semibold text-white text-xs">Global World Clock</span>
        </div>
        <span className="text-xs text-neutral-400 font-mono">UTC Offset Synced</span>
      </div>

      {/* Grid of Cities */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {CITIES.map((c) => {
          let timeString = ''
          let isDay = true
          try {
            timeString = new Intl.DateTimeFormat('en-US', {
              timeZone: c.timezone,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            }).format(now)

            const hour = parseInt(
              new Intl.DateTimeFormat('en-US', {
                timeZone: c.timezone,
                hour: 'numeric',
                hour12: false,
              }).format(now),
              10
            )
            isDay = hour >= 6 && hour < 18
          } catch {
            timeString = now.toLocaleTimeString()
          }

          return (
            <div
              key={c.city}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{c.city}</h3>
                  <span className="text-[10px] text-neutral-400">{c.country}</span>
                </div>
                <div
                  className={`p-1.5 rounded-full ${
                    isDay ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
                  }`}
                >
                  {isDay ? <Sun size={14} /> : <Moon size={14} />}
                </div>
              </div>

              <div className="text-2xl font-mono font-bold text-white tracking-wider">
                {timeString}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
