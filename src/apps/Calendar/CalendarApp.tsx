import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, Clock, Tag } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface CalendarEvent {
  id: string
  dateStr: string // YYYY-MM-DD
  title: string
  time: string
  category: 'work' | 'personal' | 'important' | 'other'
  description?: string
}

const STORAGE_KEY = 'nova_os_calendar_events'

const CATEGORY_COLORS = {
  work: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400' },
  personal: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  important: { bg: 'bg-rose-500/20', text: 'text-rose-300', dot: 'bg-rose-400' },
  other: { bg: 'bg-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-400' },
}

const getTodayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    dateStr: getTodayStr(),
    title: 'NOVA OS Launch & Demo',
    time: '10:00 AM',
    category: 'important',
    description: 'Explore the full browser-based operating system features.',
  },
  {
    id: 'ev-2',
    dateStr: getTodayStr(),
    title: 'Nova Odyssey Speedrun',
    time: '04:30 PM',
    category: 'personal',
    description: 'Reach the high score on the arcade platformer.',
  },
]

export const CalendarApp: React.FC<AppInstanceProps> = () => {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()) // 0 - 11
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayStr())
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // Ignore
    }
    return INITIAL_EVENTS
  })

  // New Event Form State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('09:00 AM')
  const [newCategory, setNewCategory] = useState<'work' | 'personal' | 'important' | 'other'>('work')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch {
      // Ignore
    }
  }, [events])

  const prevMonth = () => {
    soundService.playClick()
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    soundService.playClick()
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const jumpToToday = () => {
    soundService.playClick()
    const now = new Date()
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth())
    setSelectedDateStr(getTodayStr())
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay() // 0 = Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    soundService.playClick()
    const newEv: CalendarEvent = {
      id: 'ev-' + Date.now(),
      dateStr: selectedDateStr,
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
      description: newDesc.trim(),
    }
    setEvents((prev) => [...prev, newEv])
    setNewTitle('')
    setNewDesc('')
    setShowAddModal(false)
  }

  const handleDeleteEvent = (id: string) => {
    soundService.playClick()
    setEvents((prev) => prev.filter((ev) => ev.id !== id))
  }

  const selectedDayEvents = events.filter((ev) => ev.dateStr === selectedDateStr)

  return (
    <div className="flex h-full bg-neutral-900/90 text-neutral-200 select-none backdrop-blur-xl relative">
      {/* Left: Monthly Grid */}
      <div className="flex-1 flex flex-col border-r border-white/10 p-4">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-white">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={jumpToToday}
              className="ml-2 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-neutral-300 transition"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition"
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition"
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-400 pb-2 border-b border-white/10">
          {daysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 flex-1 py-2">
          {/* Empty padding days */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="rounded-lg p-1 bg-white/[0.01]" />
          ))}

          {/* Actual days of month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
            const isToday = dateStr === getTodayStr()
            const isSelected = dateStr === selectedDateStr
            const dayEvents = events.filter((ev) => ev.dateStr === dateStr)

            return (
              <button
                key={dayNum}
                onClick={() => {
                  soundService.playClick()
                  setSelectedDateStr(dateStr)
                }}
                className={`flex flex-col items-center justify-start p-1.5 rounded-xl transition relative group ${
                  isSelected
                    ? 'bg-blue-600/30 ring-1 ring-blue-500'
                    : 'hover:bg-white/5'
                }`}
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? 'bg-rose-500 text-white font-bold'
                      : isSelected
                      ? 'text-blue-300 font-semibold'
                      : 'text-neutral-300'
                  }`}
                >
                  {dayNum}
                </span>

                {/* Event dots */}
                <div className="flex gap-1 mt-1">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <span
                      key={ev.id}
                      className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[ev.category].dot}`}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: Selected Date Agenda */}
      <div className="w-72 flex flex-col bg-black/20 p-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div>
            <div className="text-xs text-neutral-400">Events for</div>
            <div className="text-sm font-semibold text-white">
              {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Agenda Events List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {selectedDayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-500 text-xs">
              <CalendarIcon size={24} className="mb-2 opacity-50" />
              No events scheduled
            </div>
          ) : (
            selectedDayEvents.map((ev) => {
              const catConfig = CATEGORY_COLORS[ev.category]
              return (
                <div
                  key={ev.id}
                  className={`p-3 rounded-xl border border-white/10 ${catConfig.bg} relative group transition`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-xs text-white leading-tight">{ev.title}</h4>
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="text-neutral-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-0.5"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
                    <Clock size={11} />
                    <span>{ev.time}</span>
                  </div>
                  {ev.description && (
                    <p className="text-[11px] text-neutral-300 mt-1.5 line-clamp-2">{ev.description}</p>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-30 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateEvent}
            className="bg-neutral-800 border border-white/10 rounded-2xl p-5 w-80 shadow-2xl space-y-3"
          >
            <h3 className="font-semibold text-sm text-white">New Calendar Event</h3>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Event Title</label>
              <input
                type="text"
                required
                placeholder="Team Sync..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CalendarEvent['category'])}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="important">Important</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Notes (Optional)</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-neutral-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
