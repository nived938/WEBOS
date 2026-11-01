import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Clipboard, Copy, Check, Pin, Trash2, Search } from 'lucide-react'

interface ClipItem {
  id: string
  content: string
  type: 'text' | 'link' | 'code'
  pinned: boolean
  timestamp: string
}

const INITIAL_CLIPS: ClipItem[] = [
  { id: '1', content: 'https://github.com/nived938/WEBOS.git', type: 'link', pinned: true, timestamp: '10:14 AM' },
  { id: '2', content: 'backdrop-filter: blur(24px) saturate(160%);', type: 'code', pinned: true, timestamp: '10:30 AM' },
  { id: '3', content: 'npm run test && npm run build', type: 'code', pinned: false, timestamp: '11:05 AM' },
  { id: '4', content: 'Quarterly review presentation outline finalized.', type: 'text', pinned: false, timestamp: '11:42 AM' },
]

export const ClipboardManagerApp: React.FC<AppInstanceProps> = () => {
  const [clips, setClips] = useState<ClipItem[]>(INITIAL_CLIPS)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleCopy = (id: string, text: string) => {
    soundService.play('buttonClick')
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const togglePin = (id: string) => {
    soundService.play('buttonClick')
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    )
  }

  const deleteClip = (id: string) => {
    soundService.play('buttonClick')
    setClips((prev) => prev.filter((c) => c.id !== id))
  }

  const filtered = clips.filter((c) =>
    c.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clipboard size={16} className="text-blue-400" />
          <span className="font-semibold text-white text-xs">Clipboard History & Vault</span>
        </div>

        <button
          onClick={() => {
            soundService.play('buttonClick')
            setClips((prev) => prev.filter((c) => c.pinned))
          }}
          className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
        >
          Clear Unpinned
        </button>
      </div>

      {/* Search */}
      <div className="p-2.5 border-b border-white/10 bg-black/20">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search clipboard history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-7 pr-2.5 py-1 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Clips List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all flex items-center justify-between group"
          >
            <div className="flex-1 pr-4 min-w-0">
              <p className="text-xs font-mono text-neutral-200 truncate select-text">
                {item.content}
              </p>
              <span className="text-[10px] text-neutral-500 mt-0.5 block">{item.timestamp}</span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => togglePin(item.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  item.pinned ? 'text-amber-400 bg-amber-400/20' : 'text-neutral-400 hover:bg-white/10'
                }`}
                title="Pin Item"
              >
                <Pin size={13} />
              </button>
              <button
                onClick={() => handleCopy(item.id, item.content)}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow"
                title="Copy to Clipboard"
              >
                {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
              </button>
              <button
                onClick={() => deleteClip(item.id)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-red-400"
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
