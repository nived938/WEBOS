import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import {
  Play,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Layout,
  Palette,
  FileText,
  Clock,
  Download,
} from 'lucide-react'

interface Slide {
  id: string
  title: string
  subtitle: string
  bullets: string[]
  layout: 'title' | 'split' | 'bullets' | 'quote'
  notes: string
}

export const PresentationStudioApp: React.FC<AppInstanceProps> = () => {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 'slide-1',
      title: 'NOVA OS Architecture',
      subtitle: 'Next-Generation Browser Desktop Environment',
      bullets: ['Liquid Glass Optics', 'Multi-Tabbed Finder & VFS', '21-Subsystem Personalization'],
      layout: 'title',
      notes: 'Welcome audience and introduce core vision of NOVA OS.',
    },
    {
      id: 'slide-2',
      title: 'Virtual Workspaces & Multitasking',
      subtitle: 'Fluid Ergonomics Inspired by Ubuntu GNOME',
      bullets: [
        'Persistent Multi-Workspace Matrix',
        'Spatial Activities Overview with Drag & Drop',
        'Left Dock with Hover Window Previews',
      ],
      layout: 'bullets',
      notes: 'Highlight how workspaces isolate tasks smoothly.',
    },
    {
      id: 'slide-3',
      title: 'Performance & Sandbox Security',
      subtitle: 'Zero Telemetry & 100% Client-Side Integrity',
      bullets: [
        'PBKDF2 Cryptographic Salting (100k Iterations)',
        'WebGL 2.0 Hardware Acceleration',
        'IndexedDB File Allocation Table',
      ],
      layout: 'split',
      notes: 'Explain client-side sandbox privacy guarantee.',
    },
  ])

  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [isPresenting, setIsPresenting] = useState(false)
  const [presentationTime, setPresentationTime] = useState(0)
  const [theme, setTheme] = useState<'cosmic' | 'light' | 'cyberpunk'>('cosmic')

  const currentSlide = slides[activeSlideIndex] || slides[0]

  const handleAddSlide = () => {
    soundService.playClick()
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: 'New Slide Title',
      subtitle: 'Subtitle and key takeaway',
      bullets: ['First key point', 'Second core concept', 'Actionable takeaway'],
      layout: 'bullets',
      notes: 'Add presenter notes here.',
    }
    setSlides([...slides, newSlide])
    setActiveSlideIndex(slides.length)
  }

  const handleDeleteSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (slides.length <= 1) return
    soundService.playTrashEmpty()
    const nextSlides = slides.filter((_, i) => i !== index)
    setSlides(nextSlides)
    setActiveSlideIndex(Math.max(0, index - 1))
  }

  const handleUpdateSlide = (patch: Partial<Slide>) => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, ...patch } : s))
    )
  }

  const handleNextSlide = () => {
    if (activeSlideIndex < slides.length - 1) {
      soundService.playClick()
      setActiveSlideIndex(activeSlideIndex + 1)
    }
  }

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      soundService.playClick()
      setActiveSlideIndex(activeSlideIndex - 1)
    }
  }

  const themes = {
    cosmic: 'from-slate-950 via-indigo-950 to-neutral-950 text-white',
    light: 'from-slate-50 via-slate-100 to-blue-50 text-slate-900',
    cyberpunk: 'from-neutral-950 via-purple-950 to-neutral-900 text-cyan-300',
  }

  return (
    <div className="flex h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs relative">
      {/* Top Toolbar */}
      <div className="absolute top-0 inset-x-0 h-10 bg-black/40 border-b border-white/10 flex items-center justify-between px-3 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-xs flex items-center gap-1.5">
            <Layout size={14} className="text-amber-400" /> Presentation Studio
          </span>
          <span className="text-neutral-500">|</span>
          <span className="text-[11px] text-neutral-400 font-mono">
            Slide {activeSlideIndex + 1} of {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10">
            {(['cosmic', 'light', 'cyberpunk'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2 py-0.5 rounded capitalize text-[10px] ${
                  theme === t ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              soundService.playStartup()
              setIsPresenting(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-600/20"
          >
            <Play size={12} fill="currentColor" /> Present
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex pt-10">
        {/* Slides Thumbnails Sidebar */}
        <div className="w-48 border-r border-white/10 bg-black/25 flex flex-col p-2.5 overflow-y-auto space-y-2 shrink-0">
          <button
            onClick={handleAddSlide}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition"
          >
            <Plus size={13} /> Add Slide
          </button>

          <div className="space-y-2 pt-1">
            {slides.map((s, idx) => {
              const isActive = idx === activeSlideIndex
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    soundService.playClick()
                    setActiveSlideIndex(idx)
                  }}
                  className={`relative p-2 rounded-xl border cursor-pointer transition flex flex-col justify-between aspect-video ${
                    isActive
                      ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-500/30'
                      : 'border-white/10 bg-black/40 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[9px] text-neutral-400">#{idx + 1}</span>
                    {slides.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteSlide(idx, e)}
                        className="p-0.5 text-neutral-400 hover:text-red-400 opacity-60 hover:opacity-100"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                  <div className="truncate font-semibold text-[10px] text-white">{s.title}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Center: Slide Preview / Edit Canvas */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto">
          <div className="w-full max-w-2xl aspect-video rounded-2xl border border-white/20 shadow-2xl p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-tr transition-all duration-300 relative group">
            <div className={`absolute inset-0 bg-gradient-to-br ${themes[theme]}`} />

            <div className="relative z-10 space-y-3">
              <input
                type="text"
                value={currentSlide.title}
                onChange={(e) => handleUpdateSlide({ title: e.target.value })}
                className="w-full bg-transparent font-bold text-2xl border-b border-white/10 focus:border-amber-400 outline-none pb-1"
                placeholder="Slide Title..."
              />

              <input
                type="text"
                value={currentSlide.subtitle}
                onChange={(e) => handleUpdateSlide({ subtitle: e.target.value })}
                className="w-full bg-transparent text-sm opacity-80 border-b border-white/5 focus:border-amber-400 outline-none pb-1"
                placeholder="Slide Subtitle..."
              />
            </div>

            <div className="relative z-10 flex-1 my-4 space-y-2">
              {currentSlide.bullets.map((bullet, bIdx) => (
                <div key={bIdx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => {
                      const nextBullets = [...currentSlide.bullets]
                      nextBullets[bIdx] = e.target.value
                      handleUpdateSlide({ bullets: nextBullets })
                    }}
                    className="w-full bg-transparent text-xs border-b border-white/5 focus:border-amber-400 outline-none py-0.5"
                  />
                </div>
              ))}
              <button
                onClick={() => handleUpdateSlide({ bullets: [...currentSlide.bullets, 'New bullet takeaway'] })}
                className="text-[10px] text-amber-400 hover:text-amber-300 mt-2 block"
              >
                + Add Bullet Point
              </button>
            </div>

            <div className="relative z-10 flex justify-between text-[10px] opacity-50 font-mono">
              <span>NOVA Presentation Studio</span>
              <span>Slide {activeSlideIndex + 1} of {slides.length}</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={handlePrevSlide}
              disabled={activeSlideIndex === 0}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs text-neutral-400">
              {activeSlideIndex + 1} / {slides.length}
            </span>
            <button
              onClick={handleNextSlide}
              disabled={activeSlideIndex === slides.length - 1}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Presenter Mode Modal */}
      {isPresenting && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-8 select-none">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span className="font-mono text-cyan-400">PRESENTER MODE &bull; Slide {activeSlideIndex + 1} of {slides.length}</span>
            <button
              onClick={() => setIsPresenting(false)}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              Exit Presentation (ESC)
            </button>
          </div>

          {/* Active slide view */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">{currentSlide.title}</h1>
            <p className="text-xl text-neutral-300 font-light">{currentSlide.subtitle}</p>
            <div className="space-y-3 pt-4 text-left max-w-xl mx-auto">
              {currentSlide.bullets.map((b, idx) => (
                <div key={idx} className="flex items-center gap-3 text-lg text-neutral-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls in Presenter mode */}
          <div className="flex justify-between items-center text-sm">
            <button
              onClick={handlePrevSlide}
              disabled={activeSlideIndex === 0}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
            >
              Previous Slide
            </button>
            <button
              onClick={handleNextSlide}
              disabled={activeSlideIndex === slides.length - 1}
              className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold disabled:opacity-30"
            >
              Next Slide
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
