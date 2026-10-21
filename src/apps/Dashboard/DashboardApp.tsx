import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { LayoutGrid, Cloud, Clock, Cpu, StickyNote, Play, Pause, ExternalLink, Calendar, CheckSquare } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

export const DashboardApp: React.FC<AppInstanceProps> = () => {
  const [quickNote, setQuickNote] = useState(() => {
    return localStorage.getItem('nova_quicknote') || 'Draft launch checklist for NOVA OS 2.0:\n- Verify window controls\n- Test 3D Three.js games\n- Check documentation files'
  })
  const [isPlaying, setIsPlaying] = useState(false)

  const handleNoteChange = (text: string) => {
    setQuickNote(text)
    try {
      localStorage.setItem('nova_quicknote', text)
    } catch {}
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900/95 text-neutral-100 select-none overflow-y-auto p-5 text-xs">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div className="flex items-center space-x-2">
          <LayoutGrid className="w-5 h-5 text-blue-400" />
          <h1 className="text-base font-bold text-white">System Dashboard & Widgets</h1>
        </div>
        <span className="text-[11px] text-neutral-400">NOVA OS Hub</span>
      </div>

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Weather Widget */}
        <div className="bg-gradient-to-br from-sky-800 to-indigo-900 rounded-2xl p-4 shadow-xl border border-white/10 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-sky-200">San Francisco</span>
              <div className="text-3xl font-light text-white mt-1">18°C</div>
            </div>
            <Cloud className="w-8 h-8 text-sky-200" />
          </div>
          <div className="text-xs text-sky-100 flex justify-between items-end">
            <span>Partly Cloudy</span>
            <span>H: 21° L: 13°</span>
          </div>
        </div>

        {/* Live Clock Widget */}
        <div className="bg-neutral-800/80 rounded-2xl p-4 shadow-xl border border-white/10 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-neutral-300">Cupertino</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="my-auto">
            <div className="text-3xl font-mono font-light text-white">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold">Local Time Sync: OK</div>
        </div>

        {/* System Activity Widget */}
        <div className="bg-neutral-800/80 rounded-2xl p-4 shadow-xl border border-white/10 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-neutral-300">System Resources</span>
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                <span>CPU Load</span>
                <span className="text-white font-mono">18%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '18%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                <span>Memory Heap</span>
                <span className="text-white font-mono">38%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '38%' }} />
              </div>
            </div>
          </div>
          <div className="text-[10px] text-neutral-400">FPS: 60 • GPU VFS Active</div>
        </div>

        {/* Scratchpad Note Widget */}
        <div className="bg-neutral-800/80 rounded-2xl p-4 shadow-xl border border-white/10 col-span-1 md:col-span-2 flex flex-col h-44">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-300 mb-2">
            <StickyNote className="w-4 h-4" />
            <span>Persistent Scratchpad</span>
          </div>
          <textarea
            value={quickNote}
            onChange={(e) => handleNoteChange(e.target.value)}
            className="flex-1 w-full bg-transparent text-neutral-200 text-xs leading-relaxed resize-none focus:outline-none"
            placeholder="Type quick notes here..."
          />
        </div>

        {/* Music Player Mini Widget */}
        <div className="bg-gradient-to-tr from-purple-900 to-indigo-900 rounded-2xl p-4 shadow-xl border border-white/10 flex flex-col justify-between h-44">
          <div>
            <div className="text-[10px] text-purple-200 uppercase font-semibold">Now Playing</div>
            <div className="text-sm font-bold text-white mt-1">Cosmic Drift - Ambient Synth</div>
            <div className="text-[11px] text-purple-300">Procedural Audio Engine</div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                soundService.playClick()
                setIsPlaying(p => !p)
              }}
              className="p-2.5 rounded-full bg-white text-black hover:bg-neutral-200 shadow-lg"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
            </button>
            <div className="flex items-end space-x-1 h-6">
              {[60, 90, 40, 75, 50, 100, 30].map((h, i) => (
                <div
                  key={i}
                  style={{ height: isPlaying ? `${h}%` : '20%' }}
                  className="w-1 bg-purple-300 rounded-full transition-all duration-150"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
