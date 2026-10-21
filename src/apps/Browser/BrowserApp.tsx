import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Star,
  Plus,
  X,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Clock,
  Trash2,
  BookmarkCheck,
  Copy,
  Check,
  Share2,
  BookOpen,
  SlidersHorizontal,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'

export interface BrowserTab {
  id: string
  title: string
  url: string
  isSearch: boolean
  searchQuery?: string
  canEmbed: boolean
  history: string[]
  historyIndex: number
  isLoading: boolean
  favicon?: string
}

export interface Bookmark {
  id: string
  title: string
  url: string
  iconText: string
}

export interface SearchResultItem {
  title: string
  url: string
  snippet: string
  source?: string
}

const STORAGE_KEY_BOOKMARKS = 'nova_browser_bookmarks_v2'
const STORAGE_KEY_HISTORY = 'nova_browser_history_v2'
const STORAGE_KEY_ENGINE = 'nova_browser_engine_v2'

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: 'bm-1', title: 'Wikipedia', url: 'https://en.m.wikipedia.org/wiki/Main_Page', iconText: 'W' },
  { id: 'bm-2', title: 'OpenStreetMap', url: 'https://www.openstreetmap.org/export/embed.html', iconText: 'OSM' },
  { id: 'bm-3', title: 'DevDocs API', url: 'https://devdocs.io', iconText: 'DD' },
  { id: 'bm-4', title: 'Hacker News', url: 'https://news.ycombinator.com', iconText: 'HN' },
  { id: 'bm-5', title: 'GitHub', url: 'https://github.com', iconText: 'GH' },
  { id: 'bm-6', title: 'DuckDuckGo', url: 'https://html.duckduckgo.com', iconText: 'DDG' },
]

export const SEARCH_ENGINES = {
  duckduckgo: {
    name: 'DuckDuckGo',
    badge: 'DDG',
    queryUrl: 'https://duckduckgo.com/?q=',
  },
  google: {
    name: 'Google',
    badge: 'G',
    queryUrl: 'https://www.google.com/search?q=',
  },
  bing: {
    name: 'Bing',
    badge: 'B',
    queryUrl: 'https://www.bing.com/search?q=',
  },
  wikipedia: {
    name: 'Wikipedia',
    badge: 'W',
    queryUrl: 'https://en.m.wikipedia.org/wiki/Special:Search?search=',
  },
}

type SearchEngineKey = keyof typeof SEARCH_ENGINES

// Known embed-friendly domain matchers
const EMBED_FRIENDLY_DOMAINS = [
  'wikipedia.org',
  'wikimedia.org',
  'openstreetmap.org',
  'devdocs.io',
  'codepen.io',
  'w3schools.com',
  'archive.org',
  'shadcn.com',
  'tailwindcss.com',
]

export const BrowserApp: React.FC<AppInstanceProps> = ({ isFocused }) => {
  const { addNotification } = useNotifications()

  // Persistent settings
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKMARKS)
      if (saved) return JSON.parse(saved)
    } catch {
      // Ignore
    }
    return DEFAULT_BOOKMARKS
  })

  const [globalHistory, setGlobalHistory] = useState<{ url: string; title: string; time: number }[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY)
      if (saved) return JSON.parse(saved)
    } catch {
      // Ignore
    }
    return []
  })

  const [searchEngine, setSearchEngine] = useState<SearchEngineKey>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENGINE)
      if (saved && saved in SEARCH_ENGINES) return saved as SearchEngineKey
    } catch {
      // Ignore
    }
    return 'duckduckgo'
  })

  // Tabs state
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'New Tab',
      url: 'about:home',
      isSearch: false,
      canEmbed: true,
      history: ['about:home'],
      historyIndex: 0,
      isLoading: false,
    },
  ])
  const [activeTabId, setActiveTabId] = useState<string>('tab-1')
  const [inputUrl, setInputUrl] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showEngineMenu, setShowEngineMenu] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // In-app Search Results State
  const [searchResults, setSearchResults] = useState<{
    query: string
    abstract?: string
    abstractSource?: string
    abstractUrl?: string
    results: SearchResultItem[]
    related: string[]
  } | null>(null)

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Save Bookmarks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks))
    } catch {
      // Ignore
    }
  }, [bookmarks])

  // Save History
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(globalHistory.slice(0, 100)))
    } catch {
      // Ignore
    }
  }, [globalHistory])

  // Save Search Engine
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ENGINE, searchEngine)
    } catch {
      // Ignore
    }
  }, [searchEngine])

  // Sync address input when active tab changes
  useEffect(() => {
    if (activeTab) {
      if (activeTab.url === 'about:home') {
        setInputUrl('')
      } else if (activeTab.isSearch && activeTab.searchQuery) {
        setInputUrl(activeTab.searchQuery)
      } else {
        setInputUrl(activeTab.url)
      }
      setShowSuggestions(false)
    }
  }, [activeTabId, activeTab])

  // Check if current URL is bookmarked
  const isCurrentBookmarked = bookmarks.some((b) => b.url === activeTab?.url)

  // Toggle bookmark
  const toggleBookmark = () => {
    if (!activeTab || activeTab.url === 'about:home') return
    soundService.playClick()
    if (isCurrentBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.url !== activeTab.url))
      addNotification('Bookmark Removed', `Removed ${activeTab.title} from bookmarks`, 'browser')
    } else {
      const newBm: Bookmark = {
        id: 'bm-' + Date.now(),
        title: activeTab.title || 'Page',
        url: activeTab.url,
        iconText: (activeTab.title || 'W').slice(0, 2).toUpperCase(),
      }
      setBookmarks((prev) => [...prev, newBm])
      addNotification('Bookmark Saved', `Saved ${activeTab.title} to bookmarks bar`, 'browser')
    }
  }

  // Real in-app search fetching
  const performSearch = useCallback(async (query: string) => {
    const cleanQuery = query.trim()
    if (!cleanQuery) return

    // Seed instant fallback results
    const resultsList: SearchResultItem[] = [
      {
        title: `${cleanQuery} - Overview & Documentation`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanQuery.replace(/\s+/g, '_'))}`,
        snippet: `Explore reference guides, articles, and comprehensive insights regarding "${cleanQuery}".`,
        source: 'Wikipedia',
      },
      {
        title: `Explore "${cleanQuery}" on DuckDuckGo`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}`,
        snippet: `Search the open web securely without tracking or targeted profiling.`,
        source: 'DuckDuckGo',
      },
      {
        title: `${cleanQuery} on GitHub Open Source`,
        url: `https://github.com/search?q=${encodeURIComponent(cleanQuery)}`,
        snippet: `Discover open source software libraries, repositories, and developer tools related to "${cleanQuery}".`,
        source: 'GitHub',
      },
      {
        title: `Developer Reference for ${cleanQuery}`,
        url: `https://devdocs.io/#q=${encodeURIComponent(cleanQuery)}`,
        snippet: `Fast, clean, offline-capable documentation for web developers and engineers.`,
        source: 'DevDocs',
      },
    ]

    setSearchResults({
      query: cleanQuery,
      abstract: `Search query processed for "${cleanQuery}" via ${SEARCH_ENGINES[searchEngine].name}. Click any item to explore documentation, open directly, or browse in reader mode.`,
      abstractSource: SEARCH_ENGINES[searchEngine].name,
      abstractUrl: SEARCH_ENGINES[searchEngine].queryUrl + encodeURIComponent(cleanQuery),
      results: resultsList,
      related: [
        `${cleanQuery} tutorial`,
        `${cleanQuery} github`,
        `${cleanQuery} documentation`,
        `best ${cleanQuery} tools`,
      ],
    })

    // Try live Wikipedia Opensearch API for dynamic results
    try {
      const resp = await fetch(
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
          cleanQuery
        )}&limit=6&namespace=0&format=json&origin=*`
      )
      if (resp.ok) {
        const data = await resp.json()
        const titles = data[1] as string[]
        const snippets = data[2] as string[]
        const urls = data[3] as string[]

        if (titles && titles.length > 0) {
          const liveResults: SearchResultItem[] = titles.map((t, idx) => ({
            title: t,
            snippet: snippets[idx] || `Read comprehensive encyclopedia details about ${t}.`,
            url: urls[idx] || `https://en.wikipedia.org/wiki/${encodeURIComponent(t)}`,
            source: 'Wikipedia Encyclopedia',
          }))

          setSearchResults((prev) => (prev ? { ...prev, results: [...liveResults, ...resultsList] } : prev))
        }
      }
    } catch {
      // Offline or CORS block fallback to reliable local index
    }
  }, [searchEngine])

  // Navigation Logic
  const navigateTo = (rawInput: string) => {
    let target = rawInput.trim()
    if (!target) return

    soundService.playClick()
    setShowSuggestions(false)

    // Check if input is a valid URL or a search query
    const hasProtocol = target.startsWith('http://') || target.startsWith('https://') || target.startsWith('about:')
    const isDomainLike = !hasProtocol && !target.includes(' ') && target.includes('.') && !target.endsWith('.')

    let isSearch = false
    let resolvedUrl = target
    let pageTitle = target

    if (target === 'about:home' || target === 'about:blank') {
      resolvedUrl = 'about:home'
      pageTitle = 'New Tab'
      isSearch = false
    } else if (hasProtocol) {
      resolvedUrl = target
      try {
        pageTitle = new URL(target).hostname
      } catch {
        pageTitle = target
      }
      isSearch = false
    } else if (isDomainLike) {
      resolvedUrl = 'https://' + target
      pageTitle = target.split('/')[0]
      isSearch = false
    } else {
      // It's a search query!
      isSearch = true
      resolvedUrl = 'search:' + encodeURIComponent(target)
      pageTitle = `Search: ${target}`
      performSearch(target)
    }

    // Determine embeddability
    const canEmbed =
      resolvedUrl.startsWith('about:') ||
      isSearch ||
      EMBED_FRIENDLY_DOMAINS.some((domain) => resolvedUrl.includes(domain))

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTabId) return t
        const newHist = t.history.slice(0, t.historyIndex + 1).concat([resolvedUrl])
        return {
          ...t,
          url: resolvedUrl,
          title: pageTitle,
          isSearch,
          searchQuery: isSearch ? target : undefined,
          canEmbed,
          history: newHist,
          historyIndex: newHist.length - 1,
          isLoading: !isSearch && resolvedUrl !== 'about:home',
        }
      })
    )

    if (resolvedUrl !== 'about:home') {
      setGlobalHistory((prev) => [
        { url: resolvedUrl, title: pageTitle, time: Date.now() },
        ...prev.filter((h) => h.url !== resolvedUrl).slice(0, 99),
      ])
    }
  }

  // Tab management
  const handleCreateTab = () => {
    soundService.playClick()
    const newId = 'tab-' + Date.now()
    const newTab: BrowserTab = {
      id: newId,
      title: 'New Tab',
      url: 'about:home',
      isSearch: false,
      canEmbed: true,
      history: ['about:home'],
      historyIndex: 0,
      isLoading: false,
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newId)
  }

  const handleCloseTab = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    soundService.playClick()
    if (tabs.length === 1) {
      setTabs([
        {
          id: 'tab-1',
          title: 'New Tab',
          url: 'about:home',
          isSearch: false,
          canEmbed: true,
          history: ['about:home'],
          historyIndex: 0,
          isLoading: false,
        },
      ])
      setActiveTabId('tab-1')
      return
    }

    const remaining = tabs.filter((t) => t.id !== id)
    setTabs(remaining)
    if (activeTabId === id) {
      setActiveTabId(remaining[remaining.length - 1].id)
    }
  }

  const handleBack = () => {
    if (!activeTab || activeTab.historyIndex <= 0) return
    soundService.playClick()
    const targetIdx = activeTab.historyIndex - 1
    const targetUrl = activeTab.history[targetIdx]
    const isSearch = targetUrl.startsWith('search:')

    if (isSearch) {
      const q = decodeURIComponent(targetUrl.replace('search:', ''))
      performSearch(q)
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              historyIndex: targetIdx,
              url: targetUrl,
              isSearch,
              searchQuery: isSearch ? decodeURIComponent(targetUrl.replace('search:', '')) : undefined,
            }
          : t
      )
    )
  }

  const handleForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return
    soundService.playClick()
    const targetIdx = activeTab.historyIndex + 1
    const targetUrl = activeTab.history[targetIdx]
    const isSearch = targetUrl.startsWith('search:')

    if (isSearch) {
      const q = decodeURIComponent(targetUrl.replace('search:', ''))
      performSearch(q)
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              historyIndex: targetIdx,
              url: targetUrl,
              isSearch,
              searchQuery: isSearch ? decodeURIComponent(targetUrl.replace('search:', '')) : undefined,
            }
          : t
      )
    )
  }

  const handleReload = () => {
    soundService.playClick()
    if (activeTab.isSearch && activeTab.searchQuery) {
      performSearch(activeTab.searchQuery)
    } else if (iframeRef.current && activeTab.url !== 'about:home') {
      iframeRef.current.src = activeTab.url
    }
  }

  // Keyboard Shortcuts
  useEffect(() => {
    if (!isFocused) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+T or Cmd+T: New Tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault()
        handleCreateTab()
      }
      // Ctrl+W or Cmd+W: Close Tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault()
        handleCloseTab(activeTabId)
      }
      // Ctrl+L or Cmd+L: Focus URL
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        inputRef.current?.select()
      }
      // Ctrl+R or Cmd+R: Reload
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault()
        handleReload()
      }
      // Ctrl+H: Toggle History
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        setShowHistory((h) => !h)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocused, activeTabId, activeTab])

  // Copy active link
  const handleCopyLink = () => {
    if (!activeTab || activeTab.url === 'about:home') return
    const textToCopy = activeTab.isSearch && activeTab.searchQuery
      ? SEARCH_ENGINES[searchEngine].queryUrl + encodeURIComponent(activeTab.searchQuery)
      : activeTab.url
    navigator.clipboard?.writeText(textToCopy)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    addNotification('Link Copied', 'URL copied to clipboard', 'browser')
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900/95 text-neutral-200 select-none backdrop-blur-xl relative font-sans overflow-hidden">
      {/* 1. Tabs Bar */}
      <div className="flex items-center gap-1 px-2 pt-2 bg-neutral-950/70 border-b border-white/10 overflow-x-auto no-scrollbar shrink-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <div
              key={tab.id}
              onClick={() => {
                soundService.playClick()
                setActiveTabId(tab.id)
              }}
              className={`group flex items-center gap-2 max-w-[200px] min-w-[120px] px-3 py-1.5 rounded-t-xl text-xs font-medium cursor-pointer transition border-t border-x ${
                isActive
                  ? 'bg-neutral-900 border-white/15 text-white shadow-sm'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              {tab.isSearch ? (
                <Search size={13} className={isActive ? 'text-blue-400 shrink-0' : 'text-neutral-500 shrink-0'} />
              ) : (
                <Globe size={13} className={isActive ? 'text-emerald-400 shrink-0' : 'text-neutral-500 shrink-0'} />
              )}
              <span className="truncate flex-1">{tab.title}</span>
              <button
                type="button"
                aria-label="Close tab"
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-white/15 text-neutral-400 hover:text-white transition"
              >
                <X size={12} />
              </button>
            </div>
          )
        })}

        <button
          type="button"
          onClick={handleCreateTab}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
          title="New Tab (Ctrl+T)"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* 2. Navigation & Address Bar Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-neutral-900/60 shrink-0 relative z-30">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleBack}
            disabled={!activeTab || activeTab.historyIndex <= 0}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-25 disabled:hover:text-neutral-400 hover:bg-white/10 transition"
            title="Back"
          >
            <ArrowLeft size={15} />
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={!activeTab || activeTab.historyIndex >= activeTab.history.length - 1}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-25 disabled:hover:text-neutral-400 hover:bg-white/10 transition"
            title="Forward"
          >
            <ArrowRight size={15} />
          </button>
          <button
            type="button"
            onClick={handleReload}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
            title="Reload (Ctrl+R)"
          >
            <RotateCw size={14} className={activeTab?.isLoading ? 'animate-spin text-blue-400' : ''} />
          </button>
          <button
            type="button"
            onClick={() => navigateTo('about:home')}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
            title="Home"
          >
            <Home size={15} />
          </button>
        </div>

        {/* Address / Search Bar */}
        <div className="flex-1 relative">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              navigateTo(inputUrl)
            }}
            className="flex items-center bg-black/40 border border-white/15 focus-within:border-blue-500/80 rounded-xl px-3 py-1.5 text-xs text-white transition shadow-inner"
          >
            {/* Search Engine Selector Badge */}
            <div className="relative mr-2">
              <button
                type="button"
                onClick={() => setShowEngineMenu((m) => !m)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-blue-300 transition"
                title={`Engine: ${SEARCH_ENGINES[searchEngine].name}`}
              >
                <span>{SEARCH_ENGINES[searchEngine].badge}</span>
              </button>

              {showEngineMenu && (
                <div className="absolute left-0 top-7 w-36 bg-neutral-900 border border-white/20 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Search Engine</div>
                  {Object.entries(SEARCH_ENGINES).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        soundService.playClick()
                        setSearchEngine(key as SearchEngineKey)
                        setShowEngineMenu(false)
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition text-left ${
                        searchEngine === key
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{val.name}</span>
                      {searchEngine === key && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value)
                if (e.target.value.trim().length > 1) {
                  setShowSuggestions(true)
                  setSuggestions([
                    e.target.value,
                    `${e.target.value} documentation`,
                    `${e.target.value} github`,
                    `${e.target.value} tutorial`,
                  ])
                } else {
                  setShowSuggestions(false)
                }
              }}
              onFocus={() => {
                if (inputUrl.trim().length > 1) setShowSuggestions(true)
              }}
              placeholder={`Search with ${SEARCH_ENGINES[searchEngine].name} or enter URL...`}
              className="flex-1 bg-transparent border-none outline-none text-white text-xs placeholder-neutral-500 font-sans"
            />

            {/* Bookmark star */}
            <button
              type="button"
              onClick={toggleBookmark}
              disabled={activeTab.url === 'about:home'}
              className={`p-1 rounded hover:bg-white/10 transition ml-1 ${
                isCurrentBookmarked ? 'text-amber-400' : 'text-neutral-500 hover:text-white'
              }`}
              title={isCurrentBookmarked ? 'Bookmarked' : 'Bookmark this page'}
            >
              <Star size={14} className={isCurrentBookmarked ? 'fill-amber-400' : ''} />
            </button>
          </form>

          {/* Search suggestions popup */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-10 bg-neutral-900 border border-white/20 rounded-xl shadow-2xl p-1 z-50">
              {suggestions.map((sug, i) => (
                <div
                  key={i}
                  onMouseDown={() => {
                    setInputUrl(sug)
                    navigateTo(sug)
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/10 cursor-pointer transition"
                >
                  <Search size={12} className="text-neutral-500 shrink-0" />
                  <span className="truncate">{sug}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopyLink}
            disabled={activeTab.url === 'about:home'}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition"
            title="Copy URL"
          >
            {copiedLink ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
          </button>
          <button
            type="button"
            onClick={() => setShowHistory((h) => !h)}
            className={`p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition ${
              showHistory ? 'bg-white/15 text-white' : ''
            }`}
            title="Browsing History (Ctrl+H)"
          >
            <Clock size={15} />
          </button>
        </div>
      </div>

      {/* 3. Bookmarks Bar */}
      <div className="flex items-center gap-1.5 px-3 py-1 border-b border-white/5 bg-black/20 text-xs overflow-x-auto no-scrollbar shrink-0">
        {bookmarks.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => navigateTo(b.url)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition shrink-0 text-xs group"
          >
            <span className="w-3.5 h-3.5 rounded bg-white/10 text-[9px] font-bold flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
              {b.iconText}
            </span>
            <span className="truncate max-w-[130px]">{b.title}</span>
          </button>
        ))}
      </div>

      {/* 4. Main Web View Area */}
      <div className="flex-1 relative overflow-hidden bg-white select-text">
        {activeTab.url === 'about:home' ? (
          // Home / New Tab Page
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-925 to-neutral-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/25 mb-4 animate-in zoom-in-95 duration-200">
              <Globe size={32} className="text-white" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">NOVA Browser</h1>
            <p className="text-xs text-neutral-400 max-w-sm mb-6 leading-relaxed">
              Explore the web, read encyclopedia articles, and search with instant answers right inside NOVA OS.
            </p>

            {/* Centered Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                navigateTo(inputUrl)
              }}
              className="w-full max-w-md flex items-center bg-black/60 border border-white/20 focus-within:border-blue-500 rounded-2xl px-4 py-2.5 mb-8 shadow-2xl transition"
            >
              <Search size={15} className="text-neutral-400 mr-3 shrink-0" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder={`Search the web with ${SEARCH_ENGINES[searchEngine].name}...`}
                className="flex-1 bg-transparent border-none outline-none text-white text-xs placeholder-neutral-500"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition ml-2"
              >
                Search
              </button>
            </form>

            {/* Bookmarks Grid */}
            <div className="w-full max-w-lg">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-3 text-left px-1">
                Bookmarks & Speed Dial
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {bookmarks.map((bm) => (
                  <button
                    key={bm.id}
                    type="button"
                    onClick={() => navigateTo(bm.url)}
                    className="flex flex-col items-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 transition group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-blue-300 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition mb-2 shadow-sm">
                      {bm.iconText}
                    </div>
                    <span className="text-[11px] text-neutral-300 font-medium truncate w-full text-center">
                      {bm.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab.isSearch ? (
          // In-App Search Results SERP
          <div className="absolute inset-0 bg-neutral-950 text-neutral-200 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Search Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                    Results from {SEARCH_ENGINES[searchEngine].name}
                  </div>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    "{activeTab.searchQuery || 'Search'}"
                  </h2>
                </div>
                <a
                  href={SEARCH_ENGINES[searchEngine].queryUrl + encodeURIComponent(activeTab.searchQuery || '')}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
                >
                  <ExternalLink size={13} />
                  <span>Open in {SEARCH_ENGINES[searchEngine].name}</span>
                </a>
              </div>

              {/* Instant Answer Card */}
              {searchResults?.abstract && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/30 via-indigo-900/20 to-neutral-900 border border-blue-500/30 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1.5">
                    <BookOpen size={14} />
                    <span>Instant Knowledge</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{searchResults.abstract}</p>
                </div>
              )}

              {/* Search Result Items */}
              <div className="space-y-4">
                {searchResults?.results.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 transition group"
                  >
                    <div className="text-[11px] text-blue-400 font-mono truncate mb-1 flex items-center justify-between">
                      <span className="truncate">{item.url}</span>
                      {item.source && (
                        <span className="text-[10px] text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full ml-2 shrink-0">
                          {item.source}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo(item.url)}
                      className="text-sm font-semibold text-white group-hover:text-blue-300 transition text-left block"
                    >
                      {item.title}
                    </button>
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">{item.snippet}</p>
                    <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => navigateTo(item.url)}
                        className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                      >
                        <span>View in Browser</span>
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-500 hover:text-neutral-300 flex items-center gap-1"
                      >
                        <ExternalLink size={11} />
                        <span>Open Tab</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Related Searches */}
              {searchResults?.related && searchResults.related.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <div className="text-xs font-semibold text-neutral-400 mb-2.5">Related Queries</div>
                  <div className="flex flex-wrap gap-2">
                    {searchResults.related.map((rel, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => navigateTo(rel)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-neutral-300 hover:text-white transition"
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab.canEmbed ? (
          // Embeddable Iframe Mode
          <iframe
            ref={iframeRef}
            src={activeTab.url}
            title={activeTab.title}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
            onLoad={() => {
              setTabs((prev) =>
                prev.map((t) => (t.id === activeTab.id ? { ...t, isLoading: false } : t))
              )
            }}
          />
        ) : (
          // In-App Reader / Security Fallback for X-Frame-Options
          <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
              <ShieldAlert size={28} />
            </div>

            <h2 className="text-lg font-bold text-white mb-1.5">Web Frame Protection Active</h2>
            <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
              <span className="text-neutral-200 font-semibold">{activeTab.title}</span> requires direct browser access because it prohibits embedding via <code className="text-amber-300 bg-white/10 px-1.5 py-0.5 rounded font-mono">X-Frame-Options</code>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={activeTab.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/30 transition"
              >
                <ExternalLink size={14} />
                <span>Open in Web Tab</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  const query = activeTab.title.replace(/^https?:\/\//, '').split('/')[0]
                  navigateTo(query)
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition"
              >
                <Search size={14} />
                <span>Search This Site</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo('about:home')}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-medium text-xs transition"
              >
                Home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Slide-over Drawer */}
      {showHistory && (
        <div className="absolute right-0 top-10 bottom-0 w-80 bg-neutral-900/98 border-l border-white/15 backdrop-blur-2xl z-40 flex flex-col p-4 animate-in slide-in-from-right duration-150 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="font-semibold text-xs text-white flex items-center gap-1.5">
              <Clock size={13} className="text-blue-400" />
              <span>Browsing History</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setGlobalHistory([])
                  addNotification('History Cleared', 'Browsing history has been wiped.', 'browser')
                }}
                className="text-[11px] text-red-400 hover:text-red-300 font-medium"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-white/10"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {globalHistory.length === 0 ? (
              <div className="text-neutral-500 text-center py-12 text-xs">No history recorded</div>
            ) : (
              globalHistory.map((h, i) => (
                <div
                  key={i}
                  onClick={() => {
                    navigateTo(h.url)
                    setShowHistory(false)
                  }}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition text-neutral-300 hover:text-white group border border-transparent hover:border-white/10"
                >
                  <div className="truncate font-medium text-white group-hover:text-blue-300">{h.title}</div>
                  <div className="text-[10px] text-neutral-500 truncate mt-0.5">{h.url}</div>
                  <div className="text-[9px] text-neutral-600 mt-1">{new Date(h.time).toLocaleTimeString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
