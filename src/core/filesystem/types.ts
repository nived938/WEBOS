export type FSNodeType = 'file' | 'folder'

export interface FSNode {
  id: string
  name: string
  type: FSNodeType
  parentId: string | null // null for root /
  size: number // bytes
  mimeType?: string
  content?: string // Text content or data URL / base64
  createdAt: number
  updatedAt: number
  isTrash?: boolean
  originalParentId?: string | null
}

export type SpecialFolder = 'desktop' | 'documents' | 'downloads' | 'pictures' | 'music' | 'trash'
