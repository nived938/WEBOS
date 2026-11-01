import React, { useState, useEffect } from 'react'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { HardDrive, Trash2, FileText, Image, Code, Sparkles, Download, Upload, RefreshCw } from 'lucide-react'
import type { StorageStats } from '@/core/filesystem/types'

export const StorageSection: React.FC = () => {
  const { nodes, resetToDefault, exportArchive, importArchive, getStorageStats } = useFileSystem()
  const { addNotification } = useNotifications()
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const loadStats = async () => {
    const s = await getStorageStats()
    setStats(s)
  }

  useEffect(() => {
    loadStats()
  }, [nodes.length])

  const totalQuota = stats?.quotaBytes || 100 * 1024 * 1024 // Real browser quota or 100MB fallback
  const usedBytes = stats?.usedBytes ?? nodes.reduce((acc, curr) => acc + (curr.size || 0), 0)
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(2)
  const quotaMB = (totalQuota / (1024 * 1024)).toFixed(0)
  const freeMB = Math.max(0, Number(quotaMB) - Number(usedMB)).toFixed(2)
  const percentUsed = Math.max(1, Math.min(100, (Number(usedMB) / Number(quotaMB)) * 100))

  const handleResetVFS = () => {
    soundService.playTrashEmpty()
    resetToDefault()
    addNotification('Storage Reset', 'Restored default filesystem tree.', 'settings')
  }

  const handleExportArchive = async () => {
    setIsExporting(true)
    try {
      soundService.playClick()
      const json = await exportArchive()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nova-os-vfs-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      addNotification('Backup Created', 'Downloaded complete filesystem archive.', 'settings')
    } catch {
      addNotification('Export Failed', 'Could not export filesystem archive.', 'settings')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportArchive = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    try {
      soundService.playClick()
      const text = await file.text()
      const success = await importArchive(text, 'merge')
      if (success) {
        addNotification('Backup Restored', `Merged archive from ${file.name}.`, 'settings')
      } else {
        addNotification('Restore Error', 'Invalid or corrupted VFS archive JSON format.', 'settings')
      }
    } catch {
      addNotification('Restore Failed', 'Failed reading selected file.', 'settings')
    } finally {
      setIsImporting(false)
      e.target.value = ''
    }
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
          <span className="font-mono text-cyan-300">{usedMB} MB used of {quotaMB} MB</span>
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
            <div className="text-[10px] text-neutral-400">Available Storage</div>
            <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">{freeMB} MB</div>
          </div>
        </div>

        <div className="flex gap-4 text-[11px] text-neutral-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Files ({stats?.fileCount ?? 0} items)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Directories ({stats?.folderCount ?? 0} folders)</span>
          </div>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <div className="font-semibold text-white text-xs">Filesystem Backup & Migration</div>
        <div className="text-[11px] text-neutral-400">
          Export your entire virtual disk (files, code, notes, assets) to a JSON backup archive or restore it.
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleExportArchive}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition active:scale-95 disabled:opacity-50"
          >
            <Download size={13} />
            <span>{isExporting ? 'Exporting...' : 'Export Backup'}</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition cursor-pointer active:scale-95">
            <Upload size={13} />
            <span>{isImporting ? 'Restoring...' : 'Restore Archive'}</span>
            <input type="file" accept=".json" onChange={handleImportArchive} className="hidden" />
          </label>
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
