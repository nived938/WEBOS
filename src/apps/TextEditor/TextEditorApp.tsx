import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Save, Download, FileText, Check, Copy } from 'lucide-react'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { soundService } from '@/core/audio/soundService'

export const TextEditorApp: React.FC<AppInstanceProps> = ({ initialArgs }) => {
  const { addNotification } = useNotifications()
  const [content, setContent] = useState<string>(
    typeof initialArgs?.content === 'string'
      ? initialArgs.content
      : '# Untitled Document\n\nWelcome to NOVA Text Editor.\nStart typing your content or notes here...'
  )
  const [fileName, setFileName] = useState<string>(
    typeof initialArgs?.fileName === 'string' ? initialArgs.fileName : 'document.txt'
  )
  const [fontSize, setFontSize] = useState<number>(14)
  const [copied, setCopied] = useState(false)

  const lineCount = content.split('\n').length
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.length

  const handleSave = () => {
    soundService.playClick()
    addNotification('Saved Document', `Saved ${fileName} (${wordCount} words)`, 'texteditor')
  }

  const handleDownload = () => {
    soundService.playClick()
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    addNotification('Downloaded', `Exported ${fileName} to local files`, 'texteditor')
  }

  const handleCopy = () => {
    soundService.playClick()
    navigator.clipboard?.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Action Toolbar */}
      <div className="h-11 bg-neutral-900/80 border-b border-white/10 px-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <FileText size={15} className="text-blue-400 shrink-0" />
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-blue-500 font-medium w-full"
            placeholder="Filename..."
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-0.5 text-xs text-neutral-400">
            <span>Size:</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-transparent text-white outline-none cursor-pointer"
            >
              {[12, 13, 14, 16, 18, 20].map((s) => (
                <option key={s} value={s} className="bg-neutral-900 text-white">
                  {s}px
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition"
            title="Copy Text"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition"
            title="Download text file"
          >
            <Download size={13} />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-md shadow-blue-600/20"
          >
            <Save size={13} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor Main Canvas with Line Numbers */}
      <div className="flex-1 flex overflow-hidden bg-neutral-950 font-mono select-text">
        {/* Line Numbers column */}
        <div className="w-12 py-3 bg-neutral-900/50 border-r border-white/5 text-right pr-2 text-neutral-600 select-none text-xs leading-relaxed shrink-0 overflow-hidden font-mono">
          {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ fontSize: `${fontSize}px` }}
          className="flex-1 p-3 bg-transparent text-neutral-200 outline-none resize-none leading-relaxed font-mono w-full h-full overflow-y-auto"
          placeholder="Start typing your text document here..."
          spellCheck={false}
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 bg-neutral-900/90 border-t border-white/10 px-3 flex items-center justify-between text-[11px] text-neutral-400 select-none shrink-0 font-sans">
        <div className="flex items-center gap-4">
          <span>Lines: {lineCount}</span>
          <span>Words: {wordCount}</span>
          <span>Chars: {charCount}</span>
        </div>
        <div className="text-neutral-500">UTF-8 • Plain Text</div>
      </div>
    </div>
  )
}
