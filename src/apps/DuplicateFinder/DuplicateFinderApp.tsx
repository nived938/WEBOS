import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Copy, Trash2, CheckCircle, Search, FileText } from 'lucide-react'

interface DuplicateGroup {
  hash: string
  size: string
  files: { id: string; path: string; modified: string }[]
}

const INITIAL_DUPLICATES: DuplicateGroup[] = [
  {
    hash: 'sha256-4b825dc6...',
    size: '1.4 MB',
    files: [
      { id: '1', path: '/Documents/whitepaper_backup.pdf', modified: '2026-10-22' },
      { id: '2', path: '/Downloads/whitepaper_final(1).pdf', modified: '2026-10-28' },
    ],
  },
  {
    hash: 'sha256-e3b0c442...',
    size: '420 KB',
    files: [
      { id: '3', path: '/Pictures/cosmic_wallpaper_copy.png', modified: '2026-10-15' },
      { id: '4', path: '/Desktop/cosmic_wallpaper.png', modified: '2026-10-15' },
    ],
  },
]

export const DuplicateFinderApp: React.FC<AppInstanceProps> = () => {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>(INITIAL_DUPLICATES)
  const [isScanning, setIsScanning] = useState(false)

  const scanDuplicates = () => {
    soundService.play('buttonClick')
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      alert('VFS deduplication scan complete.')
    }, 1200)
  }

  const deleteFile = (groupIdx: number, fileId: string) => {
    soundService.play('buttonClick')
    setDuplicateGroups((prev) =>
      prev
        .map((group, idx) => {
          if (idx !== groupIdx) return group
          return {
            ...group,
            files: group.files.filter((f) => f.id !== fileId),
          }
        })
        .filter((group) => group.files.length > 1)
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Copy size={16} className="text-amber-400" />
          <span className="font-semibold text-white text-xs">Duplicate File Cleaner</span>
        </div>

        <button
          onClick={scanDuplicates}
          disabled={isScanning}
          className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
        >
          <Search size={13} /> {isScanning ? 'Hashing VFS...' : 'Scan Storage'}
        </button>
      </div>

      {/* Duplicate Groups List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {duplicateGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-xs">
            <CheckCircle size={32} className="text-emerald-400 mb-2" />
            No duplicate files found in storage.
          </div>
        ) : (
          duplicateGroups.map((group, gIdx) => (
            <div
              key={group.hash}
              className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                <span className="font-mono text-neutral-400 text-[11px]">{group.hash}</span>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                  {group.size} each
                </span>
              </div>

              <div className="space-y-2">
                {group.files.map((file, fIdx) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 bg-black/30 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-blue-400" />
                      <span className="text-neutral-200 font-mono">{file.path}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-neutral-500">{file.modified}</span>
                      {fIdx > 0 && (
                        <button
                          onClick={() => deleteFile(gIdx, file.id)}
                          className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-colors text-[10px] flex items-center gap-1"
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
