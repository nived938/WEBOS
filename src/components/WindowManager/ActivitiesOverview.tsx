import React, { useState, useEffect, useMemo } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import { soundService } from '@/core/audio/soundService'
import {
  X,
  Layout,
  Search,
  Plus,
  Monitor,
  LayoutGrid,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react'

export const ActivitiesOverview: React.FC = () => {
  const {
    isOverviewOpen,
    toggleOverview,
    toggleLauncher,
    windows,
    focusWindow,
    closeWindow,
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace,
    moveWindowToWorkspace,
  } = useWindowManager()

  const [searchQuery, setSearchQuery] = useState('')
  const [draggedWinId, setDraggedWinId] = useState<string | null>(null)

  // Keyboard shortcut listener for Esc and Super key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOverviewOpen) {
        soundService.playClick()
        toggleOverview(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOverviewOpen, toggleOverview])

  if (!isOverviewOpen) return null

  // Windows in active workspace
  const currentWorkspaceWindows = windows.filter(
    (w) => (w.workspaceId || 1) === activeWorkspace && !w.isMinimized
  )

  const filteredWindows = currentWorkspaceWindows.filter(
    (w) =>
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.appId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectWindow = (id: string) => {
    soundService.playClick()
    focusWindow(id)
    toggleOverview(false)
  }

  const handleCloseWindow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    soundService.playClick()
    closeWindow(id)
  }

  const handleDragStart = (id: string) => {
    setDraggedWinId(id)
  }

  const handleDropOnWorkspace = (wsId: number) => {
    if (draggedWinId) {
      soundService.playClick()
      moveWindowToWorkspace(draggedWinId, wsId)
      setDraggedWinId(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[85] backdrop-blur-3xl bg-neutral-950/80 flex flex-col items-center pt-6 pb-8 px-6 animate-fadeIn select-none overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          toggleOverview(false)
        }
      }}
    >
      {/* Top Search Bar */}
      <div className="w-full max-w-md relative mb-6">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          placeholder="Type to search windows & activities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          className="w-full bg-white/10 border border-white/20 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:border-cyan-400 shadow-xl backdrop-blur-xl"
        />
      </div>

      {/* Virtual Desktops Previews Strip */}
      <div className="w-full max-w-4xl flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 bg-white/5 border border-white/15 p-2 rounded-2xl backdrop-blur-xl shadow-2xl overflow-x-auto max-w-full">
          {workspaces.map((ws) => {
            const count = windows.filter((w) => (w.workspaceId || 1) === ws.id).length
            const isActive = activeWorkspace === ws.id

            return (
              <div
                key={ws.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnWorkspace(ws.id)}
                onClick={() => {
                  soundService.playClick()
                  switchWorkspace(ws.id)
                }}
                className={`flex flex-col items-center justify-center w-32 h-20 rounded-xl border transition-all duration-200 cursor-pointer relative group flex-shrink-0 ${
                  isActive
                    ? 'bg-blue-600/30 border-cyan-400/80 ring-2 ring-cyan-500/50 shadow-lg text-white'
                    : 'bg-white/5 border-white/10 hover:bg-white/15 text-neutral-300'
                }`}
              >
                <span className="text-xs font-semibold truncate px-2 text-center w-full">
                  {ws.name}
                </span>
                <span className="text-[10px] text-neutral-400 mt-1 font-mono">
                  {count} {count === 1 ? 'window' : 'windows'}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1.5 w-10 h-1 rounded-full bg-cyan-400" />
                )}
              </div>
            )
          })}

          <button
            onClick={() => {
              soundService.playClick()
              createWorkspace(`Workspace ${workspaces.length + 1}`)
            }}
            className="w-12 h-20 rounded-xl border border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center text-neutral-400 hover:text-white transition-colors flex-shrink-0"
            title="Create New Virtual Desktop"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Main Spatially Arranged Window Cards Grid */}
      <div className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center overflow-y-auto p-4">
        {filteredWindows.length === 0 ? (
          <div className="flex flex-col items-center text-center text-neutral-400 py-12">
            <Layout className="w-16 h-16 stroke-[1.2] opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-neutral-200">
              {searchQuery ? 'No matching windows' : 'No Open Windows in this Workspace'}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              {searchQuery
                ? 'Try a different search query'
                : 'Launch an application from the dock or launcher grid below'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-h-[500px] overflow-y-auto p-2">
            {filteredWindows.map((win) => {
              const appDef = APPS_REGISTRY[win.appId]

              return (
                <div
                  key={win.id}
                  draggable
                  onDragStart={() => handleDragStart(win.id)}
                  onClick={() => handleSelectWindow(win.id)}
                  className="group relative bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyan-400/60 rounded-2xl p-4 shadow-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between h-56"
                >
                  {/* Window Card Titlebar */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <div
                        className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${
                          appDef?.gradient || 'from-blue-500 to-indigo-600'
                        } flex items-center justify-center text-white text-[10px] font-bold shadow`}
                      >
                        {win.title.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-white truncate">
                        {win.title}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleCloseWindow(e, win.id)}
                      className="p-1 rounded-full hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                      title="Close Window"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Window Thumbnail Preview */}
                  <div className="flex-1 rounded-xl bg-black/40 border border-white/5 p-3 flex flex-col justify-between overflow-hidden text-[11px] text-neutral-400 font-mono">
                    <div className="line-clamp-4 leading-relaxed text-neutral-300">
                      {appDef?.description || 'Active application process running.'}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-2 border-t border-white/5">
                      <span>Dimensions: {win.width}x{win.height}</span>
                      <span>Workspace #{win.workspaceId || 1}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Launcher Grid Shortcut */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => {
            soundService.playClick()
            toggleOverview(false)
            toggleLauncher(true)
          }}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-2 border border-white/15 shadow-xl transition-all active:scale-95"
        >
          <LayoutGrid size={15} className="text-cyan-400" />
          <span>Show Applications Grid</span>
        </button>
      </div>
    </div>
  )
}
