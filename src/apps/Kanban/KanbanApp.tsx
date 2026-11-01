import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Plus, Trash2, Tag, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'

interface KanbanCard {
  id: string
  title: string
  column: 'backlog' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  tag: string
}

const INITIAL_CARDS: KanbanCard[] = [
  {
    id: 'c1',
    title: 'Implement liquid glass refraction shaders',
    column: 'done',
    priority: 'high',
    tag: 'Graphics',
  },
  {
    id: 'c2',
    title: 'Spatial Activities Overview with window preview cards',
    column: 'in_progress',
    priority: 'high',
    tag: 'Window Manager',
  },
  {
    id: 'c3',
    title: 'Dual-pane tabbed Finder with IndexedDB VFS',
    column: 'review',
    priority: 'medium',
    tag: 'Core OS',
  },
  {
    id: 'c4',
    title: 'Add sound effects to dock hover and window close',
    column: 'backlog',
    priority: 'low',
    tag: 'Audio',
  },
]

export const KanbanApp: React.FC<AppInstanceProps> = () => {
  const [cards, setCards] = useState<KanbanCard[]>(() => {
    try {
      const stored = localStorage.getItem('nova_kanban_cards')
      return stored ? JSON.parse(stored) : INITIAL_CARDS
    } catch {
      return INITIAL_CARDS
    }
  })

  const [newTitle, setNewTitle] = useState('')
  const [selectedColumn, setSelectedColumn] = useState<'backlog' | 'in_progress' | 'review' | 'done'>('backlog')
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium')

  useEffect(() => {
    localStorage.setItem('nova_kanban_cards', JSON.stringify(cards))
  }, [cards])

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    soundService.play('buttonClick')
    const newCard: KanbanCard = {
      id: 'c_' + Date.now(),
      title: newTitle.trim(),
      column: selectedColumn,
      priority: selectedPriority,
      tag: 'Task',
    }
    setCards((prev) => [newCard, ...prev])
    setNewTitle('')
  }

  const moveCard = (id: string, direction: 'forward' | 'backward') => {
    soundService.play('buttonClick')
    const cols: ('backlog' | 'in_progress' | 'review' | 'done')[] = [
      'backlog',
      'in_progress',
      'review',
      'done',
    ]
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const currentIndex = cols.indexOf(c.column)
        const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1
        if (nextIndex >= 0 && nextIndex < cols.length) {
          return { ...c, column: cols[nextIndex] }
        }
        return c
      })
    )
  }

  const deleteCard = (id: string) => {
    soundService.play('buttonClick')
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  const COLUMNS = [
    { key: 'backlog', label: 'Backlog', color: 'border-neutral-500/30' },
    { key: 'in_progress', label: 'In Progress', color: 'border-blue-500/40' },
    { key: 'review', label: 'In Review', color: 'border-amber-500/40' },
    { key: 'done', label: 'Done', color: 'border-emerald-500/40' },
  ] as const

  const getPriorityBadge = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high':
        return <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">High</span>
      case 'medium':
        return <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Med</span>
      default:
        return <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Low</span>
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#17171e] text-neutral-200 font-sans select-none">
      {/* Top Creation Bar */}
      <form
        onSubmit={handleAddCard}
        className="px-4 py-2.5 border-b border-white/10 bg-black/40 flex items-center gap-3"
      >
        <input
          type="text"
          placeholder="New card title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value as any)}
          className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-neutral-300 focus:outline-none"
        >
          <option value="backlog">Backlog</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as any)}
          className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-neutral-300 focus:outline-none"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1 transition-colors shadow"
        >
          <Plus size={14} /> Add Card
        </button>
      </form>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto p-4 flex gap-4">
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.column === col.key)
          return (
            <div
              key={col.key}
              className={`w-72 bg-black/20 rounded-xl p-3 border ${col.color} flex flex-col flex-shrink-0`}
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                <span className="text-xs font-semibold text-white tracking-wide">
                  {col.label}
                </span>
                <span className="text-[11px] font-mono bg-white/10 text-neutral-400 px-2 py-0.5 rounded-full">
                  {colCards.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {colCards.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs text-neutral-200 font-medium leading-snug">
                        {c.title}
                      </p>
                      <button
                        onClick={() => deleteCard(c.id)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-opacity p-0.5"
                        title="Delete card"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        {getPriorityBadge(c.priority)}
                        <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                          <Tag size={10} /> {c.tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {col.key !== 'backlog' && (
                          <button
                            onClick={() => moveCard(c.id, 'backward')}
                            className="p-1 hover:bg-white/10 rounded text-neutral-400"
                            title="Move back"
                          >
                            <ChevronLeft size={12} />
                          </button>
                        )}
                        {col.key !== 'done' && (
                          <button
                            onClick={() => moveCard(c.id, 'forward')}
                            className="p-1 hover:bg-white/10 rounded text-neutral-400"
                            title="Move next"
                          >
                            <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
