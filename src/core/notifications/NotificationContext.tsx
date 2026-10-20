import React, { createContext, useContext, useState, useEffect } from 'react'
import type { SystemNotification, NotificationContextType } from './types'
import { soundService } from '@/core/audio/soundService'

const NOTIFS_STORAGE_KEY = 'nova_os_notifications'

const DEFAULT_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-welcome',
    title: 'Welcome to NOVA OS',
    message: 'Explore your new browser-based operating system. Press Ctrl + Space for Spotlight search.',
    timestamp: Date.now() - 1000 * 60 * 5,
    appId: 'settings',
    read: false,
  },
  {
    id: 'notif-game',
    title: 'New Game Available',
    message: 'Nova Odyssey 2D platformer is ready to play. Launch it from the Dock!',
    timestamp: Date.now() - 1000 * 60 * 2,
    appId: 'games',
    read: false,
  },
]

const NotificationContext = createContext<NotificationContextType | null>(null)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFS_STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // Ignore
    }
    return DEFAULT_NOTIFICATIONS
  })

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifications))
    } catch {
      // Ignore
    }
  }, [notifications])

  const addNotification = (title: string, message: string, appId?: string) => {
    const newNotif: SystemNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      title,
      message,
      timestamp: Date.now(),
      appId,
      read: false,
    }
    setNotifications((prev) => [newNotif, ...prev])
    soundService.playNotification()
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        clearAll,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
