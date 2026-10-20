import type { FSNode } from './types'
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
        // Fallback
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
        // Fallback
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
      const list = Array.from(this.nodes.values())
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(list))
    } catch {
      // Storage quota or disabled
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach((l) => l())
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
    this.nodes.delete(id)
    this.removeNodeFromDB(id)
    this.notify()
    return true
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
    node.parentId = targetParentId
    node.updatedAt = Date.now()
    this.saveNodeToDB(node)
    this.notify()
    return true
  }

  public copyNode(id: string, targetParentId: string | null): FSNode | null {
    const node = this.nodes.get(id)
    if (!node) return null
    const newId = (node.type === 'file' ? 'file-' : 'folder-') + Date.now() + '-' + Math.random().toString(36).slice(2, 7)
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

  public resetToDefault(): void {
    this.nodes.clear()
    INITIAL_FILES.forEach((n) => this.nodes.set(n.id, n))
    this.saveAllToIndexedDB()
    this.notify()
  }
}

export const vfs = new VirtualFileSystem()
