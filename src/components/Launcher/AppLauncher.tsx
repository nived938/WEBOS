import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useSettings } from '@/core/settings/SettingsContext'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import type { AppId } from '@/types'
import { soundService } from '@/core/audio/soundService'
import { ContextMenu, MenuItem } from '@/components/Desktop/ContextMenu'
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
  Palette,
  Film,
  Wrench,
  GraduationCap,
  ArrowUpDown,
  Pin,
  ExternalLink,
} from 'lucide-react'

type SortOption = 'alpha' | 'recent' | 'installed' | 'recommended'

export const AppLauncher: React.FC = () => {
  const { isLauncherOpen, toggleLauncher, openApp, runningAppIds } = useWindowManager()
  const { settings, updateSettings } = useSettings()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<SortOption>('alpha')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    items: MenuItem[]
  }>({
    visible: false,
    x: 0,
    y: 0,
    items: [],
  })

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
        soundService.playClick()
        toggleLauncher(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLauncherOpen, toggleLauncher])

  const allApps = useMemo(() => Object.values(APPS_REGISTRY), [])

  // 8 Canonical Categories from Specification
  const categories = [
    { id: 'All', label: 'All', icon: LayoutGrid },
    { id: 'Productivity', label: 'Productivity', icon: Layers },
    { id: 'Development', label: 'Development', icon: Code },
    { id: 'Graphics', label: 'Graphics', icon: Palette },
    { id: 'Media', label: 'Media', icon: Film },
    { id: 'Utilities', label: 'Utilities', icon: Wrench },
    { id: 'Education', label: 'Education', icon: GraduationCap },
    { id: 'Games', label: 'Games', icon: Gamepad2 },
  ]

  const filteredApps = useMemo(() => {
    let result = allApps.filter((app) => {
      if (category !== 'All') {
        if (app.category.toLowerCase() !== category.toLowerCase()) return false
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

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'alpha') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'installed') {
        return runningAppIds.includes(b.id as AppId) ? 1 : -1
      }
      return a.title.localeCompare(b.title)
    })

    return result
  }, [allApps, category, query, sortBy, runningAppIds])

  if (!isLauncherOpen) return null

  const handleLaunch = (id: string) => {
    soundService.playClick()
    openApp(id as AppId)
    toggleLauncher(false)
  }

  const handleContextMenu = (appId: AppId, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    soundService.playClick()

    const currentPinned = settings.dockSettings?.pinnedAppIds || []
    const isPinned = currentPinned.includes(appId)

    const items: MenuItem[] = [
      {
        label: `Launch Application`,
        action: () => handleLaunch(appId),
      },
      {
        label: isPinned ? 'Remove from Dock' : 'Add to Dock',
        action: () => {
          const next = isPinned
            ? currentPinned.filter((id) => id !== appId)
            : [...currentPinned, appId]
          updateSettings({
            dockSettings: {
              ...(settings.dockSettings || {}),
              pinnedAppIds: next,
            },
          })
        },
      },
      {
        label: 'View in Software Center',
        action: () => {
          openApp('appstore')
          toggleLauncher(false)
        },
      },
    ]

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      items,
    })
  }

  return (
    <div
      className="fixed inset-0 z-[80] backdrop-blur-3xl bg-neutral-950/85 flex flex-col items-center pt-10 pb-8 px-6 overflow-hidden animate-fadeIn select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          toggleLauncher(false)
        }
      }}
    >
      {/* Top Bar: Search and Category Pills */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-4 z-10">
        {/* Search Input Box */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search applications, tools, lessons, games..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-xl shadow-2xl"
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

        {/* Category Pills & Sorting Bar */}
        <div className="flex items-center justify-between w-full max-w-4xl gap-2 pt-1">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-400/40'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/15 hover:text-white border border-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {c.label}
                </button>
              )
            })}
          </div>

          {/* Sort Selector */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 flex-shrink-0">
            <ArrowUpDown size={13} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-neutral-200 focus:outline-none text-xs"
            >
              <option value="alpha">A-Z Alphabetical</option>
              <option value="installed">Running First</option>
            </select>
          </div>
        </div>
      </div>

      {/* App Grid */}
      <div className="w-full max-w-6xl flex-1 mt-6 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-white/20">
        {filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
            <LayoutGrid className="w-12 h-12 mb-3 stroke-[1.2] opacity-40" />
            <p className="text-sm font-medium">No applications match "{query}"</p>
            <p className="text-xs text-neutral-500 mt-1">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5 sm:gap-6 justify-items-center">
            {filteredApps.map((app) => {
              const isRunning = runningAppIds.includes(app.id as AppId)
              return (
                <button
                  key={app.id}
                  onClick={() => handleLaunch(app.id)}
                  onContextMenu={(e) => handleContextMenu(app.id as AppId, e)}
                  className="group flex flex-col items-center text-center p-2 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none"
                >
                  {/* Icon Badge */}
                  <div className="relative mb-2">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr ${
                        app.gradient || 'from-blue-500 to-indigo-600'
                      } p-[1.5px] shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-200`}
                    >
                      <div className="w-full h-full bg-neutral-900/60 backdrop-blur-sm rounded-[14px] flex items-center justify-center text-white">
                        <Sparkles className="w-7 h-7 text-white/90 group-hover:scale-110 transition-transform duration-200" />
                      </div>
                    </div>

                    {/* Running Indicator Dot */}
                    {isRunning && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                    )}
                  </div>

                  {/* App Title */}
                  <span className="text-xs font-medium text-neutral-200 group-hover:text-white transition-colors truncate max-w-[84px]">
                    {app.title}
                  </span>
                  <span className="text-[10px] text-neutral-400/80 truncate max-w-[84px]">
                    {app.category}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Dismiss Hint */}
      <div className="mt-3 text-[11px] text-neutral-400 flex items-center gap-1.5">
        Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono text-[10px]">Esc</kbd> or click outside to close
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </div>
  )
}
