import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { FileText, ZoomIn, ZoomOut, RotateCw, Download, Printer, Search, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface SampleDoc {
  id: string
  title: string
  author: string
  pages: string[]
}

const SAMPLE_DOCS: SampleDoc[] = [
  {
    id: 'nova-manual',
    title: 'NOVA OS User Guide & Architecture.pdf',
    author: 'NOVA Engineering Team',
    pages: [
      `# Welcome to NOVA OS 2.0
## The Elegant Browser-Based Desktop Experience

NOVA OS combines the fluidity and refined aesthetics of modern desktop computing with the portability and security of modern web browsers.

### Key Capabilities:
1. **Window Management**: Fully interactive windows with smooth dragging, proportional resizing, active snapping, and authentic macOS-style traffic light controls.
2. **Dynamic Wallpapers**: GPU-accelerated mesh gradients and dynamic backgrounds that never turn black or lose state.
3. **Advanced Browser**: Multi-tab browsing with built-in instant search engine results, reader view, and bookmark persistence.
4. **App Ecosystem**: 40+ native applications spanning productivity, development, education, media, and 3D gaming.`,

      `# Chapter 2: System Architecture

### Component Hierarchy
- **WindowManager**: Manages z-indexes, focus state, active windows, minimized state, and maximized geometry.
- **Dock**: Proportional magnification, active application dots, bounce animations on launch, and fast access to system utilities.
- **TopMenu**: System status icons (Clock, Battery, Wi-Fi, Control Center, Search Spotlight) and active app menus.
- **Settings Store**: LocalStorage-backed reactive settings store with reactive wallpaper preloading and fallback protection.

### Performance Design
NOVA OS is engineered for steady 60 FPS performance using CSS GPU transforms (\`transform: translate3d\`), hardware-accelerated canvas contexts, and minimal re-renders.`,

      `# Chapter 3: Keyboard Shortcuts

Master NOVA OS with these essential shortcuts:

| Shortcut | Action |
| :--- | :--- |
| **Meta / Cmd + Space** | Open Spotlight Global Search |
| **Ctrl + T** | New Tab in Browser |
| **Ctrl + W** | Close Current Window / Tab |
| **Ctrl + M** | Minimize Active Window |
| **F11 / Alt + Enter** | Toggle Window Maximization |
| **Ctrl + Shift + T** | Launch Terminal |

For further assistance, explore the **App Library** or inspect the **Terminal** shell.`
    ]
  },
  {
    id: 'spec-sheet',
    title: 'NOVA Kernel Specifications.pdf',
    author: 'Systems Lab',
    pages: [
      `# NOVA OS Specification Sheet
**Version:** 2.0.4 LTS
**Architecture:** Web-Native Micro-Kernel Simulation
**Display Engine:** React 19 + Tailwind v4 + Three.js 3D Pipeline

### Runtime Requirements
- Modern Chromium / Firefox / WebKit browser
- Hardware WebGL 2.0 acceleration enabled
- LocalStorage quota available (min 5MB)
- AudioContext support for procedural synthesis`,

      `# Audio & Haptics Engine
The procedural audio engine uses Web Audio oscillators to generate:
- Tactile keyboard click feedback
- Subtle window opening swooshes
- Traffic light button clicks
- Ambient procedural audio synthesis

No external audio assets are strictly required, guaranteeing instantaneous zero-latency playback.`
    ]
  }
]

export const DocViewerApp: React.FC<AppInstanceProps> = () => {
  const [selectedDocId, setSelectedDocId] = useState<string>('nova-manual')
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const activeDoc = SAMPLE_DOCS.find(d => d.id === selectedDocId) || SAMPLE_DOCS[0]
  const totalPages = activeDoc.pages.length

  const handleNextPage = () => {
    soundService.playClick()
    if (currentPage < totalPages - 1) setCurrentPage(p => p + 1)
  }

  const handlePrevPage = () => {
    soundService.playClick()
    if (currentPage > 0) setCurrentPage(p => p - 1)
  }

  const handleZoomIn = () => {
    soundService.playClick()
    setZoomLevel(z => Math.min(z + 15, 175))
  }

  const handleZoomOut = () => {
    soundService.playClick()
    setZoomLevel(z => Math.max(z - 15, 60))
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-800/80 border-b border-white/10 text-xs">
        {/* Document Switcher */}
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <select
            value={selectedDocId}
            onChange={(e) => {
              setSelectedDocId(e.target.value)
              setCurrentPage(0)
            }}
            className="bg-neutral-700/80 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
          >
            {SAMPLE_DOCS.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.title}</option>
            ))}
          </select>
        </div>

        {/* Page Nav */}
        <div className="flex items-center space-x-2 bg-neutral-800 px-2 py-1 rounded border border-white/5">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-neutral-300 font-mono">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-neutral-800 px-2 py-1 rounded border border-white/5">
            <button onClick={handleZoomOut} className="p-1 hover:bg-white/10 rounded" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs w-10 text-center">{zoomLevel}%</span>
            <button onClick={handleZoomIn} className="p-1 hover:bg-white/10 rounded" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => soundService.playNotification()}
            className="p-1.5 hover:bg-white/10 rounded text-neutral-300 hover:text-white"
            title="Bookmark"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => soundService.playClick()}
            className="p-1.5 hover:bg-white/10 rounded text-neutral-300 hover:text-white"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-auto bg-neutral-950/70 p-6 flex justify-center items-start">
        <div
          style={{ width: `${Math.round(620 * (zoomLevel / 100))}px` }}
          className="bg-white text-neutral-900 shadow-2xl rounded-sm p-8 min-h-[580px] transition-all duration-150 border border-neutral-300 leading-relaxed font-sans"
        >
          {activeDoc.pages[currentPage].split('\n').map((line, idx) => {
            if (line.startsWith('# ')) {
              return <h1 key={idx} className="text-2xl font-bold text-neutral-900 border-b pb-2 mb-4 mt-1">{line.replace('# ', '')}</h1>
            }
            if (line.startsWith('## ')) {
              return <h2 key={idx} className="text-xl font-semibold text-neutral-800 mt-4 mb-2">{line.replace('## ', '')}</h2>
            }
            if (line.startsWith('### ')) {
              return <h3 key={idx} className="text-base font-semibold text-neutral-700 mt-3 mb-1">{line.replace('### ', '')}</h3>
            }
            if (line.startsWith('- ')) {
              return <li key={idx} className="ml-4 list-disc text-sm text-neutral-700 my-0.5">{line.replace('- ', '')}</li>
            }
            if (line.startsWith('|')) {
              return <p key={idx} className="font-mono text-xs bg-neutral-100 p-1.5 rounded my-1 text-neutral-800">{line}</p>
            }
            if (line.trim() === '') {
              return <div key={idx} className="h-3" />
            }
            return <p key={idx} className="text-sm text-neutral-700 my-1 leading-normal">{line}</p>
          })}

          <div className="mt-12 pt-4 border-t border-neutral-200 flex justify-between text-xs text-neutral-400">
            <span>{activeDoc.title}</span>
            <span>Page {currentPage + 1} of {totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
