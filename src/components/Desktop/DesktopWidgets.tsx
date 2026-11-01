import React, { useState, useEffect } from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { soundService } from '@/core/audio/soundService'
import type { DesktopWidgetConfig, DesktopWidgetType } from '@/types'
import {
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  CloudSun,
  Play,
  Pause,
  SkipForward,
  Cpu,
  BatteryCharging,
  CheckSquare,
  Square,
  FileText,
  Terminal,
  Globe,
  Settings,
  X,
  Sparkles,
} from 'lucide-react'

export const DesktopWidgets: React.FC = () => {
  const { settings, updateSettings } = useSettings()
  const { openApp } = useWindowManager()

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)
  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Configure Liquid Glass blur', done: true },
    { id: '2', text: 'Audit 3D WebGL render loop', done: false },
    { id: '3', text: 'Assemble orbital telemetry', done: false },
  ])
  const [quickNote, setQuickNote] = useState('NOVA OS 2.5: All personalization systems nominal.')

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const widgets = settings.desktopWidgets || []

  const handleToggleTask = (id: string) => {
    soundService.playClick()
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  const handleCloseWidget = (id: string) => {
    soundService.playClick()
    updateSettings({
      desktopWidgets: widgets.map((w) => (w.id === id ? { ...w, enabled: false } : w)),
    })
  }

  const renderWidgetContent = (widget: DesktopWidgetConfig) => {
    switch (widget.type) {
      case 'clock':
        return (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono drop-shadow">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[11px] font-medium text-cyan-300 tracking-wider uppercase mt-1">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        )

      case 'calendar': {
        const today = currentTime.getDate()
        const daysInMonth = 30
        const startDay = 4 // offset for display
        return (
          <div className="p-3 text-xs">
            <div className="flex justify-between items-center mb-2 font-bold text-white">
              <span>{currentTime.toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
              <CalendarIcon size={14} className="text-blue-400" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-neutral-400 font-mono">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i} className="font-semibold text-neutral-500">{d}</span>
              ))}
              {Array.from({ length: startDay }).map((_, i) => (
                <span key={'empty-' + i} />
              ))}
              {Array.from({ length: 14 }).map((_, i) => {
                const dayNum = i + 1
                const isToday = dayNum === today
                return (
                  <span
                    key={dayNum}
                    className={`py-0.5 rounded-full ${
                      isToday
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                        : 'text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {dayNum}
                  </span>
                )
              })}
            </div>
          </div>
        )
      }

      case 'weather':
        return (
          <div className="p-3.5 flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-sm">
                <CloudSun size={18} />
                <span>22°C</span>
              </div>
              <div className="text-[11px] text-neutral-300 mt-0.5">Atmospheric Clear</div>
              <div className="text-[9px] text-neutral-400 font-mono">Tahoe Station • Orbit 4</div>
            </div>
            <div className="text-right text-[10px] text-neutral-400 font-mono space-y-0.5">
              <div>Humidity: 48%</div>
              <div>Wind: 8 km/h</div>
            </div>
          </div>
        )

      case 'shortcuts':
        return (
          <div className="p-3 grid grid-cols-4 gap-2 text-center text-[10px]">
            <button
              onClick={() => openApp('notes')}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-neutral-300 hover:text-white"
            >
              <FileText size={16} className="text-amber-400" />
              <span>Notes</span>
            </button>
            <button
              onClick={() => openApp('terminal')}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-neutral-300 hover:text-white"
            >
              <Terminal size={16} className="text-emerald-400" />
              <span>Shell</span>
            </button>
            <button
              onClick={() => openApp('browser')}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-neutral-300 hover:text-white"
            >
              <Globe size={16} className="text-blue-400" />
              <span>Web</span>
            </button>
            <button
              onClick={() => openApp('settings')}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-neutral-300 hover:text-white"
            >
              <Settings size={16} className="text-purple-400" />
              <span>Setup</span>
            </button>
          </div>
        )

      case 'notes':
        return (
          <div className="p-3 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
              <span className="flex items-center gap-1">
                <FileText size={12} /> Sticky Note
              </span>
            </div>
            <textarea
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              className="w-full h-14 bg-black/30 border border-white/10 rounded-lg p-1.5 text-xs text-neutral-200 resize-none focus:outline-none focus:border-amber-400 font-sans"
            />
          </div>
        )

      case 'tasks':
        return (
          <div className="p-3 text-xs space-y-1.5">
            <div className="font-semibold text-white text-[11px] mb-1">Quick Tasks</div>
            {tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => handleToggleTask(t.id)}
                className="flex items-center gap-2 cursor-pointer text-neutral-300 hover:text-white"
              >
                {t.done ? (
                  <CheckSquare size={13} className="text-emerald-400 shrink-0" />
                ) : (
                  <Square size={13} className="text-neutral-500 shrink-0" />
                )}
                <span className={`text-[11px] truncate ${t.done ? 'line-through text-neutral-500' : ''}`}>
                  {t.text}
                </span>
              </div>
            ))}
          </div>
        )

      case 'music':
        return (
          <div className="p-3 flex items-center justify-between text-xs">
            <div className="min-w-0 flex-1 pr-2">
              <div className="font-semibold text-white truncate text-xs">Solaris Waves</div>
              <div className="text-[10px] text-cyan-300 truncate">Synthesizer Ambient #4</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  soundService.playClick()
                  setIsPlayingMusic((p) => !p)
                }}
                className="p-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500 text-cyan-200 hover:text-white transition"
              >
                {isPlayingMusic ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <button
                onClick={() => soundService.playClick()}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 transition"
              >
                <SkipForward size={13} />
              </button>
            </div>
          </div>
        )

      case 'system':
        return (
          <div className="p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                <Cpu size={13} className="text-cyan-400" /> Virtual Neural Engine
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                Simulated
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>V8 Octa-Core Load</span>
                <span className="text-white font-mono">24%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Unified Virtual Memory</span>
                <span className="text-white font-mono">4.1 GB / 16 GB</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: '26%' }} />
              </div>
            </div>
          </div>
        )

      case 'battery':
        return (
          <div className="p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <BatteryCharging size={20} className="text-emerald-400" />
              <div>
                <div className="font-bold text-white text-xs">98% Charged</div>
                <div className="text-[10px] text-neutral-400">AC Power Connected</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Optimal
            </span>
          </div>
        )

      default:
        return null
    }
  }

  const enabledWidgets = widgets.filter((w) => w.enabled)
  if (enabledWidgets.length === 0) return null

  return (
    <div className="fixed top-12 right-6 z-20 flex flex-col gap-3 pointer-events-auto select-none">
      {enabledWidgets.map((w) => (
        <div
          key={w.id}
          style={{
            backdropFilter: 'var(--glass-backdrop-filter, blur(24px) saturate(140%))',
            WebkitBackdropFilter: 'var(--glass-backdrop-filter, blur(24px) saturate(140%))',
            background: 'var(--glass-bg, rgba(18, 20, 32, 0.70))',
            border: 'var(--glass-border, 1px solid rgba(255, 255, 255, 0.15))',
            borderRadius: 'var(--glass-radius, 18px)',
            boxShadow: 'var(--glass-shadow, 0 15px 35px rgba(0, 0, 0, 0.45))',
          }}
          className="relative w-64 overflow-hidden group transition-all duration-200 hover:shadow-2xl"
        >
          {/* Subtle reflection overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'var(--glass-reflection, none)' }}
          />

          {/* Close Widget button on hover */}
          <button
            onClick={() => handleCloseWidget(w.id)}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/40 text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100 transition z-10"
            title="Remove Widget from Desktop"
          >
            <X size={11} />
          </button>

          {renderWidgetContent(w)}
        </div>
      ))}
    </div>
  )
}
