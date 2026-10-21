import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Plus, Check, Trash2, Calendar, AlertCircle, Sparkles, Filter } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'

interface TodoItem {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: 'Work' | 'Personal' | 'Projects' | 'Urgent'
  createdAt: number
}

const STORAGE_KEY_TODOS = 'nova_os_todos_v1'

const DEFAULT_TODOS: TodoItem[] = [
  { id: '1', text: 'Explore NOVA OS window controls and desktop snapping', completed: true, priority: 'high', category: 'Work', createdAt: Date.now() - 3600000 },
  { id: '2', text: 'Customize desktop wallpaper in System Settings', completed: true, priority: 'medium', category: 'Personal', createdAt: Date.now() - 2400000 },
  { id: '3', text: 'Test 3D Marble Runner in Games Center', completed: false, priority: 'high', category: 'Projects', createdAt: Date.now() - 1200000 },
  { id: '4', text: 'Inspect code playground and regex tools', completed: false, priority: 'medium', category: 'Work', createdAt: Date.now() - 600000 },
]

export const TodoApp: React.FC<AppInstanceProps> = () => {
  const { addNotification } = useNotifications()

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TODOS)
      return saved ? JSON.parse(saved) : DEFAULT_TODOS
    } catch {
      return DEFAULT_TODOS
    }
  })

  const [inputText, setInputText] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [category, setCategory] = useState<'Work' | 'Personal' | 'Projects' | 'Urgent'>('Work')
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos))
    } catch {
      // Ignore
    }
  }, [todos])

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    soundService.playClick()
    const newTodo: TodoItem = {
      id: 'todo-' + Date.now(),
      text: inputText.trim(),
      completed: false,
      priority,
      category,
      createdAt: Date.now(),
    }

    setTodos([newTodo, ...todos])
    setInputText('')
    addNotification('Task Added', `Added "${newTodo.text}"`, 'todo')
  }

  const toggleTodo = (id: string) => {
    soundService.playClick()
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const deleteTodo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    soundService.playClick()
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const filtered = todos.filter((t) => {
    if (activeTab === 'active') return !t.completed
    if (activeTab === 'completed') return t.completed
    return true
  })

  const completedCount = todos.filter((t) => t.completed).length

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-200 select-none font-sans overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-900/40 to-neutral-900 border-b border-white/10 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Tasks & Planner</h2>
          <div className="text-xs text-neutral-400">
            {completedCount} of {todos.length} tasks completed ({todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%)
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg capitalize transition font-medium ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task Input Form */}
      <form onSubmit={handleAddTodo} className="p-3 bg-neutral-900/60 border-b border-white/10 flex flex-wrap gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 min-w-[200px] bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
        >
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Projects">Projects</option>
          <option value="Urgent">Urgent</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition"
        >
          <Plus size={14} /> Add Task
        </button>
      </form>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 select-text">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500 text-xs">
            <Check size={32} className="text-neutral-600 mb-2" />
            <span>No tasks found in this view</span>
          </div>
        ) : (
          filtered.map((todo) => {
            const priorityBadge =
              todo.priority === 'high'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : todo.priority === 'medium'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'

            return (
              <div
                key={todo.id}
                onClick={() => toggleTodo(todo.id)}
                className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                  todo.completed
                    ? 'bg-white/2 border-white/5 opacity-60'
                    : 'bg-white/5 hover:bg-white/8 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                      todo.completed
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    {todo.completed && <Check size={12} className="stroke-[3]" />}
                  </button>

                  <span
                    className={`text-xs text-neutral-200 truncate ${
                      todo.completed ? 'line-through text-neutral-500' : 'font-medium'
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                    {todo.priority}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/5">
                    {todo.category}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => deleteTodo(todo.id, e)}
                    className="p-1 rounded-md text-neutral-500 hover:text-rose-400 hover:bg-white/5 transition"
                    title="Delete task"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
