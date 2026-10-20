import React, { useState, useEffect, useRef } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import type { AppId } from '@/types'
import { soundService } from '@/core/audio/soundService'
import {
  Search,
  AppWindow,
  FileText,
  Folder,
  Calculator,
  Sliders,
  Globe,
  ArrowRight,
} from 'lucide-react'

interface SpotlightItem {
  id: string
  type: 'app' | 'file' | 'setting' | 'calc' | 'web'
  title: string
  subtitle: string
  icon: React.ComponentType<{ size: number; className?: string }>
  action: () => void
}

interface SpotlightProps {
  isOpen: boolean
  onClose: () => void
}

export const Spotlight: React.FC<SpotlightProps> = ({ isOpen, onClose }) => {
  const { openApp } = useWindowManager()
  const { searchFiles } = useFileSystem()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Build search results
  const results: SpotlightItem[] = []

  if (query.trim()) {
    const q = query.toLowerCase()

    // 1. Math calculation detection (e.g. 50 * 4)
    if (/^[\d\s+\-*/().%^]+$/.test(query.trim()) && /[+\-*/%]/.test(query)) {
      try {
        // Safe evaluation of basic arithmetic
        const sanitized = query.replace(/[^0-9+\-*/().%]/g, '')
        const calculated = Function(`'use strict'; return (${sanitized})`)()
        if (typeof calculated === 'number' && !isNaN(calculated)) {
          results.push({
            id: 'calc-result',
            type: 'calc',
            title: `${query} = ${calculated}`,
            subtitle: 'Calculation Result • Press Enter to open Calculator',
            icon: Calculator,
            action: () => {
              openApp('calculator')
              onClose()
            },
          })
        }
      } catch {
        // Ignore math parse errors
      }
    }

    // 2. Apps search
    Object.values(APPS_REGISTRY).forEach((app) => {
      if (
        app.title.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: `app-${app.id}`,
          type: 'app',
          title: app.title,
          subtitle: `Application • ${app.category}`,
          icon: AppWindow,
          action: () => {
            openApp(app.id)
            onClose()
          },
        })
      }
    })

    // 3. Files search
    const matchingFiles = searchFiles(query)
    matchingFiles.slice(0, 5).forEach((f) => {
      results.push({
        id: `file-${f.id}`,
        type: 'file',
        title: f.name,
        subtitle: `${f.type === 'folder' ? 'Folder' : 'File'} in Virtual Storage`,
        icon: f.type === 'folder' ? Folder : FileText,
        action: () => {
          if (f.type === 'folder') {
            openApp('finder', { folderId: f.id })
          } else {
            openApp('finder')
          }
          onClose()
        },
      })
    })

    // 4. Web Search fallback option
    results.push({
      id: 'web-search',
      type: 'web',
      title: `Search Web for "${query}"`,
      subtitle: 'Open in NOVA Browser',
      icon: Globe,
      action: () => {
        openApp('browser')
        onClose()
      },
    })
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        results[selectedIndex].action()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-md flex items-start justify-center pt-28 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-neutral-900/85 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
      >
        {/* Search input field */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10">
          <Search size={20} className="text-neutral-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search apps, files, or calculations..."
            className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder-neutral-500 font-sans"
          />
          <span className="text-[10px] text-neutral-400 font-mono bg-white/10 px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Results List */}
        {query.trim() && (
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {results.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-500">
                No matching results found
              </div>
            ) : (
              results.map((item, idx) => {
                const IconComp = item.icon
                const isSelected = idx === selectedIndex
                return (
                  <div
                    key={item.id}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                      isSelected ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-neutral-300'
                        }`}
                      >
                        <IconComp size={16} />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate">{item.title}</div>
                        <div
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-blue-100' : 'text-neutral-400'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    {isSelected && <ArrowRight size={14} className="text-white shrink-0 ml-2" />}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
