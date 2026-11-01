import React, { useState, useMemo } from 'react'
import {
  HardDrive,
  Search,
  FileText,
  Trash2,
  Download,
  FolderOpen,
  AlertTriangle,
  Database,
  Filter,
} from 'lucide-react'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { soundService } from '@/core/audio/soundService'
import type { FSNode } from '@/core/filesystem/types'

interface StorageTabProps {
  storageUsedMb: number | null
  storageQuotaMb: number | null
}

export const StorageTab: React.FC<StorageTabProps> = ({ storageUsedMb, storageQuotaMb }) => {
  const { nodes, moveToTrash, exportFile } = useFileSystem()
  const { openApp } = useWindowManager()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'text' | 'image' | 'audio' | 'system'>('all')
  const [deleteConfirmNode, setDeleteConfirmNode] = useState<FSNode | null>(null)

  // Collect all file nodes (excluding trash)
  const allFiles = useMemo(() => {
    return Object.values(nodes).filter((n) => n.type === 'file' && !n.isTrash)
  }, [nodes])

  // Filtered and sorted largest files
  const filteredFiles = useMemo(() => {
    return allFiles
      .filter((file) => {
        const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase())
        if (!matchesSearch) return false

        if (typeFilter === 'text') return file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')
        if (typeFilter === 'image') return file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.webp')
        if (typeFilter === 'audio') return file.name.endsWith('.mp3') || file.name.endsWith('.wav')
        if (typeFilter === 'system') return file.name.endsWith('.sys') || file.name.endsWith('.conf') || file.name.endsWith('.lock')
        return true
      })
      .sort((a, b) => (b.size || 0) - (a.size || 0))
  }, [allFiles, search, typeFilter])

  const formatBytes = (bytes = 0) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleDelete = (node: FSNode) => {
    soundService.play('trash')
    moveToTrash(node.id)
    setDeleteConfirmNode(null)
  }

  const totalVfsBytes = allFiles.reduce((acc, f) => acc + (f.size || 0), 0)

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-5 space-y-4">
      {/* Top Storage Metric Overview */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">NOVA Virtual File System (VFS)</h3>
            <span className="text-xs text-neutral-400 font-mono">
              {allFiles.length} files stored ({formatBytes(totalVfsBytes)})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick()
              openApp('finder')
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" /> Open in Finder
          </button>
        </div>
      </div>

      {/* Search & Type Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search virtual files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
          {(['all', 'text', 'image', 'audio', 'system'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                soundService.playClick()
                setTypeFilter(filter)
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                typeFilter === filter
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* File List Header */}
      <div className="bg-white/5 border border-white/10 rounded-t-xl grid grid-cols-12 px-4 py-2 text-[11px] font-semibold text-neutral-400 select-none">
        <div className="col-span-5">File Name</div>
        <div className="col-span-3">Parent Path</div>
        <div className="col-span-2">File Size</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* File List Items */}
      <div className="flex-1 overflow-y-auto border-x border-b border-white/10 rounded-b-xl divide-y divide-white/5 bg-black/20">
        {filteredFiles.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs">
            No virtual files match your filter criteria.
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-white/5 text-xs text-neutral-200 transition-colors group"
            >
              {/* Name */}
              <div className="col-span-5 flex items-center gap-2.5 min-w-0 pr-2">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium text-white truncate">{file.name}</span>
              </div>

              {/* Path */}
              <div className="col-span-3 text-neutral-400 font-mono text-[11px] truncate">
                {file.parentId ? `/${file.parentId}` : '/root'}
              </div>

              {/* Size */}
              <div className="col-span-2 text-neutral-300 font-mono text-[11px]">
                {formatBytes(file.size)}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-1.5">
                <button
                  title="Export File to Local PC"
                  onClick={() => exportFile(file.id)}
                  className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-cyan-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  title="Move to Trash"
                  onClick={() => setDeleteConfirmNode(file)}
                  className="p-1 rounded hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Safe Delete Confirmation Dialog */}
      {deleteConfirmNode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1d29] border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold text-white">Move File to Trash?</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to move <span className="font-semibold text-white">"{deleteConfirmNode.name}"</span> to
              Trash? You can restore it later from the Trash folder.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmNode(null)}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmNode)}
                className="px-3 py-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 text-xs font-semibold shadow-md shadow-rose-500/30 transition-colors"
              >
                Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
