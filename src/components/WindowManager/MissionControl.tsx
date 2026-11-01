import React, { useEffect } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import { soundService } from '@/core/audio/soundService'
import { X, Layout, Monitor, ArrowRightLeft, Sparkles } from 'lucide-react'

export const MissionControl: React.FC = () => {
  const {
    isOverviewOpen,
    toggleOverview,
    windows,
    focusWindow,
    closeWindow,
    activeWorkspace,
    switchWorkspace,
    moveWindowToWorkspace,
  } = useWindowManager()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOverviewOpen) {
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

  const workspaces = [1, 2, 3, 4]

  const handleSelectWindow = (id: string) => {
    soundService.playClick()
    focusWindow(id)
    toggleOverview(false)
  }

  const handleCloseWindow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    closeWindow(id)
  }

  return (
    <div
      className="fixed inset-0 z-[85] backdrop-blur-3xl bg-neutral-950/75 flex flex-col items-center pt-8 pb-10 px-8 animate-fadeIn select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          toggleOverview(false)
        }
      }}
    >
      {/* Top Bar: Workspace Switcher Bar */}
      <div className="w-full max-w-4xl flex flex-col items-center mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Virtual Desktops
        </h2>

        <div className="flex items-center gap-3 bg-white/10 dark:bg-neutral-900/80 p-2 rounded-2xl border border-white/15 backdrop-blur-md shadow-2xl">
          {workspaces.map((wsId) => {
            const count = windows.filter((w) => (w.workspaceId || 1) === wsId).length
            const isActive = activeWorkspace === wsId

            return (
              <button
                key={wsId}
                onClick={() => switchWorkspace(wsId)}
                className={`flex flex-col items-center justify-center w-28 h-18 rounded-xl border transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-blue-600/30 border-blue-400/80 ring-2 ring-blue-500/50 shadow-lg text-white'
                    : 'bg-white/5 border-white/10 hover:bg-white/15 text-neutral-300'
                }`}
              >
                <span className="text-xs font-semibold">Desktop {wsId}</span>
                <span className="text-[10px] text-neutral-400 mt-1">
                  {count} {count === 1 ? 'window' : 'windows'}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1.5 w-8 h-1 rounded-full bg-cyan-400" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Area: Open Windows Overview Grid */}
      <div className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center overflow-y-auto p-4">
        {currentWorkspaceWindows.length === 0 ? (
          <div className="flex flex-col items-center text-center text-neutral-400 py-12">
            <Layout className="w-16 h-16 stroke-[1.2] opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-neutral-200">
              Desktop {activeWorkspace} is Empty
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm">
              Open apps from the Dock or App Launcher, or move open windows from other virtual desktops.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {currentWorkspaceWindows.map((win) => {
              const appDef = APPS_REGISTRY[win.appId]
              const title = win.title || appDef?.title || 'Application'

              return (
                <div
                  key={win.id}
                  onClick={() => handleSelectWindow(win.id)}
                  className="group relative flex flex-col bg-neutral-900/80 border border-white/15 hover:border-cyan-400/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                >
                  {/* Miniature Title Bar */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-800/90 border-b border-white/10">
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${appDef?.gradient || 'from-blue-500 to-indigo-600'} flex items-center justify-center`}
                      >
                        <Sparkles className="w-2 h-2 text-white" />
                      </div>
                      <span className="text-xs font-medium text-white truncate">{title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Move workspace menu / quick button */}
                      <button
                        title="Send to next desktop"
                        onClick={(e) => {
                          e.stopPropagation()
                          const nextWs = activeWorkspace >= 4 ? 1 : activeWorkspace + 1
                          moveWindowToWorkspace(win.id, nextWs)
                        }}
                        className="p-1 text-neutral-400 hover:text-cyan-300 rounded hover:bg-white/10 transition-colors"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>

                      {/* Close button */}
                      <button
                        title="Close window"
                        onClick={(e) => handleCloseWindow(e, win.id)}
                        className="w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Window Content Preview Card */}
                  <div className="h-44 sm:h-52 bg-gradient-to-b from-neutral-900/40 to-neutral-950/80 flex flex-col items-center justify-center p-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${appDef?.gradient || 'from-blue-500 to-cyan-500'} p-[1.5px] shadow-lg mb-2`}
                    >
                      <div className="w-full h-full bg-neutral-900/80 rounded-[14px] flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <span className="text-xs text-neutral-300 font-medium">{appDef?.category}</span>
                    <span className="text-[11px] text-neutral-400 mt-1">
                      {win.width} × {win.height} px
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="mt-4 text-[11px] text-neutral-400 flex items-center gap-2">
        Click any window to switch to it • Press{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono text-[10px]">
          Esc
        </kbd>{' '}
        to exit Mission Control
      </div>
    </div>
  )
}
