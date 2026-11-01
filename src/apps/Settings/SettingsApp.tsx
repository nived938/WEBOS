import React, { useState, useMemo } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { useSettings } from '@/core/settings/SettingsContext'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'

// Subsystem Section Components
import { PersonalizationSection } from './sections/PersonalizationSection'
import { AppearanceSection } from './sections/AppearanceSection'
import { ThemesSection } from './sections/ThemesSection'
import { WallpaperSection } from './sections/WallpaperSection'
import { LockScreenSection } from './sections/LockScreenSection'
import { MouseSection } from './sections/MouseSection'
import { DesktopSection } from './sections/DesktopSection'
import { DockSection } from './sections/DockSection'
import { PanelsSection } from './sections/PanelsSection'
import { WindowSection } from './sections/WindowSection'
import { LiquidGlassSection } from './sections/LiquidGlassSection'
import { AnimationsSection } from './sections/AnimationsSection'
import { SoundSection } from './sections/SoundSection'
import { NotificationsSection } from './sections/NotificationsSection'
import { PrivacySection } from './sections/PrivacySection'
import { AccessibilitySection } from './sections/AccessibilitySection'
import { ShortcutsSection } from './sections/ShortcutsSection'
import { GamingSection } from './sections/GamingSection'
import { StorageSection } from './sections/StorageSection'
import { SysInfoSection } from './sections/SysInfoSection'
import { AboutSection } from './sections/AboutSection'

import {
  User,
  Palette,
  Layers,
  Image as ImageIcon,
  Lock,
  MousePointer,
  LayoutGrid,
  Sliders,
  PanelTop,
  AppWindow,
  Droplets,
  Activity,
  Volume2,
  Bell,
  Shield,
  Eye,
  Keyboard,
  Gamepad2,
  HardDrive,
  Cpu,
  Info,
  Search,
  X,
} from 'lucide-react'

export type SettingsSectionId =
  | 'personalization'
  | 'appearance'
  | 'themes'
  | 'wallpaper'
  | 'lockscreen'
  | 'mouse'
  | 'desktop'
  | 'dock'
  | 'panels'
  | 'windowmanagement'
  | 'liquidglass'
  | 'animations'
  | 'sound'
  | 'notifications'
  | 'privacy'
  | 'accessibility'
  | 'shortcuts'
  | 'gaming'
  | 'storage'
  | 'sysinfo'
  | 'about'

interface SectionMeta {
  id: SettingsSectionId
  name: string
  category: 'Personalization' | 'Workspace' | 'System & Hardware'
  icon: React.FC<{ size?: number; className?: string }>
  keywords: string[]
}

const SECTIONS: SectionMeta[] = [
  // 1. Personalization
  {
    id: 'personalization',
    name: 'Personalization',
    category: 'Personalization',
    icon: User,
    keywords: ['profile', 'avatar', 'user', 'greeting', 'identity', 'bio', 'admin'],
  },
  // 2. Appearance
  {
    id: 'appearance',
    name: 'Appearance',
    category: 'Personalization',
    icon: Palette,
    keywords: ['dark', 'light', 'theme mode', 'accent color', 'night light', 'warmth'],
  },
  // 3. Themes
  {
    id: 'themes',
    name: 'Themes & Studio',
    category: 'Personalization',
    icon: Layers,
    keywords: ['themes', 'palette', 'json', 'export', 'import', 'colors', 'custom themes'],
  },
  // 4. Wallpaper
  {
    id: 'wallpaper',
    name: 'Wallpaper Studio',
    category: 'Personalization',
    icon: ImageIcon,
    keywords: ['wallpaper', 'background', 'slideshow', 'upload image', 'position', 'fill', 'fit'],
  },
  // 5. Lock Screen
  {
    id: 'lockscreen',
    name: 'Lock Screen',
    category: 'Personalization',
    icon: Lock,
    keywords: ['lock', 'pin', 'pbkdf2', 'password', 'recovery key', 'clock', 'timeout', 'security'],
  },
  // 6. Mouse and Cursor
  {
    id: 'mouse',
    name: 'Mouse & Cursor',
    category: 'Personalization',
    icon: MousePointer,
    keywords: ['cursor', 'pointer', 'size', 'trail', 'glow', 'ripple', 'windows', 'macos', 'svg'],
  },
  // 7. Desktop
  {
    id: 'desktop',
    name: 'Desktop & Icons',
    category: 'Workspace',
    icon: LayoutGrid,
    keywords: ['icons', 'spacing', 'widgets', 'grid snap', 'selection color', 'clock', 'sticky notes'],
  },
  // 8. Dock
  {
    id: 'dock',
    name: 'Dock & Bar',
    category: 'Workspace',
    icon: Sliders,
    keywords: ['dock', 'magnification', 'autohide', 'position', 'floating', 'glass', 'bottom', 'left'],
  },
  // 9. Taskbar and Panels
  {
    id: 'panels',
    name: 'Taskbar & Panels',
    category: 'Workspace',
    icon: PanelTop,
    keywords: ['menu bar', 'panel', 'tray', 'battery', 'wifi', 'clock format', 'seconds', 'blur'],
  },
  // 10. Window Management
  {
    id: 'windowmanagement',
    name: 'Window Management',
    category: 'Workspace',
    icon: AppWindow,
    keywords: ['snap', 'titlebar', 'minimize', 'genie', 'scale', 'shadow', 'double click', 'mac', 'windows'],
  },
  // 11. Liquid Glass
  {
    id: 'liquidglass',
    name: 'Liquid Glass',
    category: 'Workspace',
    icon: Droplets,
    keywords: ['liquid glass', 'blur', 'saturation', 'opacity', 'reflection', 'tint', 'optics', 'frosted'],
  },
  // 12. Animations
  {
    id: 'animations',
    name: 'System Animations',
    category: 'Workspace',
    icon: Activity,
    keywords: ['speed', 'motion', 'reduced motion', 'bounce', 'transitions', 'fps', 'particles'],
  },
  // 13. Sound
  {
    id: 'sound',
    name: 'Sound Preferences',
    category: 'System & Hardware',
    icon: Volume2,
    keywords: ['sound', 'audio', 'volume', 'chime', 'startup', 'trash', 'click', 'effects'],
  },
  // 14. Notifications
  {
    id: 'notifications',
    name: 'Notifications',
    category: 'System & Hardware',
    icon: Bell,
    keywords: ['notifications', 'do not disturb', 'dnd', 'banner', 'duration', 'alerts'],
  },
  // 15. Privacy
  {
    id: 'privacy',
    name: 'Privacy & Security',
    category: 'System & Hardware',
    icon: Shield,
    keywords: ['privacy', 'sandbox', 'telemetry', 'local', 'cache', 'encryption', 'pbkdf2'],
  },
  // 16. Accessibility
  {
    id: 'accessibility',
    name: 'Accessibility',
    category: 'System & Hardware',
    icon: Eye,
    keywords: ['accessibility', 'contrast', 'text scale', 'font size', 'grayscale', 'focus'],
  },
  // 17. Keyboard Shortcuts
  {
    id: 'shortcuts',
    name: 'Keyboard Shortcuts',
    category: 'System & Hardware',
    icon: Keyboard,
    keywords: ['shortcuts', 'hotkeys', 'keybindings', 'spotlight', 'lock', 'workspace', 'snap'],
  },
  // 18. Gaming
  {
    id: 'gaming',
    name: 'Gaming & Performance',
    category: 'System & Hardware',
    icon: Gamepad2,
    keywords: ['gaming', 'pointer lock', 'gamepad', 'fps', 'performance mode', '3d'],
  },
  // 19. Storage
  {
    id: 'storage',
    name: 'Virtual Storage',
    category: 'System & Hardware',
    icon: HardDrive,
    keywords: ['storage', 'ssd', 'indexeddb', 'quota', 'files', 'filesystem', 'disk'],
  },
  // 20. System Information
  {
    id: 'sysinfo',
    name: 'System Information',
    category: 'System & Hardware',
    icon: Cpu,
    keywords: ['system', 'cpu', 'ram', 'memory', 'gpu', 'webgl', 'resolution', 'uptime'],
  },
  // 21. About NOVA OS
  {
    id: 'about',
    name: 'About NOVA OS',
    category: 'System & Hardware',
    icon: Info,
    keywords: ['about', 'version', 'license', 'tahoe', 'reset', 'factory', 'mit'],
  },
]

export const SettingsApp: React.FC<AppInstanceProps> = () => {
  const { resetSettings } = useSettings()
  const { resetToDefault } = useFileSystem()
  const { addNotification } = useNotifications()

  const [activeSection, setActiveSection] = useState<SettingsSectionId>('personalization')
  const [searchQuery, setSearchQuery] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return SECTIONS

    return SECTIONS.filter(
      (sec) =>
        sec.name.toLowerCase().includes(query) ||
        sec.category.toLowerCase().includes(query) ||
        sec.keywords.some((k) => k.toLowerCase().includes(query))
    )
  }, [searchQuery])

  const handleSelectSection = (id: SettingsSectionId) => {
    soundService.playClick()
    setActiveSection(id)
  }

  const handleFullReset = () => {
    soundService.playTrashEmpty()
    resetSettings()
    resetToDefault()
    setShowResetModal(false)
    addNotification('System Reset', 'NOVA OS settings, themes, and virtual files restored to factory defaults', 'settings')
  }

  return (
    <div className="flex h-full bg-neutral-900/95 text-neutral-200 select-none backdrop-blur-2xl relative overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-56 border-r border-white/10 bg-black/30 flex flex-col p-2.5 text-xs select-none shrink-0">
        <div className="px-2 pt-1 pb-2">
          <div className="font-bold text-white text-sm tracking-tight flex items-center justify-between">
            <span>Settings</span>
            <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-1.5 py-0.5 rounded-full border border-cyan-500/20">
              21 Areas
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2 px-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings..."
            className="w-full pl-7 pr-6 py-1.5 rounded-xl bg-white/10 border border-white/10 text-white text-[11px] placeholder-neutral-400 focus:outline-none focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Section List */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
          {filteredSections.length === 0 ? (
            <div className="p-4 text-center text-neutral-400 text-xs">
              No matching settings found for &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredSections.map((sec) => {
              const Icon = sec.icon
              const isActive = activeSection === sec.id
              return (
                <button
                  key={sec.id}
                  onClick={() => handleSelectSection(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition text-left ${
                    isActive
                      ? 'bg-blue-600/25 text-white font-semibold border border-blue-500/30 shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-blue-400' : 'text-neutral-400'} />
                  <span className="truncate flex-1 text-xs">{sec.name}</span>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main Settings Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs custom-scrollbar">
        {activeSection === 'personalization' && (
          <PersonalizationSection onNavigateSection={(secId) => handleSelectSection(secId as SettingsSectionId)} />
        )}
        {activeSection === 'appearance' && <AppearanceSection />}
        {activeSection === 'themes' && <ThemesSection />}
        {activeSection === 'wallpaper' && <WallpaperSection />}
        {activeSection === 'lockscreen' && <LockScreenSection />}
        {activeSection === 'mouse' && <MouseSection />}
        {activeSection === 'desktop' && <DesktopSection />}
        {activeSection === 'dock' && <DockSection />}
        {activeSection === 'panels' && <PanelsSection />}
        {activeSection === 'windowmanagement' && <WindowSection />}
        {activeSection === 'liquidglass' && <LiquidGlassSection />}
        {activeSection === 'animations' && <AnimationsSection />}
        {activeSection === 'sound' && <SoundSection />}
        {activeSection === 'notifications' && <NotificationsSection />}
        {activeSection === 'privacy' && <PrivacySection />}
        {activeSection === 'accessibility' && <AccessibilitySection />}
        {activeSection === 'shortcuts' && <ShortcutsSection />}
        {activeSection === 'gaming' && <GamingSection />}
        {activeSection === 'storage' && <StorageSection />}
        {activeSection === 'sysinfo' && <SysInfoSection />}
        {activeSection === 'about' && (
          <AboutSection onShowResetModal={() => setShowResetModal(true)} />
        )}
      </div>

      {/* Factory Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/20 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-sm">Reset All OS Data?</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              This will restore all settings, custom themes, wallpapers, notes, and virtual files to their initial factory defaults. This action cannot be reversed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-neutral-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleFullReset}
                className="px-4 py-1.5 rounded-xl text-xs bg-red-600 hover:bg-red-500 text-white font-medium shadow-md shadow-red-600/20"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
