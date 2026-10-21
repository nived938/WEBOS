import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Globe, Search, BookOpen, ExternalLink, Bookmark, Sparkles } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface WikiSummary {
  title: string
  extract: string
  description?: string
  thumbnail?: { source: string }
  url?: string
}

const FEATURED_TOPICS = [
  'Operating system',
  'Quantum computing',
  'Solar System',
  'James Webb Space Telescope',
  'Alan Turing'
]

export const WikipediaApp: React.FC<AppInstanceProps> = () => {
  const [query, setQuery] = useState('Operating system')
  const [summary, setSummary] = useState<WikiSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchArticle = async (title: string) => {
    soundService.playClick()
    setLoading(true)
    setError(null)

    try {
      const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error('Article not found')
      const data = await res.json()
      setSummary({
        title: data.title,
        extract: data.extract,
        description: data.description,
        thumbnail: data.thumbnail,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
      })
    } catch {
      // Fallback offline mock if offline or restricted
      setSummary({
        title: title,
        description: 'Encyclopedic Overview',
        extract: `${title} is a foundational domain in computer science and modern systems engineering, encompassing hardware abstraction, task scheduling, memory management, and user interfaces. Operating systems form the bridge between raw silicon components and human-centric software applications.`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticle('Operating system')
  }, [])

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Search Bar */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-white">Wikipedia Reader</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (query.trim()) fetchArticle(query.trim())
          }}
          className="flex-1 max-w-sm relative"
        >
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Wikipedia..."
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-sky-500"
          />
        </form>

        <button
          onClick={() => query.trim() && fetchArticle(query.trim())}
          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-white font-medium shadow-sm"
        >
          Explore
        </button>
      </div>

      {/* Featured Topics Carousel */}
      <div className="px-4 py-2 bg-neutral-950/60 border-b border-white/5 flex items-center space-x-2 overflow-x-auto">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider shrink-0">Featured:</span>
        {FEATURED_TOPICS.map(topic => (
          <button
            key={topic}
            onClick={() => {
              setQuery(topic)
              fetchArticle(topic)
            }}
            className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 text-xs shrink-0 transition-colors"
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Article Content Pane */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center items-start">
        {loading ? (
          <div className="text-center py-20 text-neutral-400">Loading encyclopedic article...</div>
        ) : summary ? (
          <div className="max-w-2xl w-full bg-neutral-950/70 border border-white/10 rounded-2xl p-7 space-y-5 shadow-2xl">
            <div className="border-b border-white/10 pb-4">
              <h1 className="text-3xl font-serif font-bold text-white tracking-tight">{summary.title}</h1>
              {summary.description && (
                <p className="text-sm text-sky-400 mt-1 capitalize font-medium">{summary.description}</p>
              )}
            </div>

            {summary.thumbnail && (
              <div className="float-right ml-4 mb-3 rounded-xl overflow-hidden border border-white/10 max-w-[200px]">
                <img src={summary.thumbnail.source} alt={summary.title} className="w-full h-auto object-cover" />
              </div>
            )}

            <div className="text-sm text-neutral-200 leading-relaxed font-serif space-y-4">
              {summary.extract.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
              <span>Source: Wikipedia, The Free Encyclopedia</span>
              {summary.url && (
                <a
                  href={summary.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-sky-400 hover:text-sky-300"
                >
                  <span>Read full entry on web</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
