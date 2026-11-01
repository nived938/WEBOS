import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'

export interface PointerLockContextType {
  isLocked: boolean
  virtualPointer: { x: number; y: number }
  isSupported: boolean
  errorMessage: string | null
  activeOwner: string | null
  requestLock: (target?: HTMLElement | null, owner?: string) => Promise<boolean>
  releaseLock: () => void
  toggleLock: (target?: HTMLElement | null, owner?: string) => Promise<boolean>
}

const PointerLockContext = createContext<PointerLockContextType | null>(null)

export const PointerLockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useNotifications()
  const [isLocked, setIsLocked] = useState(false)
  const [activeOwner, setActiveOwner] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [virtualPointer, setVirtualPointer] = useState<{ x: number; y: number }>(() => ({
    x: typeof window !== 'undefined' ? Math.floor(window.innerWidth / 2) : 500,
    y: typeof window !== 'undefined' ? Math.floor(window.innerHeight / 2) : 400,
  }))

  const virtualPosRef = useRef(virtualPointer)
  useEffect(() => {
    virtualPosRef.current = virtualPointer
  }, [virtualPointer])

  const isSupported =
    typeof document !== 'undefined' &&
    ('pointerLockElement' in document ||
      'mozPointerLockElement' in document ||
      'webkitPointerLockElement' in document)

  const targetRef = useRef<HTMLElement | null>(null)
  const pendingPromiseRef = useRef<{
    resolve: (val: boolean) => void
    reject: (err: unknown) => void
  } | null>(null)

  // Track physical pointer lock state changes
  useEffect(() => {
    if (!isSupported) return

    const handlePointerLockChange = () => {
      const lockElem =
        document.pointerLockElement ||
        (document as unknown as { mozPointerLockElement?: Element }).mozPointerLockElement ||
        (document as unknown as { webkitPointerLockElement?: Element }).webkitPointerLockElement

      const nowLocked = Boolean(lockElem)
      setIsLocked(nowLocked)

      if (nowLocked) {
        setErrorMessage(null)
        soundService.playClick()
        if (pendingPromiseRef.current) {
          pendingPromiseRef.current.resolve(true)
          pendingPromiseRef.current = null
        }
      } else {
        setActiveOwner(null)
        targetRef.current = null
        soundService.playClick()
        addNotification(
          'Mouse Released',
          'Immersive mouse capture disengaged. Normal cursor restored.',
          'settings'
        )
        if (pendingPromiseRef.current) {
          pendingPromiseRef.current.resolve(false)
          pendingPromiseRef.current = null
        }
      }
    }

    const handlePointerLockError = (e: Event) => {
      console.warn('Pointer Lock Error:', e)
      setIsLocked(false)
      setActiveOwner(null)
      const msg = 'Pointer lock failed. Ensure user gesture initiates capture.'
      setErrorMessage(msg)
      addNotification('Pointer Lock Notice', msg, 'settings')
      if (pendingPromiseRef.current) {
        pendingPromiseRef.current.resolve(false)
        pendingPromiseRef.current = null
      }
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('mozpointerlockchange', handlePointerLockChange)
    document.addEventListener('webkitpointerlockchange', handlePointerLockChange)

    document.addEventListener('pointerlockerror', handlePointerLockError)
    document.addEventListener('mozpointerlockerror', handlePointerLockError)
    document.addEventListener('webkitpointerlockerror', handlePointerLockError)

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      document.removeEventListener('mozpointerlockchange', handlePointerLockChange)
      document.removeEventListener('webkitpointerlockchange', handlePointerLockChange)

      document.removeEventListener('pointerlockerror', handlePointerLockError)
      document.removeEventListener('mozpointerlockerror', handlePointerLockError)
      document.removeEventListener('webkitpointerlockerror', handlePointerLockError)
    }
  }, [isSupported, addNotification])

  // Virtual Pointer Coordinates Tracker & Event Routing Layer
  useEffect(() => {
    if (!isLocked) return

    const handleMouseMove = (e: MouseEvent) => {
      const screenW = window.innerWidth || 1280
      const screenH = window.innerHeight || 800

      const nextX = Math.max(0, Math.min(screenW - 1, virtualPosRef.current.x + e.movementX))
      const nextY = Math.max(0, Math.min(screenH - 1, virtualPosRef.current.y + e.movementY))

      const updated = { x: nextX, y: nextY }
      virtualPosRef.current = updated
      setVirtualPointer(updated)

      // In desktop mode, if target element is locked, route hover events
      if (activeOwner === 'desktop' && targetRef.current) {
        const elemUnder = document.elementFromPoint(nextX, nextY)
        if (elemUnder && elemUnder !== targetRef.current && !targetRef.current.contains(elemUnder)) {
          // Allow hover states to update
        }
      }
    }

    // Forward click / mouse events to underlying elements when in desktop immersive mode
    const handleMouseAction = (e: MouseEvent) => {
      if (activeOwner !== 'desktop') return

      const x = virtualPosRef.current.x
      const y = virtualPosRef.current.y

      // Temporarily hide virtual cursor overlay to find target element
      const overlay = document.getElementById('nova-virtual-cursor')
      if (overlay) overlay.style.display = 'none'

      const targetElem = document.elementFromPoint(x, y) as HTMLElement | null

      if (overlay) overlay.style.display = ''

      if (targetElem && targetElem !== targetRef.current) {
        // Create synthetic event
        const simulatedEvent = new MouseEvent(e.type, {
          bubbles: true,
          cancelable: true,
          view: window,
          detail: e.detail,
          screenX: window.screenX + x,
          screenY: window.screenY + y,
          clientX: x,
          clientY: y,
          ctrlKey: e.ctrlKey,
          altKey: e.altKey,
          shiftKey: e.shiftKey,
          metaKey: e.metaKey,
          button: e.button,
          buttons: e.buttons,
          relatedTarget: null,
        })
        targetElem.dispatchEvent(simulatedEvent)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseAction)
    window.addEventListener('mouseup', handleMouseAction)
    window.addEventListener('click', handleMouseAction)
    window.addEventListener('dblclick', handleMouseAction)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseAction)
      window.removeEventListener('mouseup', handleMouseAction)
      window.removeEventListener('click', handleMouseAction)
      window.removeEventListener('dblclick', handleMouseAction)
    }
  }, [isLocked, activeOwner])

  const requestLock = useCallback(
    async (target?: HTMLElement | null, owner: string = 'desktop'): Promise<boolean> => {
      if (!isSupported) {
        addNotification(
          'Unsupported Browser Feature',
          'Pointer Lock API is not supported in this browser.',
          'settings'
        )
        return false
      }

      const elem = target || document.body
      targetRef.current = elem
      setActiveOwner(owner)

      // Center the virtual pointer initially
      const initialPos = {
        x: Math.floor(window.innerWidth / 2),
        y: Math.floor(window.innerHeight / 2),
      }
      virtualPosRef.current = initialPos
      setVirtualPointer(initialPos)

      return new Promise<boolean>((resolve, reject) => {
        pendingPromiseRef.current = { resolve, reject }
        try {
          // Standard Element.requestPointerLock
          const requestPromise = elem.requestPointerLock() as unknown as Promise<void> | undefined
          if (requestPromise && typeof requestPromise.then === 'function') {
            requestPromise
              .then(() => {
                // Succeeded, pointerlockchange will trigger
              })
              .catch((err) => {
                console.warn('requestPointerLock rejection:', err)
                pendingPromiseRef.current = null
                setIsLocked(false)
                resolve(false)
              })
          }
        } catch (err) {
          console.error('requestPointerLock invocation failed:', err)
          pendingPromiseRef.current = null
          setIsLocked(false)
          resolve(false)
        }
      })
    },
    [isSupported, addNotification]
  )

  const releaseLock = useCallback(() => {
    if (!isSupported) return
    try {
      if (document.exitPointerLock) {
        document.exitPointerLock()
      } else if ((document as unknown as { mozExitPointerLock?: () => void }).mozExitPointerLock) {
        ;(document as unknown as { mozExitPointerLock: () => void }).mozExitPointerLock()
      }
    } catch (err) {
      console.warn('exitPointerLock error:', err)
    }
    setIsLocked(false)
    setActiveOwner(null)
  }, [isSupported])

  const toggleLock = useCallback(
    async (target?: HTMLElement | null, owner: string = 'desktop'): Promise<boolean> => {
      if (isLocked) {
        releaseLock()
        return false
      } else {
        return requestLock(target, owner)
      }
    },
    [isLocked, releaseLock, requestLock]
  )

  return (
    <PointerLockContext.Provider
      value={{
        isLocked,
        virtualPointer,
        isSupported,
        errorMessage,
        activeOwner,
        requestLock,
        releaseLock,
        toggleLock,
      }}
    >
      {children}
    </PointerLockContext.Provider>
  )
}

export const usePointerLock = (): PointerLockContextType => {
  const context = useContext(PointerLockContext)
  if (!context) {
    throw new Error('usePointerLock must be used within a PointerLockProvider')
  }
  return context
}
