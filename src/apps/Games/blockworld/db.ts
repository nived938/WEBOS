import type { WorldSaveData } from './types'

const DB_NAME = 'NovaBlockworldDB'
const DB_VERSION = 1
const STORE_NAME = 'worlds'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported in this environment'))
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllWorlds(): Promise<WorldSaveData[]> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn('Fallback to localStorage for Blockworld worlds:', err)
    const raw = localStorage.getItem('nova_blockworld_worlds')
    return raw ? JSON.parse(raw) : []
  }
}

export async function getWorldById(id: string): Promise<WorldSaveData | null> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(id)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    const all = await getAllWorlds()
    return all.find((w) => w.id === id) || null
  }
}

export async function saveWorld(data: WorldSaveData): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(data)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {
    const all = await getAllWorlds()
    const index = all.findIndex((w) => w.id === data.id)
    if (index >= 0) all[index] = data
    else all.push(data)
    localStorage.setItem('nova_blockworld_worlds', JSON.stringify(all))
  }
}

export async function deleteWorld(id: string): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {
    const all = await getAllWorlds()
    const filtered = all.filter((w) => w.id !== id)
    localStorage.setItem('nova_blockworld_worlds', JSON.stringify(filtered))
  }
}
