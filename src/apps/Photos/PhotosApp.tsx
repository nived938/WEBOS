import React, { useState, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { useSettings } from '@/core/settings/SettingsContext'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { soundService } from '@/core/audio/soundService'
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Trash2,
  Check,
} from 'lucide-react'

export const PhotosApp: React.FC<AppInstanceProps> = () => {
  const { getChildren, createFile, deletePermanently } = useFileSystem()
  const { updateSettings } = useSettings()
  const { addNotification } = useNotifications()

  // Get picture files from VFS
  const pictureNodes = getChildren('folder-pictures').filter(
    (n) => n.type === 'file' && (n.mimeType?.startsWith('image/') || n.name.endsWith('.svg') || n.name.endsWith('.png') || n.name.endsWith('.jpg'))
  )

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)
  const [filterTab, setFilterTab] = useState<'all' | 'user' | 'system'>('all')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const activePhoto = selectedPhotoIndex !== null ? pictureNodes[selectedPhotoIndex] : null

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        createFile('folder-pictures', file.name, dataUrl, file.type)
        addNotification('Photo Imported', `Added ${file.name} to Photos library`, 'photos')
        soundService.playClick()
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSetWallpaper = () => {
    if (!activePhoto?.content) return
    soundService.playClick()
    updateSettings({
      wallpaperId: 'custom',
      customWallpaperUrl: activePhoto.content,
    })
    addNotification('Wallpaper Updated', `Set "${activePhoto.name}" as desktop wallpaper`, 'settings')
  }

  const handleDeletePhoto = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    soundService.playClick()
    deletePermanently(id)
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-200 select-none">
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-neutral-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick()
              setFilterTab('all')
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filterTab === 'all' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Photos ({pictureNodes.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
          >
            <Upload size={14} /> Import Image
          </button>
        </div>
      </div>

      {/* Main View Area: Grid Gallery or Lightbox Viewer */}
      {selectedPhotoIndex === null ? (
        // Photos Grid
        <div className="flex-1 overflow-y-auto p-4">
          {pictureNodes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-xs">
              <ImageIcon size={36} className="mb-2 opacity-40" />
              <p>No photos in your library.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-blue-400 hover:underline"
              >
                Import from your device
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pictureNodes.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => {
                    soundService.playClick()
                    setSelectedPhotoIndex(idx)
                    setZoomLevel(1)
                    setRotation(0)
                  }}
                  className="group relative aspect-video bg-neutral-900 rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-blue-500/50 hover:shadow-lg transition"
                >
                  <img
                    src={photo.content}
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition">
                    <span className="text-[11px] text-white truncate max-w-[120px] font-medium">
                      {photo.name}
                    </span>
                    <button
                      onClick={(e) => handleDeletePhoto(photo.id, e)}
                      className="text-neutral-400 hover:text-red-400 p-1 rounded"
                      title="Delete Photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Full Preview / Lightbox Mode
        <div className="flex-1 flex flex-col relative bg-black/90">
          {/* Lightbox Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-neutral-900/40 text-xs text-neutral-300">
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-white/10 transition"
            >
              <ChevronLeft size={16} /> Back to Library
            </button>

            <span className="font-medium text-white truncate max-w-[200px]">
              {activePhoto?.name}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 rounded hover:bg-white/10"
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-[11px] font-mono text-neutral-400 w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                className="p-1.5 rounded hover:bg-white/10"
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>

              <div className="w-px h-4 bg-white/10 mx-1" />

              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 rounded hover:bg-white/10"
                title="Rotate 90°"
              >
                <RotateCw size={15} />
              </button>

              <div className="w-px h-4 bg-white/10 mx-1" />

              <button
                onClick={handleSetWallpaper}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white transition"
                title="Use as desktop wallpaper"
              >
                <Check size={14} /> Set as Wallpaper
              </button>
            </div>
          </div>

          {/* Image Display Area with Zoom & Rotate */}
          <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
            {activePhoto && (
              <img
                src={activePhoto.content}
                alt={activePhoto.name}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
                draggable={false}
              />
            )}

            {/* Left / Right Nav Arrows */}
            {selectedPhotoIndex > 0 && (
              <button
                onClick={() => {
                  soundService.playClick()
                  setSelectedPhotoIndex(selectedPhotoIndex - 1)
                  setZoomLevel(1)
                  setRotation(0)
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition border border-white/10"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {selectedPhotoIndex < pictureNodes.length - 1 && (
              <button
                onClick={() => {
                  soundService.playClick()
                  setSelectedPhotoIndex(selectedPhotoIndex + 1)
                  setZoomLevel(1)
                  setRotation(0)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition border border-white/10"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
