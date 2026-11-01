import type { AppId } from '@/types'

export type StoreCategory =
  | 'Featured'
  | 'All Applications'
  | 'Games'
  | 'Productivity'
  | 'Development'
  | 'Education'
  | 'Internet'
  | 'Graphics'
  | 'Photography'
  | 'Video'
  | 'Music'
  | 'Communication'
  | 'Security'
  | 'Utilities'
  | 'System Tools'
  | 'Customization'

export interface AppPackageManifest {
  id: string
  appId: AppId
  name: string
  version: string
  description: string
  developer: string
  category: StoreCategory
  iconBg: string
  iconColor: string
  iconName: string
  packageSize: string
  packageSizeBytes: number
  compatibility: string
  permissions: string[]
  integrity: string
  isSystemApp: boolean
  featured?: boolean
  screenshots: string[]
  hasUpdate?: boolean
  updateVersion?: string
}

export type InstallStatus = 'installed' | 'available' | 'installing' | 'updating' | 'error'

export interface ActiveInstallation {
  packageId: string
  progress: number
  status: 'downloading' | 'extracting' | 'verifying' | 'complete'
  timerId?: number
}
