import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Download, Pause, Play, Trash2, FolderOpen, CheckCircle, Clock, HardDrive, File, FileCode, FileArchive } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface DownloadItem {
  id: string
  name: string
  size: string
  progress: number
  status: 'downloading' | 'completed' | 'paused'
  speed: string
  eta: string
  type: 'code' | 'archive' | 'media' | 'doc'
}

const INITIAL_DOWNLOADS: DownloadItem[] = [
  { id: 'dl-1', name: 'threejs-bundle-master.tar.gz', size: '42.8 MB', progress: 100, status: 'completed', speed: '0 KB/s', eta: 'Done', type: 'archive' },
  { id: 'dl-2', name: 'nova-highres-wallpapers-4k.zip', size: '128 MB', progress: 74, status: 'downloading', speed: '4.8 MB/s', eta: '8s remaining', type: 'archive' },
  { id: 'dl-3', name: 'neural-network-weights.bin', size: '312 MB', progress: 41, status: 'paused', speed: '0 KB/s', eta: 'Paused', type: 'code' },
  { id: 'dl-4', name: 'modern-web-architecture-2026.pdf', size: '8.4 MB', progress: 100, status: 'completed', speed: '0 KB/s', eta: 'Done', type: 'doc' },
]

export const DownloadsApp: React.FC<AppInstanceProps> = () => {
  const [items, setItems] = useState<DownloadItem[]>(INITIAL_DOWNLOADS)

  const togglePause = (id: string) => {
    soundService.playClick()
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'downloading' ? 'paused' : 'downloading'
        return {
          ...item,
          status: nextStatus,
          speed: nextStatus === 'downloading' ? '3.2 MB/s' : '0 KB/s',
          eta: nextStatus === 'downloading' ? '12s remaining' : 'Paused'
        }
      }
      return item
    }))
  }

  const handleDelete = (id: string) => {
    soundService.playClick()
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const clearCompleted = () => {
    soundService.playClick()
    setItems(prev => prev.filter(i => i.status !== 'completed'))
  }

  const getFileIcon = (type: DownloadItem['type']) => {
    switch (type) {
      case 'code': return <FileCode className="w-5 h-5 text-emerald-400" />
      case 'archive': return <FileArchive className="w-5 h-5 text-amber-400" />
      default: return <File className="w-5 h-5 text-blue-400" />
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden">
      {/* Top Bar */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Download className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-neutral-200">Downloads Manager</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearCompleted}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
          >
            Clear Completed
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-xs">
            No active or recent downloads.
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className="p-3.5 bg-neutral-800/60 rounded-xl border border-white/5 hover:border-white/10 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 truncate">
                  <div className="p-2 rounded-lg bg-neutral-700/50">
                    {getFileIcon(item.type)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-neutral-400 flex items-center space-x-2 mt-0.5">
                      <span>{item.size}</span>
                      <span>•</span>
                      <span>{item.status === 'completed' ? 'Completed' : item.eta}</span>
                      {item.status === 'downloading' && (
                        <>
                          <span>•</span>
                          <span className="text-blue-400">{item.speed}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {item.status !== 'completed' ? (
                    <button
                      onClick={() => togglePause(item.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300"
                      title={item.status === 'downloading' ? 'Pause' : 'Resume'}
                    >
                      {item.status === 'downloading' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ) : (
                    <span className="text-emerald-400 p-1" title="Completed">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-700/50 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.status === 'completed'
                      ? 'bg-emerald-500'
                      : item.status === 'paused'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Storage Footer */}
      <div className="p-3 bg-neutral-950/80 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-3.5 h-3.5 text-neutral-500" />
          <span>Virtual SSD: 12.4 GB Free of 64 GB</span>
        </div>
        <span>{items.filter(i => i.status === 'downloading').length} Downloading</span>
      </div>
    </div>
  )
}
