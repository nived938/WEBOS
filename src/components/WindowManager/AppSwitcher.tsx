import React, { useState, useEffect } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import type { AppId } from '@/types'
import { soundService } from '@/core/audio/soundService'

export const AppSwitcher: React.FC = () => {
  const { windows, runningAppIds, focusWindow } = useWindowManager()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Listen for Alt + Tab globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'Tab' || e.code === 'Tab')) {
        e.preventDefault()
        if (runningAppIds.length === 0) return

        soundService.playClick()
        if (!isOpen) {
          setIsOpen(true)
          setSelectedIndex(runningAppIds.length > 1 ? 1 : 0)
        } else {
          setSelectedIndex((prev) => (prev + 1) % runningAppIds.length)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey && isOpen) {
        // Alt released -> switch to selected app
        const targetAppId = runningAppIds[selectedIndex]
        if (targetAppId) {
          const targetWin = windows.find((w) => w.appId === targetAppId)
          if (targetWin) {
            focusWindow(targetWin.id)
          }
        }
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isOpen, selectedIndex, runningAppIds, windows, focusWindow])

  if (!isOpen || runningAppIds.length === 0) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none">
      <div className="bg-neutral-900/80 backdrop-blur-3xl border border-white/20 p-4 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] flex items-center gap-3 animate-in zoom-in-95 duration-150">
        {runningAppIds.map((appId, idx) => {
          const appDef = APPS_REGISTRY[appId]
          const isSelected = idx === selectedIndex
          return (
            <div
              key={appId}
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl p-2 transition-all duration-150 ${
                isSelected
                  ? 'bg-white/20 ring-1 ring-white/40 scale-105 shadow-lg'
                  : 'bg-white/5 opacity-70'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${appDef?.gradient || 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-md mb-1`}
              >
                <span className="text-white font-bold text-sm">
                  {appDef?.title.charAt(0) || 'A'}
                </span>
              </div>
              <span className="text-[10px] font-medium text-white truncate max-w-full text-center">
                {appDef?.title || appId}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
