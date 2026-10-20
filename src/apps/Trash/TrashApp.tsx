import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { Trash2, RotateCcw, File, Folder, AlertTriangle } from 'lucide-react'

export const TrashApp: React.FC<AppInstanceProps> = () => {
  const { getTrashNodes, restoreFromTrash, deletePermanently, emptyTrash } = useFileSystem()
  const { addNotification } = useNotifications()
  const trashItems = getTrashNodes()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleRestore = (id: string) => {
    soundService.playClick()
    const node = trashItems.find((t) => t.id === id)
    restoreFromTrash(id)
    setSelectedId(null)
    addNotification('File Restored', `Restored "${node?.name}" to original location`, 'finder')
  }

  const handleDeletePermanent = (id: string) => {
    soundService.playTrashEmpty()
    deletePermanently(id)
    setSelectedId(null)
  }

  const handleEmptyTrash = () => {
    soundService.playTrashEmpty()
    emptyTrash()
    setSelectedId(null)
    setShowConfirmModal(false)
    addNotification('Trash Emptied', 'All items in Trash were permanently deleted', 'trash')
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900/90 text-neutral-200 select-none backdrop-blur-xl relative">
      {/* Top Action Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-neutral-900/40">
        <div className="text-xs text-neutral-400 font-medium">
          {trashItems.length} {trashItems.length === 1 ? 'item' : 'items'} in Trash
        </div>

        <div className="flex items-center gap-2">
          {selectedId && (
            <>
              <button
                onClick={() => handleRestore(selectedId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-medium transition"
              >
                <RotateCcw size={13} /> Put Back
              </button>
              <button
                onClick={() => handleDeletePermanent(selectedId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-medium transition"
              >
                Delete Immediately
              </button>
            </>
          )}

          {trashItems.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition shadow-md"
            >
              <Trash2 size={13} /> Empty Trash
            </button>
          )}
        </div>
      </div>

      {/* Trash Contents Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {trashItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-xs">
            <Trash2 size={40} className="mb-2 opacity-30" />
            <p className="font-medium">Trash is Empty</p>
            <p className="text-[11px] text-neutral-600 mt-1">Deleted items will appear here before permanent deletion</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {trashItems.map((item) => {
              const isSelected = item.id === selectedId
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundService.playClick()
                    setSelectedId(item.id)
                  }}
                  className={`flex flex-col items-center p-3 rounded-2xl cursor-pointer transition border ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-2">
                    {item.type === 'folder' ? (
                      <Folder size={36} className="text-blue-400 fill-blue-400/20" />
                    ) : (
                      <File size={36} className="text-neutral-400" />
                    )}
                  </div>
                  <span className="text-xs text-neutral-200 text-center truncate w-full font-medium">
                    {item.name}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-800 border border-white/10 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Empty Trash?</h3>
                <p className="text-xs text-neutral-400">
                  Are you sure you want to permanently erase all items in the Trash? You cannot undo this action.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-neutral-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyTrash}
                className="px-4 py-1.5 rounded-lg text-xs bg-red-600 hover:bg-red-500 text-white font-medium shadow-md"
              >
                Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
