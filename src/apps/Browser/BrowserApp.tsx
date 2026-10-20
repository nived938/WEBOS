import React, { useState, useEffect, useRef } from 'react'
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
  ShieldAlert,
  Globe,
  Clock,
  Trash2,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface BrowserTab {
  id: string
  title: string
  url: string
  canEmbed: boolean
  history: string[]
  historyIndex: number
  isLoading: boolean
}

interface Bookmark {
  title: string
  url: string
  iconText: string
  embeddable: boolean
}

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    title: 'Wikipedia',
    url: 'https://en.m.wikipedia.org/wiki/Main_Page',
    iconText: 'W',
    embeddable: true,
  },
  {
    title: 'OpenStreetMap',
    url: 'https://www.openstreetmap.org/export/embed.html',
    iconText: 'OSM',
    embeddable: true,
  },
  {
    title: 'DevDocs',
    url: 'https://devdocs.io',
    iconText: 'DD',
    embeddable: true,
  },
  {
    title: 'Hacker News',
    url: 'https://news.ycombinator.com',
    iconText: 'HN',
    embeddable: false, // demonstrates fallback card
  },
  {
    title: 'GitHub',
    url: 'https://github.com',
    iconText: 'GH',
    embeddable: false, // demonstrates fallback card
  },
]

const SEARCH_ENGINES = {
  duckduckgo: { name: 'DuckDuckGo', queryUrl: 'https://duckduckgo.com/?q=' },
  google: { name: 'Google', queryUrl: 'https://www.google.com/search?q=' },
  bing: { name: 'Bing', queryUrl: 'https://www.bing.com/search?q=' },
  wikipedia: { name: 'Wikipedia', queryUrl: 'https://en.m.wikipedia.org/wiki/Special:Search?search=' },
}

export const BrowserApp: React.FC<AppInstanceProps> = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'New Tab',
      url: 'about:home',
      canEmbed: true,
      history: ['about:home'],
      historyIndex: 0,
      isLoading: false,
    },
  ])
  const [activeTabId, setActiveTabId] = useState<string>('tab-1')
  const [inputUrl, setInputUrl] = useState('about:home')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(DEFAULT_BOOKMARKS)
  const [searchEngine, setSearchEngine] = useState<keyof typeof SEARCH_ENGINES>('duckduckgo')
  const [showHistory, setShowHistory] = useState(false)
  const [globalHistory, setGlobalHistory] = useState<{ url: string; title: string; time: number }[]>([])

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Sync inputUrl when active tab changes
  useEffect(() => {
    if (activeTab) {
      setInputUrl(activeTab.url === 'about:home' ? '' : activeTab.url)
    }
  }, [activeTabId, activeTab])

  const navigateTo = (url: string) => {
    let resolvedUrl = url.trim()
    if (!resolvedUrl) return

    soundService.playClick()

    // If query without protocol or domain, use search engine
    if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://') && !resolvedUrl.startsWith('about:')) {
      if (resolvedUrl.includes('.') && !resolvedUrl.includes(' ')) {
        resolvedUrl = 'https://' + resolvedUrl
      } else {
        // Search query
        resolvedUrl = SEARCH_ENGINES[searchEngine].queryUrl + encodeURIComponent(resolvedUrl)
      }
    }

    // Determine if site allows iframe embedding
    const isEmbeddable =
      resolvedUrl.startsWith('about:') ||
      resolvedUrl.includes('wikipedia.org') ||
      resolvedUrl.includes('openstreetmap.org') ||
      resolvedUrl.includes('devdocs.io') ||
      resolvedUrl.includes('codepen.io')

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) return tab
        const newHist = tab.history.slice(0, tab.historyIndex + 1).concat([resolvedUrl])
        return {
          ...tab,
          url: resolvedUrl,
          title: resolvedUrl === 'about:home' ? 'New Tab' : new URL(resolvedUrl).hostname,
          canEmbed: isEmbeddable,
          history: newHist,
          historyIndex: newHist.length - 1,
          isLoading: resolvedUrl !== 'about:home',
        }
      })
    )

    if (resolvedUrl !== 'about:home') {
      setGlobalHistory((prev) => [
        { url: resolvedUrl, title: resolvedUrl, time: Date.now() },
        ...prev.slice(0, 49),
      ])
    }
  }

  const handleCreateTab = () => {
    soundService.playClick()
    const newId = 'tab-' + Date.now()
    const newTab: BrowserTab = {
      id: newId,
      title: 'New Tab',
      url: 'about:home',
      canEmbed: true,
      history: ['about:home'],
      historyIndex: 0,
      isLoading: false,
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newId)
  }

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    soundService.playClick()
    if (tabs.length === 1) {
      // Don't close last tab, just reset to home
      setTabs([
        {
          id: 'tab-1',
          title: 'New Tab',
          url: 'about:home',
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
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab.id ? { ...t, historyIndex: targetIdx, url: targetUrl } : t))
    )
  }

  const handleForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return
    soundService.playClick()
    const targetIdx = activeTab.historyIndex + 1
    const targetUrl = activeTab.history[targetIdx]
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab.id ? { ...t, historyIndex: targetIdx, url: targetUrl } : t))
    )
  }

  const handleReload = () => {
    soundService.playClick()
    if (iframeRef.current && activeTab.url !== 'about:home') {
      iframeRef.current.src = activeTab.url
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900/90 text-neutral-200 select-none backdrop-blur-xl relative">
      {/* 1. Tabs Bar */}
      <div className="flex items-center gap-1 px-3 pt-2 bg-neutral-950/60 border-b border-white/10 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <div
              key={tab.id}
              onClick={() => {
                soundService.playClick()
                setActiveTabId(tab.id)
              }}
              className={`group flex items-center gap-2 max-w-[180px] min-w-[120px] px-3 py-1.5 rounded-t-xl text-xs font-medium cursor-pointer transition border-t border-x ${
                isActive
                  ? 'bg-neutral-900 border-white/15 text-white shadow-sm'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              <Globe size={13} className={isActive ? 'text-blue-400 shrink-0' : 'text-neutral-500 shrink-0'} />
              <span className="truncate flex-1">{tab.title}</span>
              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition"
              >
                <X size={12} />
              </button>
            </div>
          )
        })}

        <button
          onClick={handleCreateTab}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
          title="New Tab"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* 2. Navigation & Address Bar Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-neutral-900/40">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={activeTab.historyIndex <= 0}
            className="p-1 rounded-md text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition"
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={handleForward}
            disabled={activeTab.historyIndex >= activeTab.history.length - 1}
            className="p-1 rounded-md text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition"
            title="Forward"
          >
            <ArrowRight size={16} />
          </button>
          <button
            onClick={handleReload}
            className="p-1 rounded-md text-neutral-400 hover:text-white transition"
            title="Reload"
          >
            <RotateCw size={15} />
          </button>
          <button
            onClick={() => navigateTo('about:home')}
            className="p-1 rounded-md text-neutral-400 hover:text-white transition"
            title="Home"
          >
            <Home size={15} />
          </button>
        </div>

        {/* Address / Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            navigateTo(inputUrl)
          }}
          className="flex-1 flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus-within:border-blue-500/70 transition"
        >
          <Search size={13} className="text-neutral-500 mr-2 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Search with DuckDuckGo or enter website URL..."
            className="flex-1 bg-transparent border-none outline-none text-white text-xs placeholder-neutral-500 font-sans"
          />
        </form>

        {/* History drawer toggle */}
        <button
          onClick={() => setShowHistory((h) => !h)}
          className={`p-1.5 rounded-md text-neutral-400 hover:text-white transition ${
            showHistory ? 'bg-white/10 text-white' : ''
          }`}
          title="Browsing History"
        >
          <Clock size={16} />
        </button>
      </div>

      {/* 3. Bookmarks Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 bg-black/15 text-xs overflow-x-auto no-scrollbar">
        {bookmarks.map((b) => (
          <button
            key={b.title}
            onClick={() => navigateTo(b.url)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition shrink-0"
          >
            <span className="w-4 h-4 rounded bg-white/10 text-[10px] font-bold flex items-center justify-center text-blue-400">
              {b.iconText}
            </span>
            <span>{b.title}</span>
          </button>
        ))}
      </div>

      {/* 4. Main Web View Area */}
      <div className="flex-1 relative overflow-hidden bg-white">
        {activeTab.url === 'about:home' ? (
          // Home Page
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4">
              <Globe size={32} className="text-white" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">NOVA Browser</h1>
            <p className="text-xs text-neutral-400 max-w-sm mb-6">
              Browse securely within NOVA OS. Websites with frame restrictions offer seamless external viewing options.
            </p>

            {/* Quick Favorites Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 max-w-md w-full">
              {bookmarks.map((bm) => (
                <button
                  key={bm.title}
                  onClick={() => navigateTo(bm.url)}
                  className="flex flex-col items-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-blue-300 group-hover:scale-105 transition mb-2">
                    {bm.iconText}
                  </div>
                  <span className="text-[11px] text-neutral-300 font-medium truncate w-full text-center">
                    {bm.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : activeTab.canEmbed ? (
          // Embeddable Iframe Mode
          <iframe
            ref={iframeRef}
            src={activeTab.url}
            title={activeTab.title}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => {
              setTabs((prev) =>
                prev.map((t) => (t.id === activeTab.id ? { ...t, isLoading: false } : t))
              )
            }}
          />
        ) : (
          // Graceful Fallback Card when embedding is restricted
          <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
              <ShieldAlert size={28} />
            </div>

            <h2 className="text-lg font-bold text-white mb-1">Embedding Security Restriction</h2>
            <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
              <span className="text-neutral-200 font-semibold">{activeTab.title}</span> restricts being embedded inside web iframes due to its <code className="text-amber-400 bg-white/5 px-1 py-0.5 rounded">X-Frame-Options</code> or Content Security Policy.
            </p>

            <div className="flex gap-3">
              <a
                href={activeTab.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/30 transition"
              >
                <ExternalLink size={14} /> Open in New Tab
              </a>
              <button
                onClick={() => navigateTo('about:home')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Slide-over Drawer */}
      {showHistory && (
        <div className="absolute right-0 top-12 bottom-0 w-72 bg-neutral-900/95 border-l border-white/10 backdrop-blur-2xl z-20 flex flex-col p-4 animate-in slide-in-from-right duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
            <span className="font-semibold text-xs text-white">Browsing History</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGlobalHistory([])}
                className="text-[11px] text-red-400 hover:text-red-300"
              >
                Clear
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {globalHistory.length === 0 ? (
              <div className="text-neutral-500 text-center py-8 text-xs">No history recorded</div>
            ) : (
              globalHistory.map((h, i) => (
                <div
                  key={i}
                  onClick={() => {
                    navigateTo(h.url)
                    setShowHistory(false)
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition truncate text-neutral-300 hover:text-white"
                >
                  <div className="truncate font-medium">{h.title}</div>
                  <div className="text-[10px] text-neutral-500 truncate">{h.url}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
