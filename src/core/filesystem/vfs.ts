import type { FSNode, StorageStats, VFSBackup, VFSExportNode } from './types'
import { INITIAL_FILES } from './initialFiles'

const DB_NAME = 'nova_os_db'
const DB_VERSION = 1
const STORE_NAME = 'filesystem'
const FALLBACK_KEY = 'nova_os_filesystem_backup'

class VirtualFileSystem {
  private db: IDBDatabase | null = null
  private nodes: Map<string, FSNode> = new Map()
  private isReady: boolean = false
  private readyPromise: Promise<void>
  private listeners: Set<() => void> = new Set()

  constructor() {
    this.readyPromise = this.init()
  }

  public async waitReady(): Promise<void> {
    await this.readyPromise
  }

  private async init(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        this.db = await this.openIndexedDB()
        const storedNodes = await this.loadFromIndexedDB()
        if (storedNodes && storedNodes.length > 0) {
          storedNodes.forEach((node) => this.nodes.set(node.id, node))
        } else {
          // Initialize with default files
          INITIAL_FILES.forEach((node) => this.nodes.set(node.id, node))
          await this.saveAllToIndexedDB()
        }
      } else {
        this.loadFromFallback()
      }
    } catch {
      this.loadFromFallback()
    }
    this.isReady = true
    this.notify()
  }

  private openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        const db = (e.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  private loadFromIndexedDB(): Promise<FSNode[] | null> {
    if (!this.db) return Promise.resolve(null)
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(null)
      } catch {
        resolve(null)
      }
    })
  }

  private saveAllToIndexedDB(): Promise<void> {
    if (!this.db) {
      this.saveToFallback()
      return Promise.resolve()
    }
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        store.clear()
        this.nodes.forEach((node) => store.put(node))
        tx.oncomplete = () => {
          this.saveToFallback()
          resolve()
        }
        tx.onerror = () => {
          this.saveToFallback()
          resolve()
        }
      } catch {
        this.saveToFallback()
        resolve()
      }
    })
  }

  private saveNodeToDB(node: FSNode) {
    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readwrite')
        tx.objectStore(STORE_NAME).put(node)
      } catch {
        // Fallback handled below
      }
    }
    this.saveToFallback()
  }

  private removeNodeFromDB(id: string) {
    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readwrite')
        tx.objectStore(STORE_NAME).delete(id)
      } catch {
        // Fallback handled below
      }
    }
    this.saveToFallback()
  }

  private loadFromFallback() {
    try {
      const data = localStorage.getItem(FALLBACK_KEY)
      if (data) {
        const parsed: FSNode[] = JSON.parse(data)
        parsed.forEach((n) => this.nodes.set(n.id, n))
      } else {
        INITIAL_FILES.forEach((n) => this.nodes.set(n.id, n))
        this.saveToFallback()
      }
    } catch {
      INITIAL_FILES.forEach((n) => this.nodes.set(n.id, n))
    }
  }

  private saveToFallback() {
    try {
      // Prevent QuotaExceededError by omitting large payloads from localStorage fallback
      const safeList = Array.from(this.nodes.values()).map((node) => {
        if (node.blob || (node.content && node.content.length > 50000)) {
          return {
            ...node,
            blob: undefined,
            content: node.content ? node.content.slice(0, 500) + '... [stored in IndexedDB]' : undefined,
          }
        }
        return node
      })
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(safeList))
    } catch {
      // Storage quota or disabled; IndexedDB remains primary
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach((l) => l())
  }

  // Hierarchy validation helper
  public isDescendant(nodeId: string, potentialAncestorId: string): boolean {
    if (nodeId === potentialAncestorId) return true
    let current = this.nodes.get(nodeId)
    while (current && current.parentId) {
      if (current.parentId === potentialAncestorId) {
        return true
      }
      current = this.nodes.get(current.parentId)
    }
    return false
  }

  // File system API
  public getAllNodes(): FSNode[] {
    return Array.from(this.nodes.values())
  }

  public getNode(id: string): FSNode | undefined {
    return this.nodes.get(id)
  }

  public getChildren(parentId: string | null): FSNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.parentId === parentId && !n.isTrash)
  }

  public getTrashNodes(): FSNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.isTrash)
  }

  public createFile(parentId: string | null, name: string, content: string = '', mimeType: string = 'text/plain'): FSNode {
    const id = 'file-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)
    const node: FSNode = {
      id,
      name,
      type: 'file',
      parentId,
      size: new Blob([content]).size,
      mimeType,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.nodes.set(id, node)
    this.saveNodeToDB(node)
    this.notify()
    return node
  }

  public createBinaryFile(
    parentId: string | null,
    name: string,
    blob: Blob,
    mimeType?: string
  ): FSNode {
    const id = 'file-bin-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)
    const node: FSNode = {
      id,
      name,
      type: 'file',
      parentId,
      size: blob.size,
      mimeType: mimeType || blob.type || 'application/octet-stream',
      blob,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.nodes.set(id, node)
    this.saveNodeToDB(node)
    this.notify()
    return node
  }

  public createFolder(parentId: string | null, name: string): FSNode {
    const id = 'folder-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)
    const node: FSNode = {
      id,
      name,
      type: 'folder',
      parentId,
      size: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.nodes.set(id, node)
    this.saveNodeToDB(node)
    this.notify()
    return node
  }

  public renameNode(id: string, newName: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.name = newName
    node.updatedAt = Date.now()
    this.saveNodeToDB(node)
    this.notify()
    return true
  }

  public updateFileContent(id: string, content: string): boolean {
    const node = this.nodes.get(id)
    if (!node || node.type !== 'file') return false
    node.content = content
    node.size = new Blob([content]).size
    node.updatedAt = Date.now()
    this.saveNodeToDB(node)
    this.notify()
    return true
  }

  public moveToTrash(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.originalParentId = node.parentId
    node.parentId = 'folder-trash'
    node.isTrash = true
    node.updatedAt = Date.now()
    this.saveNodeToDB(node)
    this.notify()
    return true
  }

  public restoreFromTrash(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node || !node.isTrash) return false
    node.parentId = node.originalParentId || 'folder-desktop'
    node.isTrash = false
    node.originalParentId = null
    node.updatedAt = Date.now()
    this.saveNodeToDB(node)
    this.notify()
    return true
  }

  public deletePermanently(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    if (node.type === 'folder') {
      return this.deleteFolderRecursive(id)
    }
    this.nodes.delete(id)
    this.removeNodeFromDB(id)
    this.notify()
    return true
  }

  public deleteFolderRecursive(folderId: string): boolean {
    const targetFolder = this.nodes.get(folderId)
    if (!targetFolder) return false

    // Collect all descendant ids
    const toDelete: string[] = []
    const queue: string[] = [folderId]

    while (queue.length > 0) {
      const currentId = queue.shift()!
      toDelete.push(currentId)
      for (const child of this.nodes.values()) {
        if (child.parentId === currentId) {
          queue.push(child.id)
        }
      }
    }

    // Delete in reverse order
    for (const id of toDelete) {
      this.nodes.delete(id)
      this.removeNodeFromDB(id)
    }

    this.notify()
    return true
  }

  public copyFolderRecursive(folderId: string, targetParentId: string | null): FSNode | null {
    const sourceFolder = this.nodes.get(folderId)
    if (!sourceFolder || sourceFolder.type !== 'folder') return null

    // Prevent copying into itself or its descendants
    if (targetParentId && (targetParentId === folderId || this.isDescendant(targetParentId, folderId))) {
      return null
    }

    const idMap = new Map<string, string>()
    const newRootId = 'folder-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)
    idMap.set(folderId, newRootId)

    const clonedRoot: FSNode = {
      ...sourceFolder,
      id: newRootId,
      name: `${sourceFolder.name} (Copy)`,
      parentId: targetParentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isTrash: false,
    }

    this.nodes.set(newRootId, clonedRoot)
    this.saveNodeToDB(clonedRoot)

    // Gather all descendants
    const queue: string[] = [folderId]
    while (queue.length > 0) {
      const currId = queue.shift()!
      const parentNewId = idMap.get(currId)!

      for (const child of this.nodes.values()) {
        if (child.parentId === currId) {
          const newChildId =
            (child.type === 'file' ? 'file-' : 'folder-') +
            Date.now() +
            '-' +
            Math.random().toString(36).slice(2, 7)
          idMap.set(child.id, newChildId)

          const clonedChild: FSNode = {
            ...child,
            id: newChildId,
            parentId: parentNewId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isTrash: false,
          }

          this.nodes.set(newChildId, clonedChild)
          this.saveNodeToDB(clonedChild)

          if (child.type === 'folder') {
            queue.push(child.id)
          }
        }
      }
    }

    this.notify()
    return clonedRoot
  }

  public emptyTrash(): void {
    const trashNodes = this.getTrashNodes()
    trashNodes.forEach((node) => {
      this.nodes.delete(node.id)
      this.removeNodeFromDB(node.id)
    })
    this.notify()
  }

  public moveNode(id: string, targetParentId: string | null): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    // Prevent moving a node into itself or into its own descendant tree
    if (targetParentId && (targetParentId === id || this.isDescendant(targetParentId, id))) {
      return false
    }
    node.parentId = targetParentId
    node.updatedAt = Date.now()
    this.saveNodeToDB(node)
    this.notify()
    return true
  }

  public copyNode(id: string, targetParentId: string | null): FSNode | null {
    const node = this.nodes.get(id)
    if (!node) return null
    if (node.type === 'folder') {
      return this.copyFolderRecursive(id, targetParentId)
    }
    const newId = 'file-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)
    const copy: FSNode = {
      ...node,
      id: newId,
      name: `${node.name} copy`,
      parentId: targetParentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isTrash: false,
    }
    this.nodes.set(newId, copy)
    this.saveNodeToDB(copy)
    this.notify()
    return copy
  }

  public search(query: string): FSNode[] {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return Array.from(this.nodes.values()).filter(
      (n) => !n.isTrash && (n.name.toLowerCase().includes(q) || (n.content && n.content.toLowerCase().includes(q)))
    )
  }

  public async exportArchive(): Promise<string> {
    const nodes = Array.from(this.nodes.values()).filter((n) => !n.isTrash)
    const exportNodes: VFSExportNode[] = []

    for (const node of nodes) {
      if (node.blob) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(node.blob!)
        })
        const { blob: _, ...rest } = node
        exportNodes.push({ ...rest, blobBase64: base64 })
      } else {
        const { blob: _, ...rest } = node
        exportNodes.push(rest)
      }
    }

    const backup: VFSBackup = {
      version: 1,
      exportDate: new Date().toISOString(),
      nodes: exportNodes,
    }
    return JSON.stringify(backup, null, 2)
  }

  public async importArchive(jsonString: string, mode: 'merge' | 'replace' = 'merge'): Promise<boolean> {
    try {
      const backup: VFSBackup = JSON.parse(jsonString)
      if (!backup || !Array.isArray(backup.nodes)) return false

      if (mode === 'replace') {
        this.nodes.clear()
        INITIAL_FILES.forEach((f) => {
          if (f.isSystem) this.nodes.set(f.id, f)
        })
      }

      for (const en of backup.nodes) {
        let blob: Blob | undefined
        if (en.blobBase64) {
          const arr = en.blobBase64.split(',')
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream'
          const bstr = atob(arr[1])
          let n = bstr.length
          const u8arr = new Uint8Array(n)
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
          }
          blob = new Blob([u8arr], { type: mime })
        }

        const node: FSNode = {
          id: en.id,
          name: en.name,
          type: en.type,
          parentId: en.parentId,
          size: en.size,
          mimeType: en.mimeType,
          content: en.content,
          blob,
          createdAt: en.createdAt || Date.now(),
          updatedAt: en.updatedAt || Date.now(),
          isTrash: false,
        }
        this.nodes.set(node.id, node)
        this.saveNodeToDB(node)
      }

      this.notify()
      return true
    } catch {
      return false
    }
  }

  public async getStorageStats(): Promise<StorageStats> {
    let usedBytes = 0
    let fileCount = 0
    let folderCount = 0

    for (const node of this.nodes.values()) {
      if (node.type === 'file') {
        fileCount++
        usedBytes += node.size || 0
      } else {
        folderCount++
      }
    }

    let quotaBytes: number | undefined
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate()
        if (estimate.quota) {
          quotaBytes = estimate.quota
        }
      } catch {
        // Ignored
      }
    }

    return {
      usedBytes,
      quotaBytes,
      fileCount,
      folderCount,
    }
  }

  public resetToDefault(): void {
    this.nodes.clear()
    INITIAL_FILES.forEach((n) => this.nodes.set(n.id, n))
    this.saveAllToIndexedDB()
    this.notify()
  }
}

export const vfs = new VirtualFileSystem()
