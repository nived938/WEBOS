import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import {
  Folder,
  Plus,
  Trash2,
  Search,
  Bold,
  Italic,
  List,
  CheckSquare,
  Heading1,
  Heading2,
  Code,
  Clock,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface Note {
  id: string
  folderId: string
  title: string
  content: string
  updatedAt: number
}

const STORAGE_KEY = 'nova_os_notes_data'

const DEFAULT_FOLDERS = [
  { id: 'all', name: 'All Notes' },
  { id: 'quick', name: 'Quick Notes' },
  { id: 'work', name: 'Work' },
  { id: 'personal', name: 'Personal' },
]

const INITIAL_NOTES: Note[] = [
  {
    id: 'note-welcome',
    folderId: 'quick',
    title: 'Welcome to NOVA Notes',
    content: `# Welcome to NOVA Notes ✍️

NOVA Notes is your minimal, distraction-free writing environment.

### Features
- **Autosave**: Everything is saved immediately to local storage.
- **Organization**: Sort notes by category or search instantly.
- **Formatting**: Quick formatting options available in the toolbar above.

Enjoy organizing your thoughts on NOVA OS!`,
    updatedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'note-roadmap',
    folderId: 'work',
    title: 'NOVA OS Architecture Plan',
    content: `# System Architecture Checklist

- [x] High performance window manager with drag & resize
- [x] Procedural Web Audio sound system
- [x] IndexedDB Virtual File System
- [x] Spotlight system search
- [x] 2D Canvas Platformer "Nova Odyssey"
- [ ] Explore custom user themes`,
    updatedAt: Date.now() - 1000 * 60 * 120,
  },
  {
    id: 'note-ideas',
    folderId: 'personal',
    title: 'Books to Read',
    content: `### Reading List for this Year:
1. Designing Data-Intensive Applications
2. The Design of Everyday Things
3. Structure and Interpretation of Computer Programs
4. Gödel, Escher, Bach`,
    updatedAt: Date.now() - 1000 * 60 * 360,
  },
]

export const NotesApp: React.FC<AppInstanceProps> = ({ initialArgs }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // Ignore
    }
    return INITIAL_NOTES
  })

  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [selectedNoteId, setSelectedNoteId] = useState<string>(() => {
    if (initialArgs?.noteId) return initialArgs.noteId as string
    return INITIAL_NOTES[0].id
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Persist notes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch {
      // Ignore
    }
  }, [notes])

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0]

  const filteredNotes = notes.filter((n) => {
    const matchesFolder = selectedFolder === 'all' || n.folderId === selectedFolder
    const matchesQuery =
      searchQuery === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFolder && matchesQuery
  })

  const handleCreateNote = () => {
    soundService.playClick()
    const newNote: Note = {
      id: 'note-' + Date.now(),
      folderId: selectedFolder === 'all' ? 'quick' : selectedFolder,
      title: 'New Note',
      content: '',
      updatedAt: Date.now(),
    }
    setNotes((prev) => [newNote, ...prev])
    setSelectedNoteId(newNote.id)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 50)
  }

  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    soundService.playClick()
    const remaining = notes.filter((n) => n.id !== id)
    setNotes(remaining)
    if (selectedNoteId === id && remaining.length > 0) {
      setSelectedNoteId(remaining[0].id)
    }
  }

  const handleContentChange = (content: string) => {
    setSaveStatus('saving')
    const firstLine = content.trim().split('\n')[0]?.replace(/^#+\s*/, '') || 'New Note'
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote?.id
          ? {
              ...n,
              content,
              title: firstLine.slice(0, 40),
              updatedAt: Date.now(),
            }
          : n
      )
    )
    setTimeout(() => setSaveStatus('saved'), 300)
  }

  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current || !activeNote) return
    const el = textareaRef.current
    const start = el.selectionStart
    const end = el.selectionEnd
    const text = el.value
    const selected = text.substring(start, end)
    const replacement = prefix + selected + suffix
    const updated = text.substring(0, start) + replacement + text.substring(end)
    handleContentChange(updated)

    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 10)
  }

  return (
    <div className="flex h-full bg-neutral-900/90 text-neutral-200 select-none backdrop-blur-xl">
      {/* Column 1: Folders Sidebar */}
      <div className="w-44 border-r border-white/10 bg-black/20 flex flex-col p-2 space-y-1 text-xs">
        <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">
          Folders
        </div>
        {DEFAULT_FOLDERS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              soundService.playClick()
              setSelectedFolder(f.id)
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition ${
              selectedFolder === f.id
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'hover:bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Folder size={14} className={selectedFolder === f.id ? 'text-amber-400' : 'text-neutral-500'} />
              <span>{f.name}</span>
            </div>
            <span className="text-[10px] text-neutral-500">
              {f.id === 'all'
                ? notes.length
                : notes.filter((n) => n.folderId === f.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Column 2: Notes List */}
      <div className="w-56 border-r border-white/10 bg-white/[0.02] flex flex-col">
        {/* Search & New note bar */}
        <div className="p-2 border-b border-white/10 flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-md pl-7 pr-2 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={handleCreateNote}
            className="p-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition"
            title="New Note"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Note list items */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-500">No notes found</div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = note.id === activeNote?.id
              const preview = note.content.split('\n').slice(1).join(' ').trim() || 'No additional text'
              const dateStr = new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    soundService.playClick()
                    setSelectedNoteId(note.id)
                  }}
                  className={`group relative p-2 rounded-lg cursor-pointer transition ${
                    isSelected ? 'bg-amber-500/25 text-white' : 'hover:bg-white/5 text-neutral-300'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-medium text-xs truncate flex-1">{note.title}</span>
                    <span className="text-[10px] text-neutral-400 shrink-0">{dateStr}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate mt-0.5">{preview}</div>

                  <button
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="absolute right-2 top-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:text-red-400 transition"
                    title="Delete Note"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Column 3: Note Editor */}
      <div className="flex-1 flex flex-col bg-neutral-900/60">
        {activeNote ? (
          <>
            {/* Formatting Toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 text-neutral-400 text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => insertFormatting('# ')}
                  className="p-1 hover:text-white rounded hover:bg-white/5"
                  title="Heading 1"
                >
                  <Heading1 size={15} />
                </button>
                <button
                  onClick={() => insertFormatting('## ')}
                  className="p-1 hover:text-white rounded hover:bg-white/5"
                  title="Heading 2"
                >
                  <Heading2 size={15} />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button
                  onClick={() => insertFormatting('**', '**')}
                  className="p-1 hover:text-white rounded hover:bg-white/5"
                  title="Bold"
                >
                  <Bold size={15} />
                </button>
                <button
                  onClick={() => insertFormatting('*', '*')}
                  className="p-1 hover:text-white rounded hover:bg-white/5"
                  title="Italic"
                >
                  <Italic size={15} />
                </button>
                <button
                  onClick={() => insertFormatting('- ')}
                  className="p-1 hover:text-white rounded hover:bg-white/5"
                  title="Bullet list"
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() => insertFormatting('- [ ] ')}
                  className="p-1 hover:text-white rounded hover:bg-white/5"
                  title="Todo checklist"
                >
                  <CheckSquare size={15} />
                </button>
                <button
                  onClick={() => insertFormatting('`', '`')}
                  className="p-1 hover:text-white rounded hover:bg-white/5"
                  title="Code snippet"
                >
                  <Code size={15} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <Clock size={12} />
                <span>
                  {saveStatus === 'saving'
                    ? 'Saving...'
                    : `Saved ${new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              </div>
            </div>

            {/* Note Textarea Editor */}
            <textarea
              ref={textareaRef}
              value={activeNote.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write your thoughts..."
              className="flex-1 w-full p-4 bg-transparent resize-none text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none font-sans leading-relaxed selection:bg-amber-500/30"
              spellCheck={false}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 text-xs">
            No note selected
          </div>
        )}
      </div>
    </div>
  )
}
