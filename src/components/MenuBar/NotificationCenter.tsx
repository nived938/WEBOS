import React from 'react'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { soundService } from '@/core/audio/soundService'
import { Bell, Trash2, X, CloudSun, Calendar as CalIcon } from 'lucide-react'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, clearAll, removeNotification, markAsRead } = useNotifications()
  const { openApp } = useWindowManager()

  if (!isOpen) return null

  const today = new Date()
  const dayName = today.toLocaleDateString(undefined, { weekday: 'long' })
  const monthDay = today.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed top-9 right-2 z-50 w-84 bg-neutral-900/85 backdrop-blur-3xl border border-white/20 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-xs text-neutral-200 select-none animate-in fade-in zoom-in-95 duration-150 space-y-3"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 font-bold text-white text-xs">
          <Bell size={14} className="text-blue-400" />
          <span>Notifications</span>
          {notifications.length > 0 && (
            <span className="bg-blue-600/30 text-blue-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {notifications.length}
            </span>
          )}
        </div>

        {notifications.length > 0 && (
          <button
            onClick={() => {
              soundService.playClick()
              clearAll()
            }}
            className="text-[11px] text-neutral-400 hover:text-white transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Mini Widgets Row: Calendar + Weather */}
      <div className="grid grid-cols-2 gap-2">
        {/* Date Widget */}
        <div
          onClick={() => {
            openApp('calendar')
            onClose()
          }}
          className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition"
        >
          <div className="text-[10px] text-rose-400 font-bold uppercase">{dayName}</div>
          <div className="text-xl font-extrabold text-white leading-none my-1">
            {today.getDate()}
          </div>
          <div className="text-[10px] text-neutral-400">{monthDay}</div>
        </div>

        {/* Weather Simulation Widget */}
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-600/30 to-blue-800/30 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-sky-300">
            <span className="text-[10px] font-semibold">Silicon City</span>
            <CloudSun size={16} />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white leading-none">72°</div>
            <div className="text-[10px] text-sky-200">Partly Cloudy</div>
          </div>
        </div>
      </div>

      {/* Notification Cards List */}
      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-xs">
            No new notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 relative group hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between mb-1">
                <span className="font-semibold text-white text-xs">{n.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    soundService.playClick()
                    removeNotification(n.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white transition p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">{n.message}</p>
              <div className="text-[9px] text-neutral-500 mt-1 font-mono">
                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
