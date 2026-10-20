import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { WindowState, SnapPosition } from '@/core/windowManager/types'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { WindowControls } from './WindowControls'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'

interface WindowFrameProps {
  windowState: WindowState
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export const WindowFrame: React.FC<WindowFrameProps> = ({ windowState }) => {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    updateWindowBounds,
    snapWindow,
  } = useWindowManager()

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [snapPreview, setSnapPreview] = useState<SnapPosition>('none')

  const dragStartRef = useRef<{ startX: number; startY: number; winX: number; winY: number }>({
    startX: 0,
    startY: 0,
    winX: 0,
    winY: 0,
  })

  const resizeStartRef = useRef<{
    startX: number
    startY: number
    winX: number
    winY: number
    winW: number
    winH: number
    dir: ResizeDirection
  }>({
    startX: 0,
    startY: 0,
    winX: 0,
    winY: 0,
    winW: 0,
    winH: 0,
    dir: 'se',
  })

  const appDef = APPS_REGISTRY[windowState.appId]
  const AppComponent = appDef?.component

  // Pointer down on Titlebar -> Start dragging
  const handleTitleBarPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return // Left click only
    if (windowState.isMaximized) return // Maximize locks drag until restored

    focusWindow(windowState.id)
    setIsDragging(true)

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      winX: windowState.x,
      winY: windowState.y,
    }

    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleTitleBarPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return

    const dx = e.clientX - dragStartRef.current.startX
    const dy = e.clientY - dragStartRef.current.startY

    const nextX = dragStartRef.current.winX + dx
    const nextY = Math.max(30, dragStartRef.current.winY + dy) // Don't go above top menu bar

    updateWindowBounds(windowState.id, { x: nextX, y: nextY })

    // Edge snap detection
    const screenW = window.innerWidth
    if (e.clientX < 20) {
      setSnapPreview('left')
    } else if (e.clientX > screenW - 20) {
      setSnapPreview('right')
    } else if (e.clientY < 35) {
      setSnapPreview('top')
    } else {
      setSnapPreview('none')
    }
  }

  const handleTitleBarPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore
    }

    if (snapPreview !== 'none') {
      snapWindow(windowState.id, snapPreview)
      setSnapPreview('none')
    }
  }

  // Pointer down on Resize Handle
  const handleResizePointerDown = (dir: ResizeDirection, e: React.PointerEvent) => {
    e.stopPropagation()
    if (e.button !== 0) return
    if (windowState.isMaximized) return

    focusWindow(windowState.id)
    setIsResizing(true)

    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      winX: windowState.x,
      winY: windowState.y,
      winW: windowState.width,
      winH: windowState.height,
      dir,
    }

    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
  }

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!isResizing) return

    const { startX, startY, winX, winY, winW, winH, dir } = resizeStartRef.current
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    let newX = winX
    let newY = winY
    let newW = winW
    let newH = winH

    const minW = windowState.minWidth
    const minH = windowState.minHeight

    if (dir.includes('e')) {
      newW = Math.max(minW, winW + dx)
    }
    if (dir.includes('s')) {
      newH = Math.max(minH, winH + dy)
    }
    if (dir.includes('w')) {
      const possibleW = winW - dx
      if (possibleW >= minW) {
        newW = possibleW
        newX = winX + dx
      }
    }
    if (dir.includes('n')) {
      const possibleH = winH - dy
      if (possibleH >= minH && winY + dy >= 30) {
        newH = possibleH
        newY = winY + dy
      }
    }

    updateWindowBounds(windowState.id, { x: newX, y: newY, width: newW, height: newH })
  }

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (!isResizing) return
    setIsResizing(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore
    }
  }

  if (windowState.isMinimized) {
    return null
  }

  const isInteracting = isDragging || isResizing

  return (
    <>
      {/* Snap Preview Ghost Box */}
      {snapPreview !== 'none' && (
        <div
          className={`fixed pointer-events-none z-50 bg-blue-500/20 border-2 border-blue-400/60 backdrop-blur-sm rounded-2xl transition-all duration-150 ${
            snapPreview === 'left'
              ? 'top-[32px] left-2 w-[calc(50vw-12px)] h-[calc(100vh-112px)]'
              : snapPreview === 'right'
              ? 'top-[32px] right-2 w-[calc(50vw-12px)] h-[calc(100vh-112px)]'
              : 'top-[32px] left-2 right-2 h-[calc(100vh-112px)]'
          }`}
        />
      )}

      {/* Main Window Frame */}
      <div
        onMouseDown={() => focusWindow(windowState.id)}
        style={{
          transform: `translate3d(${windowState.x}px, ${windowState.y}px, 0)`,
          width: `${windowState.width}px`,
          height: `${windowState.height}px`,
          zIndex: windowState.zIndex,
        }}
        className={`fixed top-0 left-0 flex flex-col rounded-2xl border transition-shadow duration-200 overflow-hidden ${
          windowState.isFocused
            ? 'border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.1)]'
            : 'border-white/10 shadow-[0_15px_30px_-8px_rgba(0,0,0,0.4)] opacity-95'
        } ${isInteracting ? 'select-none' : ''}`}
      >
        {/* Title Bar */}
        <div
          onPointerDown={handleTitleBarPointerDown}
          onPointerMove={handleTitleBarPointerMove}
          onPointerUp={handleTitleBarPointerUp}
          onDoubleClick={() => toggleMaximize(windowState.id)}
          className={`h-10 flex items-center justify-between px-2 bg-neutral-900/80 backdrop-blur-2xl border-b border-white/10 cursor-default shrink-0 select-none ${
            windowState.isFocused ? 'text-white' : 'text-neutral-400'
          }`}
        >
          {/* Traffic Lights */}
          <WindowControls
            onClose={() => closeWindow(windowState.id)}
            onMinimize={() => minimizeWindow(windowState.id)}
            onMaximize={() => toggleMaximize(windowState.id)}
            isMaximized={windowState.isMaximized}
          />

          {/* Title in center */}
          <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none text-xs font-medium tracking-tight truncate px-16">
            <span>{windowState.title}</span>
          </div>

          <div className="w-12" />
        </div>

        {/* Window Content Body */}
        <div
          className={`flex-1 relative overflow-hidden bg-neutral-900/90 backdrop-blur-2xl ${
            isInteracting ? 'pointer-events-none' : ''
          }`}
        >
          {AppComponent ? (
            <AppComponent
              windowId={windowState.id}
              isFocused={windowState.isFocused}
              initialArgs={windowState.initialArgs}
            />
          ) : (
            <div className="p-4 text-xs text-neutral-400">Application not loaded</div>
          )}
        </div>

        {/* 8-Direction Resizing Handles (only when not maximized) */}
        {!windowState.isMaximized && (
          <>
            {/* Top */}
            <div
              onPointerDown={(e) => handleResizePointerDown('n', e)}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              className="absolute top-0 inset-x-2 h-1.5 cursor-ns-resize z-30"
            />
            {/* Bottom */}
            <div
              onPointerDown={(e) => handleResizePointerDown('s', e)}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              className="absolute bottom-0 inset-x-2 h-1.5 cursor-ns-resize z-30"
            />
            {/* Left */}
            <div
              onPointerDown={(e) => handleResizePointerDown('w', e)}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              className="absolute left-0 inset-y-2 w-1.5 cursor-ew-resize z-30"
            />
            {/* Right */}
            <div
              onPointerDown={(e) => handleResizePointerDown('e', e)}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              className="absolute right-0 inset-y-2 w-1.5 cursor-ew-resize z-30"
            />
            {/* NW */}
            <div
              onPointerDown={(e) => handleResizePointerDown('nw', e)}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-30"
            />
            {/* NE */}
            <div
              onPointerDown={(e) => handleResizePointerDown('ne', e)}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize z-30"
            />
            {/* SW */}
            <div
              onPointerDown={(e) => handleResizePointerDown('sw', e)}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize z-30"
            />
            {/* SE */}
            <div
              onPointerDown={(e) => handleResizePointerDown('se', e)}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-30"
            />
          </>
        )}
      </div>
    </>
  )
}
