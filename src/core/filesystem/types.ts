export type FSNodeType = 'file' | 'folder'

export interface FSNode {
  id: string
  name: string
  type: FSNodeType
  parentId: string | null // null for root /
  size: number // bytes
  mimeType?: string
  content?: string // Text content or data URL / base64
  blob?: Blob // Optional binary blob storage
  createdAt: number
  updatedAt: number
  isTrash?: boolean
  originalParentId?: string | null
  isSystem?: boolean
}

export type SpecialFolder = 'desktop' | 'documents' | 'downloads' | 'pictures' | 'music' | 'trash'

export interface StorageStats {
  usedBytes: number
  quotaBytes?: number
  fileCount: number
  folderCount: number
}

export interface VFSExportNode extends Omit<FSNode, 'blob'> {
  blobBase64?: string
}

export interface VFSBackup {
  version: number
  exportDate: string
  nodes: VFSExportNode[]
}
