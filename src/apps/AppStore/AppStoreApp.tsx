import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import type { AppId } from '@/types'
import {
  Download,
  Check,
  Star,
  ExternalLink,
  Gamepad2,
  Folder,
  Globe,
  Music,
  Terminal,
  Settings,
  Image,
  Calendar,
  Calculator,
  Mail,
  FileText,
  Search,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'

interface StoreApp {
  id: string
  appId?: AppId
  name: string
  developer: string
  category: 'Productivity' | 'Utilities' | 'Media' | 'Games'
  rating: number
  reviewsCount: number
  description: string
  iconBg: string
  iconColor: string
  iconComponent: React.ComponentType<{ size: number; className?: string }>
  isBuiltIn: boolean
  isInstalled: boolean
}

const STORE_CATALOG: StoreApp[] = [
  {
    id: 'store-games',
    appId: 'games',
    name: 'Nova Odyssey',
    developer: 'Nova Arcade Studios',
    category: 'Games',
    rating: 4.9,
    reviewsCount: 1420,
    description: 'A smooth 60 FPS cyberpunk 2D platformer with procedural physics, double jumps, moving platforms, and high-energy electronic sound effects.',
    iconBg: 'bg-gradient-to-tr from-violet-600 to-fuchsia-600',
    iconColor: 'text-white',
    iconComponent: Gamepad2,
    isBuiltIn: true,
    isInstalled: true,
  },
  {
    id: 'store-finder',
    appId: 'finder',
    name: 'Finder',
    developer: 'NOVA OS Core',
    category: 'System' as any,
    rating: 4.8,
    reviewsCount: 3820,
    description: 'The premier file management system for NOVA OS, featuring IndexedDB persistence, local file importing, and virtual drive browsing.',
    iconBg: 'bg-gradient-to-tr from-blue-500 to-cyan-500',
    iconColor: 'text-white',
    iconComponent: Folder,
    isBuiltIn: true,
    isInstalled: true,
  },
  {
    id: 'store-browser',
    appId: 'browser',
    name: 'NOVA Browser',
    developer: 'NOVA OS Core',
    category: 'Utilities',
    rating: 4.7,
    reviewsCount: 2900,
    description: 'Fast, secure, multi-tabbed web browsing with customizable bookmarks, search engines, and intelligent X-Frame-Options handling.',
    iconBg: 'bg-gradient-to-tr from-sky-500 to-indigo-600',
    iconColor: 'text-white',
    iconComponent: Globe,
    isBuiltIn: true,
    isInstalled: true,
  },
  {
    id: 'store-music',
    appId: 'music',
    name: 'Music',
    developer: 'NOVA OS Audio',
    category: 'Media',
    rating: 4.9,
    reviewsCount: 1980,
    description: 'Procedural Web Audio ambient music generator and local audio track player with live canvas frequency visualizer.',
    iconBg: 'bg-gradient-to-tr from-pink-500 to-rose-600',
    iconColor: 'text-white',
    iconComponent: Music,
    isBuiltIn: true,
    isInstalled: true,
  },
  {
    id: 'store-terminal',
    appId: 'terminal',
    name: 'Terminal',
    developer: 'NOVA OS Core',
    category: 'Utilities',
    rating: 5.0,
    reviewsCount: 4120,
    description: 'Unix-style command line shell with filesystem navigation, neofetch system info, and app launching capabilities.',
    iconBg: 'bg-neutral-900 border border-white/20',
    iconColor: 'text-emerald-400',
    iconComponent: Terminal,
    isBuiltIn: true,
    isInstalled: true,
  },
  {
    id: 'store-notes',
    appId: 'notes',
    name: 'Notes',
    developer: 'NOVA OS Core',
    category: 'Productivity',
    rating: 4.8,
    reviewsCount: 2450,
    description: 'Rich text notes organizer with real-time autosave, Markdown formatting tools, and folder categorization.',
    iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-600',
    iconColor: 'text-white',
    iconComponent: FileText,
    isBuiltIn: true,
    isInstalled: true,
  },
  {
    id: 'store-photos',
    appId: 'photos',
    name: 'Photos',
    developer: 'NOVA OS Media',
    category: 'Media',
    rating: 4.7,
    reviewsCount: 1680,
    description: 'High-resolution photo library with image zoom, rotation, metadata inspector, and instant wallpaper setting.',
    iconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
    iconColor: 'text-white',
    iconComponent: Image,
    isBuiltIn: true,
    isInstalled: true,
  },
  {
    id: 'store-calculator',
    appId: 'calculator',
    name: 'Calculator',
    developer: 'NOVA OS Core',
    category: 'Utilities',
    rating: 4.9,
    reviewsCount: 3100,
    description: 'Standard and scientific mathematical calculator with keyboard input and equation history drawer.',
    iconBg: 'bg-gradient-to-tr from-orange-500 to-amber-600',
    iconColor: 'text-white',
    iconComponent: Calculator,
    isBuiltIn: true,
    isInstalled: true,
  },
]

export const AppStoreApp: React.FC<AppInstanceProps> = () => {
  const { openApp } = useWindowManager()
  const { addNotification } = useNotifications()
  const [apps, setApps] = useState<StoreApp[]>(STORE_CATALOG)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApp, setSelectedApp] = useState<StoreApp>(STORE_CATALOG[0])

  const categories = ['All', 'Productivity', 'Utilities', 'Media', 'Games']

  const filteredApps = apps.filter((app) => {
    const matchesCat = selectedCategory === 'All' || app.category === selectedCategory
    const matchesQuery =
      searchQuery === '' ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesQuery
  })

  const handleLaunchApp = (app: StoreApp) => {
    soundService.playClick()
    if (app.appId) {
      openApp(app.appId)
    }
  }

  const handleInstallApp = (app: StoreApp) => {
    soundService.playClick()
    setApps((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, isInstalled: true } : a))
    )
    addNotification('App Installed', `"${app.name}" is now ready to use!`, 'appstore')
  }

  return (
    <div className="flex h-full bg-neutral-900/90 text-neutral-200 select-none backdrop-blur-xl">
      {/* Sidebar Navigation */}
      <div className="w-52 border-r border-white/10 bg-black/20 flex flex-col p-3 space-y-1 text-xs">
        <div className="px-3 py-2 mb-2 font-bold text-white text-sm flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold">
            A
          </div>
          <span>App Store</span>
        </div>

        <div className="relative mb-3">
          <Search size={13} className="absolute left-2.5 top-2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-7 pr-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">
          Discover
        </div>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              soundService.playClick()
              setSelectedCategory(cat)
            }}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === cat
                ? 'bg-blue-600/20 text-blue-300 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Catalog View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Hero Banner: Nova Odyssey */}
        <div className="relative rounded-2xl overflow-hidden p-6 bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-950 border border-white/15 shadow-2xl flex items-center justify-between">
          <div className="max-w-md space-y-2 z-10">
            <span className="text-[11px] font-bold text-violet-300 tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded-full">
              FEATURED GAME
            </span>
            <h2 className="text-2xl font-extrabold text-white">Nova Odyssey</h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Experience the fast-paced 60 FPS platformer built exclusively for NOVA OS. Jump across cyber orbitals and set the high score!
            </p>
            <button
              onClick={() => {
                soundService.playClick()
                openApp('games')
              }}
              className="mt-2 px-5 py-2 rounded-xl bg-white text-neutral-900 font-bold text-xs shadow-lg hover:bg-neutral-100 transition active:scale-95"
            >
              Play Now
            </button>
          </div>

          <div className="hidden sm:flex w-24 h-24 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 items-center justify-center shadow-2xl shadow-purple-500/40 transform rotate-3">
            <Gamepad2 size={48} className="text-white" />
          </div>
        </div>

        {/* Apps Grid */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">
            {selectedCategory === 'All' ? 'Popular Applications' : `${selectedCategory} Apps`}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredApps.map((app) => {
              const IconComp = app.iconComponent
              return (
                <div
                  key={app.id}
                  onClick={() => {
                    soundService.playClick()
                    setSelectedApp(app)
                  }}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className={`w-12 h-12 rounded-xl ${app.iconBg} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition`}
                    >
                      <IconComp size={24} className={app.iconColor} />
                    </div>

                    <div className="flex-1 truncate">
                      <div className="font-semibold text-xs text-white truncate">{app.name}</div>
                      <div className="text-[10px] text-neutral-400 truncate">{app.developer}</div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-400">
                        <Star size={11} className="fill-amber-400" />
                        <span className="font-mono">{app.rating}</span>
                        <span className="text-neutral-500">({app.reviewsCount})</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-300 line-clamp-2 mb-3 leading-relaxed">
                    {app.description}
                  </p>

                  <div className="flex justify-end">
                    {app.isInstalled ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLaunchApp(app)
                        }}
                        className="px-4 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition shadow-sm"
                      >
                        OPEN
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleInstallApp(app)
                        }}
                        className="px-4 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] transition"
                      >
                        GET
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
