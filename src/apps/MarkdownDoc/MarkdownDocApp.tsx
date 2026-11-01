import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { BookOpen, Download, FileText, List, Eye } from 'lucide-react'

const DEFAULT_DOC = `# NOVA OS Technical Manual

## 1. Overview
NOVA OS provides an operating-system tier interface completely executed client-side.

### Core Pillars
- **Liquid Glass Optical Shaders**
- **Spatial Desktop Workspaces**
- **Sandboxed Virtual Filesystem**

## 2. Security Guarantees
- Zero background external telemetry.
- PBKDF2 salting for local lock credentials.
- Isolated indexed storage.

## 3. Package Management
All applications are cataloged with cryptographically verified SHA-256 integrity hashes.
`

export const MarkdownDocApp: React.FC<AppInstanceProps> = () => {
  const [docContent, setDocContent] = useState(DEFAULT_DOC)

  // Extract table of contents from headers
  const headers = docContent
    .split('\n')
    .filter((line) => line.startsWith('#'))
    .map((line) => {
      const level = (line.match(/^#+/) || ['#'])[0].length
      const title = line.replace(/^#+\s*/, '')
      return { level, title }
    })

  const handleDownload = () => {
    soundService.play('buttonClick')
    const blob = new Blob([docContent], { type: 'text/markdown' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'nova-manual.md'
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-blue-400" />
          <span className="font-semibold text-white">Markdown Documentation Studio</span>
        </div>

        <button
          onClick={handleDownload}
          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs transition-colors flex items-center gap-1.5 font-medium shadow"
        >
          <Download size={13} /> Export .md
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Table of Contents Sidebar */}
        <div className="w-56 bg-black/40 border-r border-white/10 p-3 overflow-y-auto hidden md:flex flex-col gap-2">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
            <List size={12} /> Table of Contents
          </div>
          <div className="space-y-1 mt-1">
            {headers.map((h, i) => (
              <div
                key={i}
                style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
                className="text-xs text-neutral-300 hover:text-white truncate cursor-default py-0.5"
              >
                {h.title}
              </div>
            ))}
          </div>
        </div>

        {/* Markdown Source */}
        <div className="flex-1 border-r border-white/10 flex flex-col bg-[#1a1a24]">
          <div className="px-3 py-1.5 bg-black/20 border-b border-white/10 text-[11px] text-neutral-400">
            Source Markdown
          </div>
          <textarea
            value={docContent}
            onChange={(e) => setDocContent(e.target.value)}
            className="flex-1 p-4 bg-transparent text-neutral-200 font-mono text-xs resize-none focus:outline-none leading-relaxed select-text"
            spellCheck={false}
          />
        </div>

        {/* Live Preview */}
        <div className="flex-1 flex flex-col bg-[#1e1e28] overflow-y-auto">
          <div className="px-3 py-1.5 bg-black/30 border-b border-white/10 text-[11px] text-neutral-400 flex items-center gap-1">
            <Eye size={12} /> Live Preview
          </div>
          <div className="p-6 prose prose-invert max-w-none text-xs leading-relaxed select-text font-serif">
            <div className="whitespace-pre-wrap">{docContent}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
