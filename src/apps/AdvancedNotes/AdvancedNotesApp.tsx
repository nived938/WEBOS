import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import {
  Folder,
  Tag,
  Search,
  Plus,
  Trash2,
  FileText,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react'

interface NoteItem {
  id: string
  folder: string
  title: string
  content: string
  tags: string[]
  updatedAt: string
}

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'n1',
    folder: 'Work',
    title: 'Compositor Optimization Log',
    content: `# Compositor Optimization Log\n\n- Switched to double-buffered canvas contexts\n- Applied CSS \`backdrop-filter: blur(24px)\` with fallback\n- Memory profiling confirms zero uncollected GPU textures.`,
    tags: ['performance', 'engine'],
    updatedAt: '10:45 AM',
  },
  {
    id: 'n2',
    folder: 'Work',
    title: 'Weekly Standup Notes',
    content: `# Weekly Standup\n\n1. Implemented complete 51-application catalog.\n2. Built Ubuntu GNOME-inspired Activities Overview.\n3. Verified virtual workspaces multi-tasking.`,
    tags: ['standup', 'meeting'],
    updatedAt: 'Yesterday',
  },
  {
    id: 'n3',
    folder: 'Personal',
    title: 'Book Recommendations',
    content: `# Reading List\n\n- Designing Data-Intensive Applications\n- Crafting Interpreters\n- Clean Code`,
    tags: ['reading'],
    updatedAt: '3 days ago',
  },
]

export const AdvancedNotesApp: React.FC<AppInstanceProps> = () => {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const stored = localStorage.getItem('nova_advanced_notes')
      return stored ? JSON.parse(stored) : INITIAL_NOTES
    } catch {
      return INITIAL_NOTES
    }
  })
  const [activeFolder, setActiveFolder] = useState<string>('All')
  const [selectedNoteId, setSelectedNoteId] = useState<string>('n1')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    localStorage.setItem('nova_advanced_notes', JSON.stringify(notes))
  }, [notes])

  const folders = ['All', 'Work', 'Personal', 'Ideas']

  const filteredNotes = notes.filter((n) => {
    const matchesFolder = activeFolder === 'All' || n.folder === activeFolder
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFolder && matchesSearch
  })

  const currentNote = notes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || notes[0]

  const handleCreateNote = () => {
    soundService.play('buttonClick')
    const newNote: NoteItem = {
      id: 'n_' + Date.now(),
      folder: activeFolder === 'All' ? 'Work' : activeFolder,
      title: 'Untitled Note',
      content: '# New Note\n\nStart typing your markdown notes here...',
      tags: ['draft'],
      updatedAt: 'Just now',
    }
    setNotes((prev) => [newNote, ...prev])
    setSelectedNoteId(newNote.id)
  }

  const handleDeleteNote = (id: string) => {
    soundService.play('buttonClick')
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (selectedNoteId === id) {
      setSelectedNoteId(notes.find((n) => n.id !== id)?.id || '')
    }
  }

  return (
    <div className="flex h-full bg-[#18181f] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Sidebar Folders */}
      <div className="w-48 bg-black/40 border-r border-white/10 p-3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
            Folders
          </span>
          <button
            onClick={handleCreateNote}
            className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            title="New Note"
          >
            <Plus size={12} />
          </button>
        </div>

        <div className="space-y-1">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => {
                soundService.play('buttonClick')
                setActiveFolder(f)
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFolder === f
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-white/10 text-neutral-400'
              }`}
            >
              <Folder size={14} /> {f}
            </button>
          ))}
        </div>
      </div>

      {/* Note List */}
      <div className="w-64 bg-black/20 border-r border-white/10 flex flex-col">
        {/* Search */}
        <div className="p-2.5 border-b border-white/10">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                soundService.play('buttonClick')
                setSelectedNoteId(note.id)
              }}
              className={`p-3 cursor-pointer transition-colors group ${
                currentNote?.id === note.id ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white truncate">{note.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteNote(note.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-0.5"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                {note.content.replace(/^#+\s+/gm, '')}
              </p>
              <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-500">
                <span>{note.updatedAt}</span>
                <span className="bg-white/5 px-1.5 py-0.5 rounded text-neutral-400">
                  {note.folder}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor & Preview Area */}
      {currentNote ? (
        <div className="flex-1 flex flex-col bg-[#1e1e26]">
          {/* Top Note Bar */}
          <div className="px-6 py-2.5 border-b border-white/10 bg-black/30 flex items-center justify-between">
            <input
              type="text"
              value={currentNote.title}
              onChange={(e) => {
                const title = e.target.value
                setNotes((prev) =>
                  prev.map((n) => (n.id === currentNote.id ? { ...n, title } : n))
                )
              }}
              className="bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b border-blue-500 w-72"
            />

            <button
              onClick={() => {
                soundService.play('buttonClick')
                setPreviewMode(!previewMode)
              }}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
                previewMode ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
              }`}
            >
              {previewMode ? <EyeOff size={14} /> : <Eye size={14} />}
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 overflow-auto">
            {previewMode ? (
              <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-sans select-text">
                {currentNote.content}
              </div>
            ) : (
              <textarea
                value={currentNote.content}
                onChange={(e) => {
                  const content = e.target.value
                  setNotes((prev) =>
                    prev.map((n) => (n.id === currentNote.id ? { ...n, content } : n))
                  )
                }}
                className="w-full h-full bg-transparent resize-none focus:outline-none text-sm text-neutral-200 font-mono leading-relaxed select-text"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
          Select or create a note to begin
        </div>
      )}
    </div>
  )
}
