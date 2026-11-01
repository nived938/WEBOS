import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import type { AppId } from '@/types'
import { soundService } from '@/core/audio/soundService'
import {
  Search,
  X,
  Sparkles,
  Layers,
  Globe,
  Code,
  Image,
  Cpu,
  Gamepad2,
  Folder,
  LayoutGrid,
} from 'lucide-react'

export const AppLauncher: React.FC = () => {
  const { isLauncherOpen, toggleLauncher, openApp, runningAppIds } = useWindowManager()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isLauncherOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    } else {
      setQuery('')
      setCategory('All')
    }
  }, [isLauncherOpen])

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLauncherOpen) {
        toggleLauncher(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLauncherOpen, toggleLauncher])

  const allApps = useMemo(() => Object.values(APPS_REGISTRY), [])

  const categories = [
    { id: 'All', label: 'All', icon: LayoutGrid },
    { id: 'Productivity', label: 'Productivity', icon: Layers },
    { id: 'Internet', label: 'Internet', icon: Globe },
    { id: 'Development', label: 'Dev Tools', icon: Code },
    { id: 'Media', label: 'Media', icon: Image },
    { id: 'Games', label: 'Games', icon: Gamepad2 },
    { id: 'System', label: 'System', icon: Cpu },
  ]

  const filteredApps = useMemo(() => {
    return allApps.filter((app) => {
      if (category === 'Media') {
        if (app.category !== 'Media' && app.category !== 'Graphics') return false
      } else if (category !== 'All') {
        if (app.category !== category) return false
      }

      if (query.trim()) {
        const q = query.toLowerCase()
        return (
          app.title.toLowerCase().includes(q) ||
          app.description.toLowerCase().includes(q) ||
          app.category.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [allApps, category, query])

  if (!isLauncherOpen) return null

  const handleLaunch = (id: string) => {
    soundService.playClick()
    openApp(id as AppId)
    toggleLauncher(false)
  }

  return (
    <div
      className="fixed inset-0 z-[80] backdrop-blur-3xl bg-neutral-950/70 flex flex-col items-center pt-14 pb-12 px-6 overflow-hidden animate-fadeIn select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          toggleLauncher(false)
        }
      }}
    >
      {/* Top Bar: Search and Category Pills */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-5 z-10">
        {/* Search Input Box */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search apps, utilities, games..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/10 dark:bg-neutral-800/80 border border-white/20 text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md shadow-lg"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-full bg-neutral-700/50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {categories.map((c) => {
            const Icon = c.icon
            const isSelected = category === c.id
            return (
              <button
                key={c.id}
                onClick={() => {
                  soundService.playClick()
                  setCategory(c.id)
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-400/40'
                    : 'bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* App Grid */}
      <div className="w-full max-w-5xl flex-1 mt-8 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-white/20">
        {filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
            <LayoutGrid className="w-12 h-12 mb-3 stroke-[1.2] opacity-40" />
            <p className="text-sm font-medium">No applications match "{query}"</p>
            <p className="text-xs text-neutral-500 mt-1">Try a different search term or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-6 sm:gap-8 justify-items-center">
            {filteredApps.map((app) => {
              const isRunning = runningAppIds.includes(app.id as AppId)
              return (
                <button
                  key={app.id}
                  onClick={() => handleLaunch(app.id)}
                  className="group flex flex-col items-center text-center p-2 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none"
                >
                  {/* Icon Badge */}
                  <div className="relative mb-2.5">
                    <div
                      className={`w-16 h-16 sm:w-18 sm:h-18 rounded-[20px] bg-gradient-to-tr ${app.gradient || 'from-blue-500 to-indigo-600'} p-[2px] shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-200`}
                    >
                      <div className="w-full h-full bg-neutral-900/60 backdrop-blur-sm rounded-[18px] flex items-center justify-center text-white">
                        <Sparkles className="w-8 h-8 text-white/90 group-hover:scale-110 transition-transform duration-200" />
                      </div>
                    </div>

                    {/* Running Indicator Dot */}
                    {isRunning && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                    )}
                  </div>

                  {/* App Title */}
                  <span className="text-xs font-medium text-neutral-200 group-hover:text-white transition-colors truncate max-w-[90px]">
                    {app.title}
                  </span>
                  <span className="text-[10px] text-neutral-400/80 truncate max-w-[90px]">
                    {app.category}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Dismiss Hint */}
      <div className="mt-4 text-[11px] text-neutral-400 flex items-center gap-1.5">
        Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono text-[10px]">Esc</kbd> or click outside to close
      </div>
    </div>
  )
}
