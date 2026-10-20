import React, { createContext, useContext, useEffect, useState } from 'react'
import { vfs } from './vfs'
import type { FSNode } from './types'

interface FileSystemContextType {
  nodes: FSNode[]
  getNode: (id: string) => FSNode | undefined
  getChildren: (parentId: string | null) => FSNode[]
  getTrashNodes: () => FSNode[]
  createFile: (parentId: string | null, name: string, content?: string, mimeType?: string) => FSNode
  createFolder: (parentId: string | null, name: string) => FSNode
  renameNode: (id: string, newName: string) => boolean
  updateFileContent: (id: string, content: string) => boolean
  moveToTrash: (id: string) => boolean
  restoreFromTrash: (id: string) => boolean
  emptyTrash: () => void
  deletePermanently: (id: string) => boolean
  moveNode: (id: string, targetParentId: string | null) => boolean
  copyNode: (id: string, targetParentId: string | null) => FSNode | null
  searchFiles: (query: string) => FSNode[]
  resetToDefault: () => void
  importFiles: (parentId: string | null, fileList: FileList) => Promise<FSNode[]>
  exportFile: (id: string) => void
}

const FileSystemContext = createContext<FileSystemContextType | null>(null)

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, setVersion] = useState(0)

  useEffect(() => {
    const unsubscribe = vfs.subscribe(() => {
      setVersion((v) => v + 1)
    })
    return unsubscribe
  }, [])

  const importFiles = async (parentId: string | null, fileList: FileList): Promise<FSNode[]> => {
    const createdNodes: FSNode[] = []
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.json')) {
          reader.readAsText(file)
        } else {
          reader.readAsDataURL(file)
        }
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
      })
      const node = vfs.createFile(parentId, file.name, content, file.type || 'application/octet-stream')
      createdNodes.push(node)
    }
    return createdNodes
  }

  const exportFile = (id: string) => {
    const node = vfs.getNode(id)
    if (!node || node.type !== 'file') return
    const blob = node.content?.startsWith('data:')
      ? (() => {
          const arr = node.content.split(',')
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream'
          const bstr = atob(arr[1])
          let n = bstr.length
          const u8arr = new Uint8Array(n)
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
          }
          return new Blob([u8arr], { type: mime })
        })()
      : new Blob([node.content || ''], { type: node.mimeType || 'text/plain' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = node.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const value: FileSystemContextType = {
    nodes: vfs.getAllNodes(),
    getNode: (id) => vfs.getNode(id),
    getChildren: (parentId) => vfs.getChildren(parentId),
    getTrashNodes: () => vfs.getTrashNodes(),
    createFile: (parentId, name, content, mimeType) => vfs.createFile(parentId, name, content, mimeType),
    createFolder: (parentId, name) => vfs.createFolder(parentId, name),
    renameNode: (id, newName) => vfs.renameNode(id, newName),
    updateFileContent: (id, content) => vfs.updateFileContent(id, content),
    moveToTrash: (id) => vfs.moveToTrash(id),
    restoreFromTrash: (id) => vfs.restoreFromTrash(id),
    emptyTrash: () => vfs.emptyTrash(),
    deletePermanently: (id) => vfs.deletePermanently(id),
    moveNode: (id, targetParentId) => vfs.moveNode(id, targetParentId),
    copyNode: (id, targetParentId) => vfs.copyNode(id, targetParentId),
    searchFiles: (query) => vfs.search(query),
    resetToDefault: () => vfs.resetToDefault(),
    importFiles,
    exportFile,
  }

  return <FileSystemContext.Provider value={value}>{children}</FileSystemContext.Provider>
}

export const useFileSystem = (): FileSystemContextType => {
  const context = useContext(FileSystemContext)
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider')
  }
  return context
}
