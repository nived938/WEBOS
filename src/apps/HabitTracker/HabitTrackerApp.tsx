import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Check, Flame, Plus, Trash2, Award } from 'lucide-react'

interface Habit {
  id: string
  name: string
  days: boolean[] // 7 days of the week: Mon - Sun
  streak: number
}

const INITIAL_HABITS: Habit[] = [
  { id: 'h1', name: 'Code Architecture Review', days: [true, true, true, true, false, false, false], streak: 12 },
  { id: 'h2', name: 'Read 20 Pages of Tech Spec', days: [true, true, false, true, true, false, false], streak: 5 },
  { id: 'h3', name: '30-Min Cardio Workout', days: [false, true, true, true, false, false, false], streak: 3 },
  { id: 'h4', name: 'Drink 2.5L Water', days: [true, true, true, true, true, false, false], streak: 19 },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const HabitTrackerApp: React.FC<AppInstanceProps> = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const stored = localStorage.getItem('nova_habits')
      return stored ? JSON.parse(stored) : INITIAL_HABITS
    } catch {
      return INITIAL_HABITS
    }
  })
  const [newHabitName, setNewHabitName] = useState('')

  useEffect(() => {
    localStorage.setItem('nova_habits', JSON.stringify(habits))
  }, [habits])

  const toggleDay = (habitId: string, dayIdx: number) => {
    soundService.play('buttonClick')
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h
        const newDays = [...h.days]
        newDays[dayIdx] = !newDays[dayIdx]
        const completedCount = newDays.filter(Boolean).length
        return {
          ...h,
          days: newDays,
          streak: newDays[dayIdx] ? h.streak + 1 : Math.max(0, h.streak - 1),
        }
      })
    )
  }

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim()) return
    soundService.play('buttonClick')
    const item: Habit = {
      id: 'h_' + Date.now(),
      name: newHabitName.trim(),
      days: [false, false, false, false, false, false, false],
      streak: 0,
    }
    setHabits((prev) => [...prev, item])
    setNewHabitName('')
  }

  const deleteHabit = (id: string) => {
    soundService.play('buttonClick')
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  return (
    <div className="flex flex-col h-full bg-[#16161d] text-neutral-200 font-sans select-none">
      {/* Top Creation Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flame size={18} className="text-amber-500 fill-amber-500" /> NOVA Habit Tracker & Routine Builder
          </h2>
          <p className="text-xs text-neutral-400">Weekly Consistency & Streak Gamification</p>
        </div>

        <form onSubmit={addHabit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New habit name..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 w-52"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1 shadow"
          >
            <Plus size={14} /> Add
          </button>
        </form>
      </div>

      {/* Habit Matrix */}
      <div className="flex-1 overflow-auto p-6">
        <div className="min-w-[560px] bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 py-3 bg-white/5 border-b border-white/10 text-xs font-semibold text-neutral-300">
            <div className="col-span-4">Habit Name</div>
            <div className="col-span-6 grid grid-cols-7 text-center">
              {DAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="col-span-2 text-right">Streak</div>
          </div>

          {/* Habit Rows */}
          <div className="divide-y divide-white/5">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="grid grid-cols-12 px-4 py-3 items-center hover:bg-white/5 transition-colors group"
              >
                <div className="col-span-4 flex items-center justify-between pr-3">
                  <span className="text-xs font-medium text-white">{habit.name}</span>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-opacity p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="col-span-6 grid grid-cols-7 gap-1 px-2">
                  {habit.days.map((done, dayIdx) => (
                    <button
                      key={dayIdx}
                      onClick={() => toggleDay(habit.id, dayIdx)}
                      className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                        done
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-transparent'
                      }`}
                    >
                      <Check size={14} className={done ? 'opacity-100' : 'opacity-0'} />
                    </button>
                  ))}
                </div>

                <div className="col-span-2 flex items-center justify-end gap-1.5 font-mono text-xs">
                  <Flame size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-white font-bold">{habit.streak}d</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
