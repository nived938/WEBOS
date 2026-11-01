import React, { useState, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Heading1,
  Heading2,
  Download,
  FileText,
  Save,
  Check,
} from 'lucide-react'

export const DocCreatorApp: React.FC<AppInstanceProps> = () => {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [docTitle, setDocTitle] = useState('Untitled Document')
  const [wordCount, setWordCount] = useState(142)
  const [isSaved, setIsSaved] = useState(true)

  const format = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value)
    soundService.play('buttonClick')
    updateWordCount()
    setIsSaved(false)
  }

  const updateWordCount = () => {
    if (!editorRef.current) return
    const text = editorRef.current.innerText || ''
    const words = text.trim().split(/\s+/).filter(Boolean)
    setWordCount(words.length)
  }

  const handleSave = () => {
    soundService.play('buttonClick')
    setIsSaved(true)
  }

  const handleDownload = () => {
    soundService.play('buttonClick')
    const content = editorRef.current?.innerHTML || ''
    const blob = new Blob([content], { type: 'text/html' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${docTitle.toLowerCase().replace(/\s+/g, '-')}.html`
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-[#1b1b22] text-neutral-200 font-sans select-none">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-blue-400" />
          <input
            type="text"
            value={docTitle}
            onChange={(e) => {
              setDocTitle(e.target.value)
              setIsSaved(false)
            }}
            className="bg-transparent text-sm font-semibold text-white focus:outline-none focus:border-b border-blue-500 pb-0.5"
          />
          <span className="text-[10px] text-neutral-500 flex items-center gap-1">
            {isSaved ? (
              <>
                <Check size={12} className="text-emerald-400" /> Saved
              </>
            ) : (
              'Unsaved changes'
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/15 text-white transition-colors flex items-center gap-1.5"
          >
            <Save size={14} /> Save
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow"
          >
            <Download size={14} /> Export HTML
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="px-4 py-1.5 border-b border-white/10 bg-black/20 flex items-center gap-1 text-neutral-300">
        <button
          onClick={() => format('bold')}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          title="Bold"
        >
          <Bold size={15} />
        </button>
        <button
          onClick={() => format('italic')}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          title="Italic"
        >
          <Italic size={15} />
        </button>
        <button
          onClick={() => format('underline')}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          title="Underline"
        >
          <Underline size={15} />
        </button>
        <div className="h-4 w-[1px] bg-white/15 mx-1" />
        <button
          onClick={() => format('formatBlock', '<h1>')}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          title="Heading 1"
        >
          <Heading1 size={15} />
        </button>
        <button
          onClick={() => format('formatBlock', '<h2>')}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          title="Heading 2"
        >
          <Heading2 size={15} />
        </button>
        <div className="h-4 w-[1px] bg-white/15 mx-1" />
        <button
          onClick={() => format('justifyLeft')}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          title="Align Left"
        >
          <AlignLeft size={15} />
        </button>
        <button
          onClick={() => format('justifyCenter')}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          title="Align Center"
        >
          <AlignCenter size={15} />
        </button>
        <button
          onClick={() => format('justifyRight')}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          title="Align Right"
        >
          <AlignRight size={15} />
        </button>
        <div className="h-4 w-[1px] bg-white/15 mx-1" />
        <button
          onClick={() => format('insertUnorderedList')}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          title="Bullet List"
        >
          <List size={15} />
        </button>
      </div>

      {/* Document Body */}
      <div className="flex-1 overflow-auto bg-black/60 p-6 flex justify-center">
        <div
          ref={editorRef}
          contentEditable
          onInput={() => {
            updateWordCount()
            setIsSaved(false)
          }}
          className="w-[620px] min-h-[800px] bg-[#22222a] p-10 rounded-lg shadow-2xl border border-white/10 text-neutral-200 outline-none select-text font-serif leading-relaxed"
          suppressContentEditableWarning
        >
          <h1 className="text-2xl font-bold font-sans text-white mb-4">
            Product Requirements: Next-Gen WebOS Desktop
          </h1>
          <p className="mb-4">
            NOVA OS represents a quantum leap in browser-based desktop environments. Built with
            React 19, TypeScript, and Tailwind CSS, it offers native-quality ergonomics with zero
            server telemetry.
          </p>
          <h2 className="text-xl font-semibold font-sans text-white mb-2">Key Objectives</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Zero lag optical refraction using liquid glass shader models.</li>
            <li>Multi-workspace desktop matrix for isolation of development workflows.</li>
            <li>Complete local application package repository with cryptographic validation.</li>
          </ul>
          <p>
            The software suite includes comprehensive productivity, engineering, graphics, and
            media authoring tools that execute completely client-side in the browser.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-1.5 border-t border-white/10 bg-black/40 flex justify-between items-center text-[11px] text-neutral-400">
        <span>Words: {wordCount}</span>
        <span>UTF-8 Document • Rich Text</span>
      </div>
    </div>
  )
}
