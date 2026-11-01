import React from 'react'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { HardDrive, Trash2, FileText, Image, Code, Sparkles } from 'lucide-react'

export const StorageSection: React.FC = () => {
  const { nodes, resetToDefault } = useFileSystem()
  const { addNotification } = useNotifications()

  const totalStorage = 100 * 1024 * 1024 // 100 MB virtual quota
  const usedBytes = nodes.reduce((acc, curr) => acc + (curr.size || 0), 0)
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(2)
  const freeMB = (100 - Number(usedMB)).toFixed(2)
  const percentUsed = Math.max(3, Math.min(100, (Number(usedMB) / 100) * 100))

  const handleResetVFS = () => {
    soundService.playTrashEmpty()
    resetToDefault()
    addNotification('Storage Reset', 'Restored default filesystem tree.', 'settings')
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Virtual Storage & SSD</h3>
        <p className="text-neutral-400 text-xs">
          Inspect IndexedDB persistent storage utilization, file allocations, and disk maintenance.
        </p>
      </div>

      {/* Storage Breakdown Card */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex justify-between text-xs">
          <span className="text-white font-semibold flex items-center gap-2">
            <HardDrive size={15} className="text-blue-400" />
            <span>NOVA Virtual SSD</span>
          </span>
          <span className="font-mono text-cyan-300">{usedMB} MB used of 100 MB</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${percentUsed}%` }} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <div className="text-[10px] text-neutral-400">Allocated Space</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">{usedMB} MB</div>
          </div>
          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <div className="text-[10px] text-neutral-400">Available Quota</div>
            <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">{freeMB} MB</div>
          </div>
        </div>

        <div className="flex gap-4 text-[11px] text-neutral-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Virtual Files ({nodes.length} items)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span>Free Space</span>
          </div>
        </div>
      </div>

      {/* Filesystem Maintenance */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
        <div>
          <div className="font-semibold text-white text-xs">Reset Virtual Filesystem</div>
          <div className="text-[11px] text-neutral-400">Reverts all desktop, document, and download files to initial seeds</div>
        </div>
        <button
          onClick={handleResetVFS}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-medium transition"
        >
          <Trash2 size={13} />
          <span>Reset Files</span>
        </button>
      </div>
    </div>
  )
}
