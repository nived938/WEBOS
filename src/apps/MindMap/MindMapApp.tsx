import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Plus, Trash2, GitFork, Download, Sparkles, Move } from 'lucide-react'

interface MindNode {
  id: string
  text: string
  parentId: string | null
  x: number
  y: number
  color: string
}

const INITIAL_NODES: MindNode[] = [
  { id: 'root', text: 'NOVA OS Core', parentId: null, x: 280, y: 160, color: '#3b82f6' },
  { id: 'n1', text: 'Liquid Glass Compositor', parentId: 'root', x: 80, y: 70, color: '#8b5cf6' },
  { id: 'n2', text: 'Spatial Workspaces', parentId: 'root', x: 480, y: 70, color: '#10b981' },
  { id: 'n3', text: 'Client-Side VFS', parentId: 'root', x: 80, y: 270, color: '#f59e0b' },
  { id: 'n4', text: 'Package Verification', parentId: 'root', x: 480, y: 270, color: '#ec4899' },
]

export const MindMapApp: React.FC<AppInstanceProps> = () => {
  const [nodes, setNodes] = useState<MindNode[]>(INITIAL_NODES)
  const [selectedId, setSelectedId] = useState<string>('root')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    setSelectedId(id)
    setDraggingId(id)
    const node = nodes.find((n) => n.id === id)
    if (node) {
      setDragOffset({
        x: e.clientX - node.x,
        y: e.clientY - node.y,
      })
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return
    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y
    setNodes((prev) =>
      prev.map((n) => (n.id === draggingId ? { ...n, x: newX, y: newY } : n))
    )
  }

  const handlePointerUp = () => {
    setDraggingId(null)
  }

  const addChildNode = () => {
    soundService.play('buttonClick')
    const parent = nodes.find((n) => n.id === selectedId) || nodes[0]
    const newNode: MindNode = {
      id: 'n_' + Date.now(),
      text: 'Sub-topic',
      parentId: parent.id,
      x: parent.x + (Math.random() > 0.5 ? 120 : -120),
      y: parent.y + 80,
      color: parent.color,
    }
    setNodes((prev) => [...prev, newNode])
    setSelectedId(newNode.id)
  }

  const deleteSelected = () => {
    if (selectedId === 'root') return
    soundService.play('buttonClick')
    setNodes((prev) => prev.filter((n) => n.id !== selectedId && n.parentId !== selectedId))
    setSelectedId('root')
  }

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="flex flex-col h-full bg-[#15151b] text-neutral-200 font-sans select-none overflow-hidden"
    >
      {/* Mindmap Toolbar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={addChildNode}
            className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 shadow"
          >
            <Plus size={14} /> Add Sub-topic
          </button>
          <button
            onClick={deleteSelected}
            disabled={selectedId === 'root'}
            className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/15 text-neutral-300 disabled:opacity-30 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Delete Selected
          </button>
        </div>

        <div className="text-xs text-neutral-400">
          Tip: Click node to edit title or drag to rearrange
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-radial-gradient overflow-hidden">
        {/* SVG Connectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map((node) => {
            if (!node.parentId) return null
            const parent = nodes.find((n) => n.id === node.parentId)
            if (!parent) return null
            return (
              <line
                key={`line-${node.id}`}
                x1={parent.x + 60}
                y1={parent.y + 20}
                x2={node.x + 60}
                y2={node.y + 20}
                stroke={node.color}
                strokeWidth={2}
                strokeOpacity={0.6}
              />
            )
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            onPointerDown={(e) => handlePointerDown(node.id, e)}
            className={`absolute w-36 px-3 py-2 rounded-xl shadow-lg cursor-grab active:cursor-grabbing border-2 backdrop-blur-md transition-shadow ${
              selectedId === node.id ? 'ring-4 ring-white/20' : ''
            }`}
            style={{
              left: node.x,
              top: node.y,
              backgroundColor: `${node.color}22`,
              borderColor: selectedId === node.id ? '#ffffff' : node.color,
            }}
          >
            <input
              type="text"
              value={node.text}
              onChange={(e) => {
                const text = e.target.value
                setNodes((prev) =>
                  prev.map((n) => (n.id === node.id ? { ...n, text } : n))
                )
              }}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none w-full text-center"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
