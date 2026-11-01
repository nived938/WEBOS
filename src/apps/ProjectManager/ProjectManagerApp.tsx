import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import {
  Calendar,
  CheckCircle,
  Clock,
  Flag,
  Plus,
  Trash2,
  TrendingUp,
} from 'lucide-react'

interface Milestone {
  id: string
  title: string
  dueDate: string
  progress: number
  status: 'planning' | 'in_progress' | 'completed'
  owner: string
}

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    title: 'v2.5 Optical Compositor Pipeline',
    dueDate: '2026-11-10',
    progress: 100,
    status: 'completed',
    owner: 'Graphics Team',
  },
  {
    id: 'm2',
    title: 'Ubuntu Desktop Shell & Activities Overview',
    dueDate: '2026-11-18',
    progress: 80,
    status: 'in_progress',
    owner: 'Desktop Shell Team',
  },
  {
    id: 'm3',
    title: 'Verified App Catalog & VFS Storage Hub',
    dueDate: '2026-11-25',
    progress: 75,
    status: 'in_progress',
    owner: 'Core Subsystems',
  },
  {
    id: 'm4',
    title: 'Accessibility & Keyboard Shortcuts Integration',
    dueDate: '2026-12-05',
    progress: 30,
    status: 'planning',
    owner: 'UX Team',
  },
]

export const ProjectManagerApp: React.FC<AppInstanceProps> = () => {
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('2026-12-15')
  const [newOwner, setNewOwner] = useState('System Engineer')

  const totalProgress = Math.round(
    milestones.reduce((acc, m) => acc + m.progress, 0) / (milestones.length || 1)
  )

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    soundService.play('buttonClick')
    const item: Milestone = {
      id: 'm_' + Date.now(),
      title: newTitle.trim(),
      dueDate: newDate,
      progress: 0,
      status: 'planning',
      owner: newOwner,
    }
    setMilestones((prev) => [...prev, item])
    setNewTitle('')
  }

  const updateProgress = (id: string, delta: number) => {
    soundService.play('buttonClick')
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const newP = Math.min(100, Math.max(0, m.progress + delta))
        return {
          ...m,
          progress: newP,
          status: newP === 100 ? 'completed' : newP > 0 ? 'in_progress' : 'planning',
        }
      })
    )
  }

  const deleteMilestone = (id: string) => {
    soundService.play('buttonClick')
    setMilestones((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="flex flex-col h-full bg-[#16161c] text-neutral-200 font-sans select-none">
      {/* Top Header Summary */}
      <div className="px-6 py-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flag size={18} className="text-blue-400" /> NOVA OS Roadmap & Sprint Tracker
          </h2>
          <p className="text-xs text-neutral-400">Quarterly Delivery Milestones</p>
        </div>

        {/* Global Progress Dial */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <TrendingUp size={20} className="text-emerald-400" />
          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
              Overall Completion
            </div>
            <div className="text-base font-bold text-white font-mono">{totalProgress}%</div>
          </div>
          <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Milestone Form */}
      <form
        onSubmit={handleAddMilestone}
        className="px-6 py-2.5 border-b border-white/10 bg-black/20 flex items-center gap-3"
      >
        <input
          type="text"
          placeholder="New milestone title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
        />
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none"
        />
        <input
          type="text"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none w-36"
          placeholder="Owner team"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1 transition-colors shadow"
        >
          <Plus size={14} /> Add Milestone
        </button>
      </form>

      {/* Milestones List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all flex flex-col gap-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`p-2 rounded-lg ${
                    m.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : m.status === 'in_progress'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-neutral-500/20 text-neutral-400'
                  }`}
                >
                  <CheckCircle size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{m.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-neutral-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> Due: {m.dueDate}
                    </span>
                    <span>Team: {m.owner}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-white">{m.progress}%</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateProgress(m.id, -10)}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-xs"
                  >
                    -10%
                  </button>
                  <button
                    onClick={() => updateProgress(m.id, +10)}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-xs"
                  >
                    +10%
                  </button>
                </div>
                <button
                  onClick={() => deleteMilestone(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-opacity p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  m.progress === 100
                    ? 'bg-emerald-400'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
                style={{ width: `${m.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
