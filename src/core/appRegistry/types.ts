import type { ComponentType } from 'react'
import type { AppId } from '@/types'

export type AppCategory =
  | 'System'
  | 'Productivity'
  | 'Utilities'
  | 'Media'
  | 'Games'
  | 'Internet'
  | 'Development'
  | 'Education'
  | 'Graphics'
  | 'Communication'

export interface AppMetadata {
  id: AppId
  title: string
  description: string
  category: AppCategory
  version: string
  defaultWidth: number
  defaultHeight: number
  minWidth: number
  minHeight: number
  isDockApp?: boolean
  accentColor: string
  gradient: string
  iconName?: string
  tags?: string[]
  rating?: number
  isInstalled?: boolean
  isFavorite?: boolean
  isPinned?: boolean
  author?: string
  size?: string
}

export interface AppInstanceProps {
  windowId: string
  isFocused: boolean
  initialArgs?: Record<string, unknown>
}

export interface RegisteredApp extends AppMetadata {
  component: ComponentType<AppInstanceProps>
}
