import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { FileText, Eye, Columns, Download, Copy, Check } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'

export const MarkdownApp: React.FC<AppInstanceProps> = () => {
  const { addNotification } = useNotifications()

  const [markdown, setMarkdown] = useState<string>(`# Welcome to NOVA Markdown Studio

A real-time, side-by-side markdown writing environment.

## Key Features
- **Clean Syntax**: Write standard GitHub Flavored Markdown
- *Instant Live Preview*: See rendered changes immediately
- Tables, quotes, and task lists:

| Feature | Supported | Status |
| :--- | :---: | ---: |
| Headings & Bold | Yes | Ready |
| Code Syntax | Yes | Polished |
| Interactive UI | Yes | Fast |

> "Simplicity is about subtracting the obvious and adding the meaningful." — John Maeda

### Code Example:
\`\`\`javascript
function calculateScore(streak) {
  return streak * 100;
}
console.log(calculateScore(5));
\`\`\`

- [x] Create Markdown Editor
- [x] Add live preview engine
- [ ] Export HTML & Markdown
`)

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split')
  const [copied, setCopied] = useState(false)

  // Lightweight standard markdown to HTML parser
  const renderMarkdown = (text: string) => {
    let html = text
      // Escape HTML tags to prevent XSS
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-white mt-4 mb-2">$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-5 mb-2 pb-1 border-b border-white/10">$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-white mt-2 mb-3 pb-2 border-b border-white/15">$1</h1>')

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-3 my-3 italic text-neutral-300 bg-white/5 py-1 rounded-r-lg">$1</blockquote>')

    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-semibold">$1</strong>')
    html = html.replace(/\*(.*?)\*/gim, '<em class="text-neutral-300 italic">$1</em>')

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gim, '<pre class="bg-black/60 border border-white/10 rounded-xl p-3 my-3 font-mono text-xs text-blue-300 overflow-x-auto"><code>$1</code></pre>')

    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-white/10 text-amber-300 font-mono text-[11px] px-1.5 py-0.5 rounded">$1</code>')

    // Task list items
    html = html.replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center gap-2 my-1 text-neutral-400 line-through"><span class="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[10px]">✓</span><span>$1</span></div>')
    html = html.replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center gap-2 my-1 text-neutral-200"><span class="w-4 h-4 rounded border border-white/30 flex items-center justify-center text-[10px]"></span><span>$1</span></div>')

    // Unordered lists
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-neutral-300 my-0.5">$1</li>')

    // Simple Tables
    html = html.replace(/\|(.+)\|/gim, (match) => {
      if (match.includes('---')) return ''
      const cells = match.split('|').filter((c) => c.trim() !== '')
      const rowHtml = cells.map((c) => `<td class="border border-white/10 px-3 py-1.5">${c.trim()}</td>`).join('')
      return `<tr class="border-b border-white/5">${rowHtml}</tr>`
    })

    // Paragraphs
    html = html.replace(/\n\n/gim, '<div class="h-3"></div>')

    return html
  }

  const handleCopy = () => {
    soundService.playClick()
    navigator.clipboard?.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addNotification('Copied', 'Markdown copied to clipboard', 'markdown')
  }

  const handleDownload = () => {
    soundService.playClick()
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="h-11 bg-neutral-900/80 border-b border-white/10 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-purple-400" />
          <span className="text-xs font-bold text-white">Markdown Studio</span>
        </div>

        {/* View mode toggles */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
              viewMode === 'split' ? 'bg-purple-600 text-white font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Columns size={13} /> Split
          </button>
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
              viewMode === 'edit' ? 'bg-purple-600 text-white font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText size={13} /> Edit
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
              viewMode === 'preview' ? 'bg-purple-600 text-white font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye size={13} /> Preview
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-xs text-white font-medium transition shadow-md shadow-purple-600/20"
          >
            <Download size={13} /> Export .md
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Panes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className="flex-1 flex flex-col border-r border-white/10 bg-neutral-950 font-mono select-text overflow-hidden">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 p-4 bg-transparent text-neutral-200 outline-none resize-none leading-relaxed text-xs font-mono w-full h-full overflow-y-auto"
              placeholder="Write your markdown syntax here..."
              spellCheck={false}
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="flex-1 bg-neutral-900/50 p-6 overflow-y-auto select-text leading-relaxed text-xs text-neutral-200">
            <div
              className="max-w-2xl mx-auto space-y-2"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
