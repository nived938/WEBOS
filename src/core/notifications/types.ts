export interface SystemNotification {
  id: string
  title: string
  message: string
  timestamp: number
  appId?: string
  read: boolean
}

export interface NotificationContextType {
  notifications: SystemNotification[]
  unreadCount: number
  addNotification: (title: string, message: string, appId?: string) => void
  markAsRead: (id: string) => void
  clearAll: () => void
  removeNotification: (id: string) => void
}
