import type { ComponentType } from 'react'
import type { AppId } from '@/types'

export interface AppMetadata {
  id: AppId
  title: string
  description: string
  category: 'System' | 'Productivity' | 'Utilities' | 'Media' | 'Games'
  version: string
  defaultWidth: number
  defaultHeight: number
  minWidth: number
  minHeight: number
  isDockApp: boolean
  accentColor: string
  gradient: string
}

export interface AppInstanceProps {
  windowId: string
  isFocused: boolean
  initialArgs?: Record<string, unknown>
}

export interface RegisteredApp extends AppMetadata {
  component: ComponentType<AppInstanceProps>
}
