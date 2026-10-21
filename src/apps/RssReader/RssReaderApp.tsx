import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Rss, Star, ExternalLink, Bookmark, CheckCheck, RefreshCw, Clock } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface RssArticle {
  id: string
  title: string
  source: string
  category: 'Tech' | 'AI' | 'Science' | 'Design'
  date: string
  readTime: string
  summary: string
  content: string
  url: string
}

const ARTICLES: RssArticle[] = [
  {
    id: 'art-1',
    title: 'The Next Wave of WebAssembly & Micro-Operating Systems',
    source: 'TechCrunch',
    category: 'Tech',
    date: '2 hours ago',
    readTime: '4 min read',
    summary: 'How browser-based operating systems are unlocking native desktop power directly in client runtimes.',
    content: `Browser sandboxes have evolved from static document viewers into fully distributed compute engines. With WebAssembly, WebGL 2.0, and modern Multi-Threading via Web Workers, high-performance operating systems like NOVA OS can run complex workloads at near-native speeds.

Developers can now build entire productivity suites, 3D game engines, and terminal environments with zero installation footprints.`,
    url: 'https://techcrunch.com'
  },
  {
    id: 'art-2',
    title: 'Generative Neural Radiance Fields in Real-Time Browser 3D',
    source: 'AI Horizons',
    category: 'AI',
    date: '4 hours ago',
    readTime: '6 min read',
    summary: 'Recent breakthroughs in WebGL neural rendering enable 60 FPS real-time 3D reconstruction.',
    content: `Researchers have demonstrated real-time 3D volumetric scene rendering directly in the browser using WebGL compute shaders and lightweight neural networks.

This opens unprecedented doors for browser-based CAD, gaming worlds, and immersive spatial desktop environments.`,
    url: 'https://arxiv.org'
  },
  {
    id: 'art-3',
    title: 'Deep Space Optical Communications Smashes Data Transfer Record',
    source: 'NASA Tech',
    category: 'Science',
    date: 'Yesterday',
    readTime: '3 min read',
    summary: 'Laser communication transmission from 140 million miles away achieves 25 Mbps bandwidth.',
    content: `NASA's Deep Space Optical Communications (DSOC) experiment has sent a near-infrared laser signal from far beyond Mars back to Earth at broadband speeds.

This technology paves the way for live high-definition video feeds from human missions to Mars.`,
    url: 'https://nasa.gov'
  },
  {
    id: 'art-4',
    title: 'The Enduring Appeal of Glassmorphic & Skeuomorphic Hybrid UI',
    source: 'Design Digest',
    category: 'Design',
    date: '2 days ago',
    readTime: '5 min read',
    summary: 'Why modern operating system interfaces are embracing subtle depth, optical refraction, and materials.',
    content: `Flat design has run its course. Modern operating systems are converging on physical metaphors—optical blurs, dynamic light refraction, and subtle depth hierarchies.

By utilizing CSS backdrop-filter and hardware acceleration, interfaces feel alive without being skeuomorphic or distracting.`,
    url: 'https://design.org'
  }
]

export const RssReaderApp: React.FC<AppInstanceProps> = () => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(ARTICLES[0].id)
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set(['art-1']))

  const filteredArticles = ARTICLES.filter(a => {
    if (filterCategory === 'Starred') return starredIds.has(a.id)
    if (filterCategory === 'All') return true
    return a.category === filterCategory
  })

  const currentArticle = ARTICLES.find(a => a.id === selectedArticleId) || ARTICLES[0]

  const toggleStar = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    soundService.playClick()
    setStarredIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden">
      {/* Category Sidebar */}
      <div className="w-44 bg-neutral-950/60 border-r border-white/10 p-3 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 px-2 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            <Rss className="w-3.5 h-3.5 text-amber-500" />
            <span>Feeds</span>
          </div>

          {['All', 'Tech', 'AI', 'Science', 'Design', 'Starred'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                soundService.playClick()
                setFilterCategory(cat)
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <span>{cat}</span>
              {cat === 'Starred' && starredIds.size > 0 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded-full font-bold">
                  {starredIds.size}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="text-[10px] text-neutral-500 text-center py-2 border-t border-white/5">
          NOVA RSS Engine v2.0
        </div>
      </div>

      {/* Article List Pane */}
      <div className="w-72 bg-neutral-900/80 border-r border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>{filteredArticles.length} Stories</span>
          <button
            onClick={() => soundService.playNotification()}
            className="hover:text-white p-1 rounded"
            title="Refresh feeds"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {filteredArticles.map(article => {
            const isSelected = article.id === selectedArticleId
            const isStarred = starredIds.has(article.id)
            return (
              <div
                key={article.id}
                onClick={() => {
                  soundService.playClick()
                  setSelectedArticleId(article.id)
                }}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-600/15 border-l-2 border-blue-500' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">
                    {article.source}
                  </span>
                  <button
                    onClick={(e) => toggleStar(article.id, e)}
                    className="text-neutral-500 hover:text-amber-400 transition-colors p-0.5"
                  >
                    <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                <h4 className="text-xs font-medium text-neutral-200 line-clamp-2 leading-snug mb-1">
                  {article.title}
                </h4>

                <div className="flex items-center space-x-2 text-[10px] text-neutral-500">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Article Reader Pane */}
      <div className="flex-1 bg-neutral-950/40 p-8 overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 font-medium">
              {currentArticle.category}
            </span>
            <div className="flex items-center space-x-3 text-xs text-neutral-400">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentArticle.readTime}</span>
              </span>
              <button
                onClick={(e) => toggleStar(currentArticle.id, e)}
                className="hover:text-amber-400 transition-colors"
              >
                <Star className={`w-4 h-4 ${starredIds.has(currentArticle.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
            {currentArticle.title}
          </h1>

          <div className="text-xs text-neutral-400 flex items-center space-x-2">
            <span className="font-semibold text-neutral-300">{currentArticle.source}</span>
            <span>•</span>
            <span>Published {currentArticle.date}</span>
          </div>

          <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs italic text-neutral-300 leading-relaxed">
            "{currentArticle.summary}"
          </div>

          <div className="text-sm text-neutral-300 leading-relaxed space-y-3 pt-2">
            {currentArticle.content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
