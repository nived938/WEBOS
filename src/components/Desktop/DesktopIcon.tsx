import React, { useState, useRef } from 'react'
import type { FSNode } from '@/core/filesystem/types'
import { Folder, File, FileText, Image, Music, Gamepad2, HardDrive } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface DesktopIconProps {
  node: FSNode
  isSelected: boolean
  x: number
  y: number
  onSelect: (e: React.MouseEvent) => void
  onDoubleClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
  onMove: (newX: number, newY: number) => void
  onRename: (newName: string) => void
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  node,
  isSelected,
  x,
  y,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onMove,
  onRename,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameText, setRenameText] = useState(node.name)
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  })

  const getIcon = () => {
    if (node.id === 'shortcut-drive') {
      return <HardDrive size={38} className="text-neutral-300 drop-shadow-md" />
    }
    if (node.name.endsWith('.app')) {
      return <Gamepad2 size={38} className="text-violet-400 drop-shadow-md" />
    }
    if (node.type === 'folder') {
      return <Folder size={38} className="text-blue-400 fill-blue-400/30 drop-shadow-md" />
    }
    if (node.name.endsWith('.md') || node.name.endsWith('.txt')) {
      return <FileText size={38} className="text-amber-400 drop-shadow-md" />
    }
    if (node.mimeType?.startsWith('image/') || node.name.endsWith('.svg') || node.name.endsWith('.png') || node.name.endsWith('.jpg')) {
      return <Image size={38} className="text-emerald-400 drop-shadow-md" />
    }
    if (node.mimeType?.startsWith('audio/') || node.name.endsWith('.synth') || node.name.endsWith('.mp3')) {
      return <Music size={38} className="text-purple-400 drop-shadow-md" />
    }
    return <File size={38} className="text-neutral-300 drop-shadow-md" />
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    onSelect(e as unknown as React.MouseEvent)

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: x,
      initY: y,
    }
    setIsDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY

    // Only move if dragged beyond threshold
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      const nextX = Math.max(10, Math.min(window.innerWidth - 90, dragRef.current.initX + dx))
      const nextY = Math.max(35, Math.min(window.innerHeight - 110, dragRef.current.initY + dy))
      onMove(nextX, nextY)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // Ignore
    }
  }

  const handleCommitRename = () => {
    if (renameText.trim() && renameText !== node.name) {
      onRename(renameText.trim())
    }
    setIsRenaming(false)
  }

  return (
    <div
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onDoubleClick()
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onContextMenu(e)
      }}
      className={`fixed w-20 flex flex-col items-center p-1.5 rounded-xl cursor-pointer select-none transition-shadow group ${
        isSelected
          ? 'bg-blue-600/30 ring-1 ring-blue-400/60 shadow-lg'
          : 'hover:bg-white/10'
      } ${isDragging ? 'z-30 cursor-grabbing opacity-90' : 'z-10'}`}
    >
      <div className="w-11 h-11 flex items-center justify-center mb-1 group-hover:scale-105 transition transform duration-150">
        {getIcon()}
      </div>

      {isRenaming ? (
        <input
          type="text"
          value={renameText}
          onChange={(e) => setRenameText(e.target.value)}
          onBlur={handleCommitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCommitRename()
            if (e.key === 'Escape') setIsRenaming(false)
          }}
          autoFocus
          className="w-full text-center bg-black/70 border border-blue-400 rounded px-1 text-[11px] text-white outline-none"
        />
      ) : (
        <span
          className={`text-[11px] font-medium text-center text-white leading-tight px-1 rounded break-words line-clamp-2 max-w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
            isSelected ? 'bg-blue-600/70' : ''
          }`}
        >
          {node.name}
        </span>
      )}
    </div>
  )
}
