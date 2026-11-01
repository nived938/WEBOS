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
  Archive,
  Columns,
  X,
  FileCode,
  Tag,
  Copy,
} from 'lucide-react'

interface FinderTab {
  id: string
  folderId: string
  history: string[]
  historyIndex: number
}

type FileFilterCategory = 'all' | 'documents' | 'images' | 'audio' | 'code'

export const FinderApp: React.FC<AppInstanceProps> = ({ initialArgs }) => {
  const {
    nodes,
    getChildren,
    createFolder,
    createFile,
    renameNode,
    moveToTrash,
    restoreFromTrash,
    emptyTrash,
    importFiles,
    exportFile,
  } = useFileSystem()
  const { openApp } = useWindowManager()
  const { addNotification } = useNotifications()

  // Tabs state
  const [tabs, setTabs] = useState<FinderTab[]>([
    {
      id: 'tab-1',
      folderId: (initialArgs?.folderId as string) || 'folder-desktop',
      history: [(initialArgs?.folderId as string) || 'folder-desktop'],
      historyIndex: 0,
    },
  ])
  const [activeTabId, setActiveTabId] = useState<string>('tab-1')

  // Dual pane mode state
  const [isDualPane, setIsDualPane] = useState(false)
  const [rightPaneFolderId, setRightPaneFolderId] = useState<string>('folder-documents')

  // Active tab derived
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]
  const currentFolderId = activeTab.folderId

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<FileFilterCategory>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [showDetailsPane, setShowDetailsPane] = useState(false)
  const [showBatchRenameModal, setShowBatchRenameModal] = useState(false)
  const [batchPrefix, setBatchPrefix] = useState('doc_')

  const uploadInputRef = useRef<HTMLInputElement>(null)

  const sidebarLinks: {
    id: string
    name: string
    folderId: string
    icon: React.ComponentType<{ size: number; className?: string }>
  }[] = [
    { id: 'desktop', name: 'Desktop', folderId: 'folder-desktop', icon: HardDrive },
    { id: 'documents', name: 'Documents', folderId: 'folder-documents', icon: FileText },
    { id: 'downloads', name: 'Downloads', folderId: 'folder-downloads', icon: Download },
    { id: 'pictures', name: 'Pictures', folderId: 'folder-pictures', icon: ImageIcon },
    { id: 'music', name: 'Music', folderId: 'folder-music', icon: Music },
    { id: 'trash', name: 'Trash', folderId: 'folder-trash', icon: Trash2 },
  ]

  const currentFolder =
    nodes.find((n) => n.id === currentFolderId) || nodes.find((n) => n.id === 'folder-desktop')

  const getFilteredNodes = (folderId: string) => {
    const raw = folderId === 'folder-trash' ? nodes.filter((n) => n.isTrash) : getChildren(folderId)

    let filtered = raw.filter((item) =>
      searchQuery === '' ? true : item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => {
        if (item.type === 'folder') return true
        if (categoryFilter === 'documents') {
          return item.name.endsWith('.txt') || item.name.endsWith('.pdf') || item.name.endsWith('.doc')
        }
        if (categoryFilter === 'images') {
          return (
            item.mimeType?.startsWith('image/') ||
            item.name.endsWith('.svg') ||
            item.name.endsWith('.png') ||
            item.name.endsWith('.jpg')
          )
        }
        if (categoryFilter === 'audio') {
          return item.mimeType?.startsWith('audio/') || item.name.endsWith('.mp3') || item.name.endsWith('.synth')
        }
        if (categoryFilter === 'code') {
          return (
            item.name.endsWith('.ts') ||
            item.name.endsWith('.js') ||
            item.name.endsWith('.json') ||
            item.name.endsWith('.html') ||
            item.name.endsWith('.css')
          )
        }
        return true
      })
    }

    filtered.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'date') return b.updatedAt - a.updatedAt
      if (sortBy === 'size') return (b.size || 0) - (a.size || 0)
      return 0
    })

    return filtered
  }

  const filteredChildren = useMemo(() => getFilteredNodes(currentFolderId), [
    nodes,
    currentFolderId,
    searchQuery,
    categoryFilter,
    sortBy,
  ])

  const rightPaneChildren = useMemo(() => getFilteredNodes(rightPaneFolderId), [
    nodes,
    rightPaneFolderId,
    searchQuery,
    categoryFilter,
    sortBy,
  ])

  const navigateTo = (folderId: string) => {
    soundService.playClick()
    setSelectedIds(new Set())
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTabId) return t
        const newHist = t.history.slice(0, t.historyIndex + 1).concat([folderId])
        return {
          ...t,
          folderId,
          history: newHist,
          historyIndex: newHist.length - 1,
        }
      })
    )
  }

  const handleAddTab = () => {
    soundService.playClick()
    const newTabId = 'tab_' + Date.now()
    const newTab: FinderTab = {
      id: newTabId,
      folderId: 'folder-documents',
      history: ['folder-documents'],
      historyIndex: 0,
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTabId)
  }

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabs.length === 1) return
    soundService.playClick()
    setTabs((prev) => prev.filter((t) => t.id !== id))
    if (activeTabId === id) {
      setActiveTabId(tabs.find((t) => t.id !== id)?.id || '')
    }
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
    } else if (item.name.endsWith('.zip')) {
      // Simulate ZIP extract
      const extractFolder = createFolder(currentFolderId, item.name.replace('.zip', '') + '_extracted')
      createFile(extractFolder.id, 'extracted_readme.txt', 'Files extracted from ' + item.name)
      addNotification('Archive Extracted', `Extracted archive contents into folder`, 'finder')
    } else {
      // Launch app corresponding to file type
      if (
        item.mimeType?.startsWith('image/') ||
        item.name.endsWith('.svg') ||
        item.name.endsWith('.png') ||
        item.name.endsWith('.jpg')
      ) {
        openApp('photos')
      } else if (
        item.mimeType?.startsWith('audio/') ||
        item.name.endsWith('.synth') ||
        item.name.endsWith('.mp3')
      ) {
        openApp('music')
      } else if (item.name.endsWith('.pdf')) {
        openApp('pdfreader')
      } else if (item.name.endsWith('.ts') || item.name.endsWith('.js')) {
        openApp('codestudio')
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

  const handleCreateZipArchive = () => {
    if (selectedIds.size === 0) return
    soundService.playClick()
    createFile(currentFolderId, `archive_${Date.now().toString().slice(-4)}.zip`, 'PK_ZIP_HEADER_VFS')
    addNotification('Archive Created', `Compressed ${selectedIds.size} files into ZIP archive`, 'finder')
  }

  const handleBatchRename = (e: React.FormEvent) => {
    e.preventDefault()
    if (!batchPrefix.trim() || selectedIds.size === 0) return
    soundService.playClick()
    let count = 1
    selectedIds.forEach((id) => {
      const node = nodes.find((n) => n.id === id)
      if (node) {
        const ext = node.name.includes('.') ? '.' + node.name.split('.').pop() : ''
        renameNode(id, `${batchPrefix}${count}${ext}`)
        count++
      }
    })
    setShowBatchRenameModal(false)
    addNotification('Batch Renamed', `Renamed ${selectedIds.size} files successfully`, 'finder')
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
    addNotification(
      'Files Imported',
      `Imported ${imported.length} files into ${currentFolder?.name}`,
      'finder'
    )
    soundService.playClick()
  }

  const singleSelectedItem =
    selectedIds.size === 1 ? nodes.find((n) => n.id === Array.from(selectedIds)[0]) : null

  const getFileIcon = (node: FSNode) => {
    if (node.type === 'folder') {
      return <Folder size={viewMode === 'grid' ? 44 : 16} className="text-blue-400 fill-blue-400/20" />
    }
    if (node.name.endsWith('.zip')) {
      return <Archive size={viewMode === 'grid' ? 44 : 16} className="text-amber-400" />
    }
    if (
      node.mimeType?.startsWith('image/') ||
      node.name.endsWith('.svg') ||
      node.name.endsWith('.png') ||
      node.name.endsWith('.jpg')
    ) {
      return <ImageIcon size={viewMode === 'grid' ? 44 : 16} className="text-emerald-400" />
    }
    if (node.mimeType?.startsWith('audio/') || node.name.endsWith('.synth') || node.name.endsWith('.mp3')) {
      return <Music size={viewMode === 'grid' ? 44 : 16} className="text-purple-400" />
    }
    if (node.name.endsWith('.md') || node.name.endsWith('.txt')) {
      return <FileText size={viewMode === 'grid' ? 44 : 16} className="text-amber-400" />
    }
    if (node.name.endsWith('.ts') || node.name.endsWith('.js') || node.name.endsWith('.json')) {
      return <FileCode size={viewMode === 'grid' ? 44 : 16} className="text-cyan-400" />
    }
    return <File size={viewMode === 'grid' ? 44 : 16} className="text-neutral-400" />
  }

  return (
    <div className="flex flex-col h-full bg-[#16161d] text-neutral-200 select-none backdrop-blur-xl relative font-sans">
      {/* Tab Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/50 px-2 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const fNode = nodes.find((n) => n.id === tab.folderId)
            const tabTitle = fNode?.name || 'Folder'
            const isActive = activeTabId === tab.id
            return (
              <div
                key={tab.id}
                onClick={() => {
                  soundService.playClick()
                  setActiveTabId(tab.id)
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg border-t border-x cursor-pointer transition-colors text-xs ${
                  isActive
                    ? 'bg-[#1e1e26] border-white/20 text-white font-medium shadow'
                    : 'bg-black/30 border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Folder size={13} className="text-blue-400" />
                <span className="truncate max-w-[120px]">{tabTitle}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="hover:text-red-400 p-0.5"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            )
          })}
          <button
            onClick={handleAddTab}
            className="p-1 hover:bg-white/10 rounded text-neutral-400 ml-1"
            title="New Tab"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Dual pane toggle */}
        <div className="flex items-center gap-2 pb-1.5">
          <button
            onClick={() => {
              soundService.playClick()
              setIsDualPane(!isDualPane)
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isDualPane ? 'bg-blue-600 text-white' : 'bg-white/5 hover:bg-white/10 text-neutral-300'
            }`}
          >
            <Columns size={13} /> {isDualPane ? 'Dual Pane: ON' : 'Dual Pane'}
          </button>
        </div>
      </div>

      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/40 backdrop-blur-md">
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 font-semibold text-white">
            <span className="text-neutral-400">VFS</span>
            <ChevronRight size={13} className="text-neutral-500" />
            <span className="text-blue-400">{currentFolder?.name}</span>
          </div>

          {/* Category filter pills */}
          <div className="hidden lg:flex items-center gap-1 ml-4">
            {(['all', 'documents', 'images', 'audio', 'code'] as FileFilterCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded text-[11px] capitalize transition-colors ${
                  categoryFilter === cat ? 'bg-white/20 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
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
              className="w-28 sm:w-40 bg-black/40 border border-white/10 rounded-lg pl-7 pr-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
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

          {/* Archive ZIP action */}
          {selectedIds.size > 0 && (
            <button
              onClick={handleCreateZipArchive}
              className="p-1.5 rounded-lg hover:bg-white/10 text-amber-400 transition"
              title="Compress Selection into ZIP Archive"
            >
              <Archive size={15} />
            </button>
          )}

          {/* Batch rename */}
          {selectedIds.size > 1 && (
            <button
              onClick={() => setShowBatchRenameModal(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-blue-400 transition"
              title="Batch Rename Selected"
            >
              <Tag size={15} />
            </button>
          )}

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

          {currentFolderId === 'folder-trash' ? (
            <>
              {selectedIds.size > 0 && (
                <button
                  onClick={() => {
                    soundService.playClick()
                    selectedIds.forEach((id) => restoreFromTrash(id))
                    setSelectedIds(new Set())
                    addNotification('Restored', 'Restored selected files from Trash', 'finder')
                  }}
                  className="px-2 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white transition text-xs font-medium"
                >
                  Restore
                </button>
              )}
              <button
                onClick={() => {
                  soundService.playTrashEmpty()
                  emptyTrash()
                  setSelectedIds(new Set())
                  addNotification('Trash Emptied', 'All files removed permanently', 'finder')
                }}
                className="px-2 py-1 rounded-lg bg-red-600/30 text-red-300 hover:bg-red-600 hover:text-white transition text-xs font-medium"
              >
                Empty Trash
              </button>
            </>
          ) : (
            selectedIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                title="Move to Trash"
              >
                <Trash2 size={15} />
              </button>
            )
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
            className={`p-1.5 rounded-lg transition ${
              showDetailsPane ? 'bg-blue-600/30 text-blue-300' : 'text-neutral-400 hover:text-white'
            }`}
            title="File Inspector"
          >
            <Info size={15} />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-44 border-r border-white/10 bg-black/20 flex flex-col p-2 space-y-1 text-xs shrink-0">
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

        {/* Main Pane (Left) */}
        <div
          onClick={() => setSelectedIds(new Set())}
          className="flex-1 overflow-y-auto p-4 border-r border-white/5"
        >
          {filteredChildren.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-xs">
              <Folder size={36} className="mb-2 opacity-30" />
              <p>This folder is empty</p>
              <button onClick={handleCreateNewFolder} className="mt-2 text-blue-400 hover:underline">
                Create a folder
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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

        {/* Right Pane (Dual Pane Mode) */}
        {isDualPane && (
          <div className="flex-1 overflow-y-auto p-4 border-l border-white/10 bg-black/10">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-xs font-semibold text-neutral-300">
              <span>Right Pane: Documents</span>
              <span className="text-[10px] text-neutral-500">Secondary Target</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {rightPaneChildren.map((item) => (
                <div
                  key={item.id}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  className="flex flex-col items-center p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer border border-transparent hover:border-white/10"
                >
                  <div className="mb-1">{getFileIcon(item)}</div>
                  <span className="text-xs text-neutral-200 text-center truncate w-full">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details Inspector Panel */}
        {showDetailsPane && (
          <div className="w-60 border-l border-white/10 bg-black/20 p-4 flex flex-col text-xs space-y-4 shrink-0">
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
                    <span className="font-mono">
                      {singleSelectedItem.size
                        ? `${(singleSelectedItem.size / 1024).toFixed(1)} KB`
                        : '0 B'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-500">Modified:</span>
                    <span>{new Date(singleSelectedItem.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  {singleSelectedItem.isTrash ? (
                    <button
                      onClick={() => {
                        restoreFromTrash(singleSelectedItem.id)
                        addNotification(
                          'Restored',
                          `Restored "${singleSelectedItem.name}"`,
                          'finder'
                        )
                      }}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                    >
                      Restore from Trash
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setRenamingId(singleSelectedItem.id)
                        setRenameValue(singleSelectedItem.name)
                      }}
                      className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium"
                    >
                      Rename
                    </button>
                  )}
                  {singleSelectedItem.type === 'file' && (
                    <button
                      onClick={() => exportFile(singleSelectedItem.id)}
                      className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
                    >
                      Export File
                    </button>
                  )}
                </div>

                {/* Text Content Preview */}
                {singleSelectedItem.content && (
                  <div className="pt-2">
                    <span className="text-[11px] text-neutral-400 font-semibold block mb-1">
                      Preview:
                    </span>
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10 font-mono text-[10px] text-neutral-300 max-h-28 overflow-y-auto whitespace-pre-wrap break-all">
                      {singleSelectedItem.content.slice(0, 300)}
                      {singleSelectedItem.content.length > 300 && '...'}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-neutral-500 text-center py-10">
                Select an item to view metadata
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Storage Bar */}
      <div className="px-4 py-1.5 border-t border-white/10 bg-black/50 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-2">
          <HardDrive size={13} className="text-purple-400" />
          <span>VFS Storage: 540 MB Used / 2.00 GB Total (IndexedDB)</span>
        </div>
        <div className="w-36 bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div className="bg-purple-500 h-full w-[27%]" />
        </div>
      </div>

      {/* Batch Rename Modal */}
      {showBatchRenameModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleBatchRename}
            className="w-80 bg-[#20202a] border border-white/20 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Tag size={15} className="text-blue-400" /> Batch Rename Files
            </h3>
            <p className="text-xs text-neutral-400">
              Renaming {selectedIds.size} files with sequential prefix.
            </p>
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Filename Prefix</label>
              <input
                type="text"
                value={batchPrefix}
                onChange={(e) => setBatchPrefix(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchRenameModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs bg-white/10 text-neutral-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium"
              >
                Apply Rename
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
