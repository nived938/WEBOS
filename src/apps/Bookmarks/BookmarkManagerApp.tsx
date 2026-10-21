import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Bookmark, Plus, Trash2, Search, ExternalLink, Folder, Tag, Share2 } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface BookmarkItem {
  id: string
  title: string
  url: string
  category: string
  tags: string[]
  dateAdded: string
}

const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  { id: 'bm-1', title: 'GitHub', url: 'https://github.com', category: 'Development', tags: ['code', 'git'], dateAdded: 'Today' },
  { id: 'bm-2', title: 'DuckDuckGo', url: 'https://duckduckgo.com', category: 'Tools', tags: ['search', 'privacy'], dateAdded: 'Today' },
  { id: 'bm-3', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', category: 'Development', tags: ['javascript', 'docs'], dateAdded: 'Yesterday' },
  { id: 'bm-4', title: 'Three.js Library', url: 'https://threejs.org', category: 'Development', tags: ['3d', 'webgl'], dateAdded: '3 days ago' },
  { id: 'bm-5', title: 'Wikipedia Free Encyclopedia', url: 'https://wikipedia.org', category: 'Reading', tags: ['reference', 'knowledge'], dateAdded: 'Last week' },
  { id: 'bm-6', title: 'Hacker News', url: 'https://news.ycombinator.com', category: 'Reading', tags: ['tech', 'news'], dateAdded: 'Last week' },
]

export const BookmarkManagerApp: React.FC<AppInstanceProps> = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('nova_bookmarks')
      return saved ? JSON.parse(saved) : DEFAULT_BOOKMARKS
    } catch {
      return DEFAULT_BOOKMARKS
    }
  })

  const [activeFolder, setActiveFolder] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newCategory, setNewCategory] = useState('Development')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('nova_bookmarks', JSON.stringify(bookmarks))
    } catch {}
  }, [bookmarks])

  const folders = ['All', 'Development', 'Tools', 'Reading', 'Personal']

  const filteredBookmarks = bookmarks.filter(b => {
    const matchesFolder = activeFolder === 'All' || b.category === activeFolder
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFolder && matchesSearch
  })

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newUrl.trim()) return

    let formattedUrl = newUrl.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl
    }

    const item: BookmarkItem = {
      id: 'bm-' + Date.now(),
      title: newTitle.trim(),
      url: formattedUrl,
      category: newCategory,
      tags: ['web'],
      dateAdded: 'Just now'
    }

    soundService.playNotification()
    setBookmarks(prev => [item, ...prev])
    setNewTitle('')
    setNewUrl('')
    setShowAddModal(false)
  }

  const handleDelete = (id: string) => {
    soundService.playClick()
    setBookmarks(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="flex h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden">
      {/* Sidebar Folders */}
      <div className="w-48 bg-neutral-950/60 border-r border-white/10 p-3 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1.5 flex items-center space-x-1.5">
            <Folder className="w-3.5 h-3.5 text-blue-400" />
            <span>Collections</span>
          </div>
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => {
                soundService.playClick()
                setActiveFolder(folder)
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFolder === folder ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              {folder}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            soundService.playClick()
            setShowAddModal(true)
          }}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white flex items-center justify-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bookmark</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col bg-neutral-900/60 overflow-hidden">
        {/* Search & Actions Bar */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search bookmarks, URLs, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-neutral-400">{filteredBookmarks.length} Items</span>
        </div>

        {/* List of Bookmarks */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 text-xs">
              No bookmarks found in this collection.
            </div>
          ) : (
            filteredBookmarks.map(b => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-white truncate">{b.title}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{b.url}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/5">
                    {b.category}
                  </span>
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => soundService.playClick()}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
                    title="Open external link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleAddBookmark}
            className="bg-neutral-800 border border-white/10 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Add New Bookmark</h3>
            
            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. GitHub"
                className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">URL</label>
              <input
                type="text"
                required
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {folders.filter(f => f !== 'All').map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
