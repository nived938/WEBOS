import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Printer,
  Bookmark,
  Share2,
} from 'lucide-react'

interface DocumentPage {
  pageNumber: number
  title: string
  content: string[]
}

const SAMPLE_PAGES: DocumentPage[] = [
  {
    pageNumber: 1,
    title: 'NOVA OS Architecture & System Specifications',
    content: [
      'ABSTRACT: NOVA OS is an enterprise-grade, browser-native operating system designed with modern web technologies, liquid glass optics, and client-side sandboxing.',
      'Section 1.1: System Kernel & Web Worker Subsystems',
      'The microkernel structure offloads non-blocking compute pipelines to background Web Workers, maintaining a persistent 60 frames per second desktop compositor even during heavy I/O operations.',
      'Section 1.2: Liquid Glass Optical Compositor',
      'By utilizing CSS Backdrop Filter hardware pipelines and multi-layer dynamic specular highlights, windows achieve high-fidelity optical refraction with zero GPU memory leaks.',
    ],
  },
  {
    pageNumber: 2,
    title: 'Security Architecture & PBKDF2 Cryptographic Storage',
    content: [
      'Section 2.1: Key Derivation and Salting',
      'User credentials and biometric PINs are salted with 16 bytes of cryptographically secure pseudo-random entropy and hashed through 100,000 iterations of PBKDF2-HMAC-SHA256.',
      'Section 2.2: Virtual File System Isolation',
      'The IndexedDB file allocation table isolates file descriptors within local origin limits. Cross-origin frames are strictly blocked via Content Security Policy and X-Frame-Options headers.',
    ],
  },
  {
    pageNumber: 3,
    title: 'Window Management & Spatial Workspace Matrix',
    content: [
      'Section 3.1: Pointer Capture and Multi-Touch Delegation',
      'Window titlebars implement pointer capture ensuring zero cursor loss when moving windows rapidly across viewport edges. Event bubbling is properly stopped on interactive buttons.',
      'Section 3.2: Spatial Desktop Workspaces',
      'Independent virtual desktops allow users to categorize workflows into Main, Work, Gaming, and Entertainment spaces with smooth animated transitions.',
    ],
  },
]

export const PdfReaderApp: React.FC<AppInstanceProps> = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isBookmarked, setIsBookmarked] = useState<number[]>([1])

  const totalPages = SAMPLE_PAGES.length
  const activePageData = SAMPLE_PAGES.find((p) => p.pageNumber === currentPage) || SAMPLE_PAGES[0]

  const handleNext = () => {
    if (currentPage < totalPages) {
      soundService.play('buttonClick')
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      soundService.play('buttonClick')
      setCurrentPage((prev) => prev - 1)
    }
  }

  const toggleBookmark = (pg: number) => {
    soundService.play('buttonClick')
    setIsBookmarked((prev) =>
      prev.includes(pg) ? prev.filter((p) => p !== pg) : [...prev, pg]
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e24] text-neutral-200 select-none font-sans">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-neutral-300 font-mono">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 transition-colors"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
          <div className="h-4 w-[1px] bg-white/15 mx-1" />
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 15))}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-neutral-300 font-mono w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 15))}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
            title="Rotate Clockwise"
          >
            <RotateCw size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-md pl-8 pr-3 py-1 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 w-44"
            />
          </div>
          <button
            onClick={() => toggleBookmark(currentPage)}
            className={`p-1.5 rounded-md transition-colors ${
              isBookmarked.includes(currentPage)
                ? 'text-amber-400 bg-amber-400/20'
                : 'hover:bg-white/10 text-neutral-400'
            }`}
            title="Bookmark Page"
          >
            <Bookmark size={16} />
          </button>
          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-md hover:bg-white/10 text-neutral-400 transition-colors"
            title="Print Document"
          >
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnails Sidebar */}
        <div className="w-48 border-r border-white/10 bg-black/20 p-3 overflow-y-auto flex flex-col gap-3">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 px-1">
            Pages Overview
          </div>
          {SAMPLE_PAGES.map((page) => (
            <div
              key={page.pageNumber}
              onClick={() => {
                soundService.play('buttonClick')
                setCurrentPage(page.pageNumber)
              }}
              className={`p-2 rounded-lg cursor-pointer transition-all border ${
                currentPage === page.pageNumber
                  ? 'border-blue-500/80 bg-blue-500/15 ring-1 ring-blue-500/30'
                  : 'border-white/5 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-center mb-1 text-[10px] text-neutral-400">
                <span>Page {page.pageNumber}</span>
                {isBookmarked.includes(page.pageNumber) && (
                  <Bookmark size={10} className="text-amber-400 fill-amber-400" />
                )}
              </div>
              <div className="h-14 bg-white/5 rounded border border-white/5 p-1 text-[7px] text-neutral-400 line-clamp-4 leading-tight overflow-hidden">
                {page.title}
              </div>
            </div>
          ))}
        </div>

        {/* Viewport */}
        <div className="flex-1 bg-black/60 p-6 overflow-auto flex items-center justify-center">
          <div
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-[540px] min-h-[720px] bg-[#272730] shadow-2xl rounded-lg p-8 border border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <span className="text-[10px] uppercase tracking-widest text-blue-400 font-mono">
                  NOVA OS Whitepaper
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Page {activePageData.pageNumber} of {totalPages}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mb-4 leading-snug">
                {activePageData.title}
              </h2>
              <div className="space-y-4 text-xs text-neutral-300 leading-relaxed font-serif">
                {activePageData.content.map((p, idx) => {
                  if (searchQuery && p.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return (
                      <p key={idx} className="bg-yellow-500/20 text-yellow-200 p-1 rounded">
                        {p}
                      </p>
                    )
                  }
                  return <p key={idx}>{p}</p>
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[10px] text-neutral-500">
              <span>Confidential & Proprietary</span>
              <span>© {new Date().getFullYear()} NOVA OS Project</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
