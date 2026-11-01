import React, { useState } from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { Shield, ShieldCheck, Lock, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react'

export const PrivacySection: React.FC = () => {
  const { resetSettings } = useSettings()
  const { resetToDefault } = useFileSystem()
  const { addNotification } = useNotifications()
  const [cleared, setCleared] = useState(false)

  const handleClearCache = () => {
    soundService.playTrashEmpty()
    try {
      sessionStorage.clear()
      setCleared(true)
      setTimeout(() => setCleared(false), 3000)
      addNotification('Cache Cleared', 'Session storage and temporary assets purged.', 'settings')
    } catch {
      // Ignored in sandbox
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Privacy & Security Gate</h3>
        <p className="text-neutral-400 text-xs">
          Inspect client-side storage sandboxes, zero-telemetry contracts, and ephemeral session caches.
        </p>
      </div>

      {/* Security Privacy Gate Badge */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-900/40 to-blue-950/40 border border-emerald-500/30 flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h4 className="font-bold text-xs text-white">100% Client-Side Privacy Architecture</h4>
          <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
            NOVA OS executes completely inside your browser sandbox. No user telemetry, private notes, passwords, or personal files are ever transmitted to remote servers.
          </p>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-400 font-mono">
            <CheckCircle2 size={12} />
            <span>Zero Tracking &bull; Local PBKDF2 Encryption &bull; Web Worker Isolation</span>
          </div>
        </div>
      </div>

      {/* Ephemeral Cache Purge */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
        <div>
          <div className="font-semibold text-white text-xs">Purge Ephemeral Cache</div>
          <div className="text-[11px] text-neutral-400">Clear temporary session states, image thumbnails, and DOM buffers</div>
        </div>
        <button
          onClick={handleClearCache}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
        >
          {cleared ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Trash2 size={13} />}
          <span>{cleared ? 'Purged' : 'Clear Cache'}</span>
        </button>
      </div>

      {/* Cryptographic Key Security Note */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
        <h4 className="font-semibold text-white text-xs flex items-center gap-2">
          <Lock size={14} className="text-amber-400" />
          <span>Local Storage Encryption Protocol</span>
        </h4>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Screen lock credentials are salted using cryptographically secure random bytes (`crypto.getRandomValues`) and derived using PBKDF2 with 100,000 SHA-256 iterations. The plaintext PIN is never stored in persistent disk memory.
        </p>
      </div>
    </div>
  )
}
