import React, { useState, useMemo } from 'react'
import type { AppInstanceProps, AppCategory, RegisteredApp } from '@/core/appRegistry/types'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import {
  Search,
  Grid,
  Star,
  Download,
  Sparkles,
  Check,
  ExternalLink,
  Tag,
  Info,
  Layers,
  Code,
  Globe,
  GraduationCap,
  Image,
  Cpu,
  Gamepad2,
  Bookmark,
  Pin,
  X,
  Play,
  Heart,
  MessageSquare,
} from 'lucide-react'

export const AppLibraryApp: React.FC<AppInstanceProps> = () => {
  const { openApp } = useWindowManager()
  const { addNotification } = useNotifications()

  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApp, setSelectedApp] = useState<RegisteredApp | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('nova_app_favorites_v1')
      return saved ? new Set(JSON.parse(saved)) : new Set(['browser', 'notes', 'terminal', 'game_marble3d', 'calculator'])
    } catch {
      return new Set(['browser', 'notes', 'terminal'])
    }
  })

  const allApps = useMemo(() => Object.values(APPS_REGISTRY), [])

  const categories: { id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'All', label: 'All Applications', icon: Grid },
    { id: 'Featured', label: 'Featured Apps', icon: Sparkles },
    { id: 'Favorites', label: 'Favorites', icon: Heart },
    { id: 'Productivity', label: 'Productivity', icon: Layers },
    { id: 'Internet', label: 'Internet & Web', icon: Globe },
    { id: 'Development', label: 'Development', icon: Code },
    { id: 'Education', label: 'Education', icon: GraduationCap },
    { id: 'Media', label: 'Media & Graphics', icon: Image },
    { id: 'System', label: 'System & Tools', icon: Cpu },
    { id: 'Communication', label: 'Communication', icon: MessageSquare },
    { id: 'Games', label: 'Games (2D & 3D)', icon: Gamepad2 },
  ]

  const filteredApps = useMemo(() => {
    return allApps.filter((app) => {
      // Category filter
      if (selectedCategory === 'Featured') {
        const featuredIds = ['browser', 'game_marble3d', 'playground', 'weather', 'texteditor', 'paint', 'music', 'game_tetris']
        if (!featuredIds.includes(app.id)) return false
      } else if (selectedCategory === 'Favorites') {
        if (!favorites.has(app.id)) return false
      } else if (selectedCategory === 'Media') {
        if (app.category !== 'Media' && app.category !== 'Graphics') return false
      } else if (selectedCategory !== 'All') {
        if (app.category !== selectedCategory) return false
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = app.title.toLowerCase().includes(q)
        const matchesDesc = app.description.toLowerCase().includes(q)
        const matchesCat = app.category.toLowerCase().includes(q)
        const matchesTags = app.tags?.some((t) => t.toLowerCase().includes(q))
        return matchesTitle || matchesDesc || matchesCat || matchesTags
      }

      return true
    })
  }, [allApps, selectedCategory, searchQuery, favorites])

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    soundService.playClick()
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        addNotification('Favorites', `Removed from favorites`, 'applibrary')
      } else {
        next.add(id)
        addNotification('Favorites', `Added to favorites`, 'applibrary')
      }
      try {
        localStorage.setItem('nova_app_favorites_v1', JSON.stringify(Array.from(next)))
      } catch {
        // Ignore
      }
      return next
    })
  }

  const handleLaunch = (id: string) => {
    soundService.playClick()
    openApp(id)
    addNotification('Launched', `Opening ${APPS_REGISTRY[id]?.title || 'App'}`, id)
  }

  return (
    <div className="flex h-full bg-neutral-950 text-neutral-200 select-none font-sans overflow-hidden">
      {/* 1. Sidebar Categories */}
      <div className="w-56 bg-neutral-900/70 border-r border-white/10 flex flex-col p-3 shrink-0">
        <div className="px-3 py-2 mb-2">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Software Center</div>
          <h2 className="text-sm font-bold text-white">App Library</h2>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 no-scrollbar text-xs">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  soundService.playClick()
                  setSelectedCategory(cat.id)
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition text-left font-medium ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} className={isSelected ? 'text-white' : 'text-neutral-400'} />
                <span className="truncate flex-1">{cat.label}</span>
                {cat.id === 'All' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-blue-700 text-white' : 'bg-white/10 text-neutral-400'}`}>
                    {allApps.length}
                  </span>
                )}
                {cat.id === 'Games' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-blue-700 text-white' : 'bg-purple-500/20 text-purple-300'}`}>
                    14
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* System Stats Footer */}
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-neutral-400 mt-2">
          <div className="flex items-center justify-between text-neutral-300 font-semibold mb-1">
            <span>NOVA Repository</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
          <div>{allApps.length} packages ready</div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col bg-neutral-900/40 overflow-hidden">
        {/* Top Search Toolbar */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4 bg-neutral-950/40">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applications, utilities, and games..."
              className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="text-xs text-neutral-400">
            Showing <span className="text-white font-semibold">{filteredApps.length}</span> apps
          </div>
        </div>

        {/* Apps Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Featured Hero Banner if viewing All or Featured */}
          {(selectedCategory === 'All' || selectedCategory === 'Featured') && !searchQuery && (
            <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative z-10 max-w-lg">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={11} /> Featured Application
                </div>
                <h3 className="text-lg font-bold text-white mb-1">NOVA Browser & 3D Gaming Suite</h3>
                <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                  Experience fast web exploration, interactive search, and real-time 3D games built right into NOVA OS.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLaunch('browser')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/30 transition"
                  >
                    <Play size={13} /> Launch Browser
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLaunch('game_marble3d')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition"
                  >
                    <Gamepad2 size={13} /> Play 3D Marble
                  </button>
                </div>
              </div>
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-purple-500/30 shrink-0">
                <Globe size={48} />
              </div>
            </div>
          )}

          {filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 mb-3">
                <Search size={28} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">No Applications Found</h3>
              <p className="text-xs text-neutral-400 max-w-xs">
                No apps matched "{searchQuery}" in {selectedCategory}. Try searching for another term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredApps.map((app) => {
                const isFav = favorites.has(app.id)
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 transition group flex flex-col justify-between cursor-pointer shadow-sm relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3 mb-2.5">
                      {/* App Icon */}
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 group-hover:scale-105 transition`}
                      >
                        {app.title.slice(0, 2).toUpperCase()}
                      </div>

                      {/* App Meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition">
                            {app.title}
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(app.id, e)}
                            className={`p-1 rounded-md transition ${isFav ? 'text-rose-400' : 'text-neutral-500 hover:text-white'}`}
                            title={isFav ? 'Favorite' : 'Add to Favorites'}
                          >
                            <Heart size={13} className={isFav ? 'fill-rose-400' : ''} />
                          </button>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-medium block">
                          {app.category} • v{app.version}
                        </span>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                          {app.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px]">
                      <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                        <Check size={11} /> Ready
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLaunch(app.id)
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-medium text-xs transition"
                      >
                        <Play size={11} /> Launch
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. App Details Modal */}
      {selectedApp && (
        <div
          onClick={() => setSelectedApp(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-neutral-900 border border-white/20 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setSelectedApp(null)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${selectedApp.gradient} flex items-center justify-center text-white font-bold text-xl shadow-xl shrink-0`}
              >
                {selectedApp.title.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{selectedApp.title}</h3>
                <div className="text-xs text-neutral-400 font-medium">
                  {selectedApp.category} • Version {selectedApp.version}
                </div>
                <div className="flex items-center gap-1.5 text-amber-400 text-xs mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} className="fill-amber-400" />
                  ))}
                  <span className="text-[11px] text-neutral-400 ml-1">5.0 (NOVA Verified)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 mb-6 text-xs text-neutral-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
              <p>{selectedApp.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px]">
                  Category: {selectedApp.category}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                  Status: Installed
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">
                  Author: NOVA OS Project
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => toggleFavorite(selectedApp.id, e)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition ${
                  favorites.has(selectedApp.id)
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                    : 'border-white/10 hover:border-white/20 text-neutral-300 hover:text-white'
                }`}
              >
                <Heart size={14} className={favorites.has(selectedApp.id) ? 'fill-rose-400' : ''} />
                <span>{favorites.has(selectedApp.id) ? 'Favorited' : 'Favorite'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleLaunch(selectedApp.id)
                  setSelectedApp(null)
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition"
              >
                <Play size={14} /> Open Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
