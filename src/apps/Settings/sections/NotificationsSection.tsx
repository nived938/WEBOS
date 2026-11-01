import React, { useState } from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { Bell, BellOff, Volume2, Shield, Send } from 'lucide-react'

export const NotificationsSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()
  const { addNotification } = useNotifications()
  const [bannerDuration, setBannerDuration] = useState(4)

  const handleSendTestNotification = () => {
    soundService.playClick()
    addNotification(
      'System Alert',
      'This is a sample translucent toast banner from NOVA Notification Center.',
      'settings'
    )
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Notifications & Focus</h3>
        <p className="text-neutral-400 text-xs">
          Manage toast alert banners, Do Not Disturb focus modes, and privacy filters.
        </p>
      </div>

      {/* Do Not Disturb Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2.5">
          {settings.doNotDisturb ? (
            <BellOff size={18} className="text-purple-400" />
          ) : (
            <Bell size={18} className="text-blue-400" />
          )}
          <div>
            <div className="font-semibold text-white text-xs">Do Not Disturb Mode</div>
            <div className="text-[11px] text-neutral-400">Silence all incoming popup notifications and audio chimes</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.doNotDisturb}
          onChange={(e) => updateSettings({ doNotDisturb: e.target.checked })}
          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Banner Duration Slider */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-300 font-medium">Notification Banner Duration</span>
          <span className="font-mono text-cyan-300">{bannerDuration} seconds</span>
        </div>
        <input
          type="range"
          min={2}
          max={10}
          step={1}
          value={bannerDuration}
          onChange={(e) => setBannerDuration(Number(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500">
          <span>2s (Quick)</span>
          <span>4s (Recommended)</span>
          <span>10s (Persistent)</span>
        </div>
      </div>

      {/* Test Notification Button */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
        <div>
          <div className="font-semibold text-white text-xs">Verification Test</div>
          <div className="text-[11px] text-neutral-400">Dispatch an immediate test banner</div>
        </div>
        <button
          onClick={handleSendTestNotification}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-md shadow-blue-600/20"
        >
          <Send size={13} />
          <span>Dispatch Banner</span>
        </button>
      </div>
    </div>
  )
}
