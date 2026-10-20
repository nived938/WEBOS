import React, { useState, useRef, useMemo } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import type { FSNode, SpecialFolder } from '@/core/filesystem/types'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import {
  Folder,
  File,
  FileText,
  Image as ImageIcon,
  Music,
  Trash2,
  Upload,
  Download,
  Plus,
  LayoutGrid,
  List,
  Search,
  ChevronRight,
  HardDrive,
  Clock,
  Sparkles,
  Info,
  CornerDownRight,
} from 'lucide-react'

export const FinderApp: React.FC<AppInstanceProps> = ({ initialArgs }) => {
  const {
    nodes,
    getChildren,
    createFolder,
    createFile,
    renameNode,
    moveToTrash,
    importFiles,
    exportFile,
  } = useFileSystem()
  const { openApp } = useWindowManager()
  const { addNotification } = useNotifications()

  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string>(() => {
    if (initialArgs?.folderId) return initialArgs.folderId as string
    return 'folder-desktop'
  })

  const [history, setHistory] = useState<string[]>([currentFolderId])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [showDetailsPane, setShowDetailsPane] = useState(false)

  const uploadInputRef = useRef<HTMLInputElement>(null)

  const sidebarLinks: { id: string; name: string; folderId: string; icon: React.ComponentType<{ size: number; className?: string }> }[] = [
    { id: 'desktop', name: 'Desktop', folderId: 'folder-desktop', icon: HardDrive },
    { id: 'documents', name: 'Documents', folderId: 'folder-documents', icon: FileText },
    { id: 'downloads', name: 'Downloads', folderId: 'folder-downloads', icon: Download },
    { id: 'pictures', name: 'Pictures', folderId: 'folder-pictures', icon: ImageIcon },
    { id: 'music', name: 'Music', folderId: 'folder-music', icon: Music },
    { id: 'trash', name: 'Trash', folderId: 'folder-trash', icon: Trash2 },
  ]

  const currentFolder = nodes.find((n) => n.id === currentFolderId) || nodes.find((n) => n.id === 'folder-desktop')

  // Get children and sort
  const rawChildren = currentFolderId === 'folder-trash'
    ? nodes.filter((n) => n.isTrash)
    : getChildren(currentFolderId)

  const filteredChildren = useMemo(() => {
    let result = rawChildren.filter((item) =>
      searchQuery === '' ? true : item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    result.sort((a, b) => {
      // Folders first
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'date') return b.updatedAt - a.updatedAt
      if (sortBy === 'size') return (b.size || 0) - (a.size || 0)
      return 0
    })

    return result
  }, [rawChildren, searchQuery, sortBy])

  const navigateTo = (folderId: string) => {
    soundService.playClick()
    setCurrentFolderId(folderId)
    setSelectedIds(new Set())
    const newHist = history.slice(0, historyIndex + 1).concat([folderId])
    setHistory(newHist)
    setHistoryIndex(newHist.length - 1)
  }

  const handleItemClick = (item: FSNode, e: React.MouseEvent) => {
    soundService.playClick()
    if (e.metaKey || e.ctrlKey) {
      const next = new Set(selectedIds)
      if (next.has(item.id)) next.delete(item.id)
      else next.add(item.id)
      setSelectedIds(next)
    } else {
      setSelectedIds(new Set([item.id]))
    }
  }

  const handleItemDoubleClick = (item: FSNode) => {
    soundService.playClick()
    if (item.type === 'folder') {
      navigateTo(item.id)
    } else {
      // Launch app corresponding to file type
      if (item.mimeType?.startsWith('image/') || item.name.endsWith('.svg') || item.name.endsWith('.png') || item.name.endsWith('.jpg')) {
        openApp('photos')
      } else if (item.mimeType?.startsWith('audio/') || item.name.endsWith('.synth') || item.name.endsWith('.mp3')) {
        openApp('music')
      } else if (item.name.endsWith('.app')) {
        openApp('games')
      } else {
        openApp('notes')
      }
    }
  }

  const handleCreateNewFolder = () => {
    soundService.playClick()
    const folder = createFolder(currentFolderId, 'New Folder')
    setRenamingId(folder.id)
    setRenameValue('New Folder')
  }

  const handleCreateNewFile = () => {
    soundService.playClick()
    const file = createFile(currentFolderId, 'Untitled Document.txt', '')
    setRenamingId(file.id)
    setRenameValue('Untitled Document.txt')
  }

  const handleCommitRename = () => {
    if (renamingId && renameValue.trim()) {
      renameNode(renamingId, renameValue.trim())
    }
    setRenamingId(null)
  }

  const handleDeleteSelected = () => {
    soundService.playClick()
    selectedIds.forEach((id) => moveToTrash(id))
    setSelectedIds(new Set())
    addNotification('Moved to Trash', `Selected items were moved to Trash`, 'finder')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const imported = await importFiles(currentFolderId, files)
    addNotification('Files Imported', `Imported ${imported.length} files into ${currentFolder?.name}`, 'finder')
    soundService.playClick()
  }

  const singleSelectedItem = selectedIds.size === 1
    ? nodes.find((n) => n.id === Array.from(selectedIds)[0])
    : null

  const getFileIcon = (node: FSNode) => {
    if (node.type === 'folder') {
      return <Folder size={viewMode === 'grid' ? 44 : 16} className="text-blue-400 fill-blue-400/20" />
    }
    if (node.mimeType?.startsWith('image/') || node.name.endsWith('.svg') || node.name.endsWith('.png') || node.name.endsWith('.jpg')) {
      return <ImageIcon size={viewMode === 'grid' ? 44 : 16} className="text-emerald-400" />
    }
    if (node.mimeType?.startsWith('audio/') || node.name.endsWith('.synth') || node.name.endsWith('.mp3')) {
      return <Music size={viewMode === 'grid' ? 44 : 16} className="text-purple-400" />
    }
    if (node.name.endsWith('.md')) {
      return <FileText size={viewMode === 'grid' ? 44 : 16} className="text-amber-400" />
    }
    return <File size={viewMode === 'grid' ? 44 : 16} className="text-neutral-400" />
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900/90 text-neutral-200 select-none backdrop-blur-xl relative">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-neutral-900/60 backdrop-blur-md">
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 font-semibold text-white">
            <span className="text-neutral-400">Finder</span>
            <ChevronRight size={13} className="text-neutral-500" />
            <span className="text-blue-400">{currentFolder?.name}</span>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-2 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 sm:w-44 bg-black/40 border border-white/10 rounded-lg pl-7 pr-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* New Folder & File buttons */}
          <button
            onClick={handleCreateNewFolder}
            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title="New Folder"
          >
            <Folder size={15} />
          </button>
          <button
            onClick={handleCreateNewFile}
            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title="New Text Document"
          >
            <Plus size={15} />
          </button>

          {/* Upload & Download */}
          <input
            ref={uploadInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => uploadInputRef.current?.click()}
            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title="Import Files from Computer"
          >
            <Upload size={15} />
          </button>

          {singleSelectedItem && singleSelectedItem.type === 'file' && (
            <button
              onClick={() => exportFile(singleSelectedItem.id)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition"
              title="Download to Computer"
            >
              <Download size={15} />
            </button>
          )}

          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition"
              title="Move to Trash"
            >
              <Trash2 size={15} />
            </button>
          )}

          <div className="w-px h-4 bg-white/10 mx-1" />

          {/* Grid / List View Toggle */}
          <div className="flex bg-black/30 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-neutral-400'}`}
              title="Grid View"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-neutral-400'}`}
              title="List View"
            >
              <List size={13} />
            </button>
          </div>

          <button
            onClick={() => setShowDetailsPane((p) => !p)}
            className={`p-1.5 rounded-lg transition ${showDetailsPane ? 'bg-blue-600/30 text-blue-300' : 'text-neutral-400 hover:text-white'}`}
            title="File Inspector"
          >
            <Info size={15} />
          </button>
        </div>
      </div>

      {/* Main Body: Sidebar + File Area + Optional Details Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-white/10 bg-black/20 flex flex-col p-2 space-y-1 text-xs shrink-0">
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">
            Favorites
          </div>
          {sidebarLinks.map((link) => {
            const IconComp = link.icon
            const isActive = currentFolderId === link.folderId
            return (
              <button
                key={link.id}
                onClick={() => navigateTo(link.folderId)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComp size={14} className={isActive ? 'text-blue-400' : 'text-neutral-500'} />
                <span>{link.name}</span>
              </button>
            )
          })}
        </div>

        {/* Files Content Area */}
        <div
          onClick={() => setSelectedIds(new Set())}
          className="flex-1 overflow-y-auto p-4"
        >
          {filteredChildren.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-xs">
              <Folder size={36} className="mb-2 opacity-30" />
              <p>This folder is empty</p>
              <button
                onClick={handleCreateNewFolder}
                className="mt-2 text-blue-400 hover:underline"
              >
                Create a folder
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filteredChildren.map((item) => {
                const isSelected = selectedIds.has(item.id)
                const isRenaming = renamingId === item.id
                return (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemClick(item, e)
                    }}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    className={`flex flex-col items-center p-3 rounded-2xl cursor-pointer transition border group ${
                      isSelected
                        ? 'bg-blue-600/25 border-blue-500 shadow-md'
                        : 'border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className="mb-2 group-hover:scale-105 transition transform duration-150">
                      {getFileIcon(item)}
                    </div>

                    {isRenaming ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleCommitRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommitRename()
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        autoFocus
                        className="w-full text-center bg-black/60 border border-blue-500 rounded px-1 text-xs text-white outline-none"
                      />
                    ) : (
                      <span className="text-xs text-neutral-200 text-center truncate w-full font-medium">
                        {item.name}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            // List View
            <div className="space-y-0.5 text-xs">
              <div className="grid grid-cols-12 px-3 py-1 text-[11px] font-semibold text-neutral-500 border-b border-white/10">
                <div className="col-span-6">Name</div>
                <div className="col-span-3">Date Modified</div>
                <div className="col-span-2">Kind</div>
                <div className="col-span-1 text-right">Size</div>
              </div>

              {filteredChildren.map((item) => {
                const isSelected = selectedIds.has(item.id)
                return (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemClick(item, e)
                    }}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    className={`grid grid-cols-12 items-center px-3 py-1.5 rounded-lg cursor-pointer transition ${
                      isSelected ? 'bg-blue-600/25 text-white' : 'hover:bg-white/5 text-neutral-300'
                    }`}
                  >
                    <div className="col-span-6 flex items-center gap-2 truncate">
                      {getFileIcon(item)}
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="col-span-3 text-[11px] text-neutral-400">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="col-span-2 text-[11px] text-neutral-400 capitalize">
                      {item.type}
                    </div>
                    <div className="col-span-1 text-[11px] text-neutral-400 font-mono text-right">
                      {item.size ? `${Math.round(item.size / 1024)} KB` : '--'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Details Inspector Panel */}
        {showDetailsPane && (
          <div className="w-64 border-l border-white/10 bg-black/20 p-4 flex flex-col text-xs space-y-4 shrink-0">
            <span className="font-bold text-white text-xs uppercase tracking-wider">
              File Details
            </span>

            {singleSelectedItem ? (
              <div className="space-y-3">
                <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl">
                  {getFileIcon(singleSelectedItem)}
                  <span className="font-semibold text-white mt-2 text-center break-all">
                    {singleSelectedItem.name}
                  </span>
                </div>

                <div className="space-y-1.5 text-neutral-300">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-500">Kind:</span>
                    <span className="capitalize">{singleSelectedItem.type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-500">Size:</span>
                    <span className="font-mono">{singleSelectedItem.size ? `${(singleSelectedItem.size / 1024).toFixed(1)} KB` : '0 B'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-500">Modified:</span>
                    <span>{new Date(singleSelectedItem.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      setRenamingId(singleSelectedItem.id)
                      setRenameValue(singleSelectedItem.name)
                    }}
                    className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium"
                  >
                    Rename
                  </button>
                  {singleSelectedItem.type === 'file' && (
                    <button
                      onClick={() => exportFile(singleSelectedItem.id)}
                      className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
                    >
                      Export File
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-neutral-500 text-center py-10">
                Select a single item to view metadata
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
