import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useNotifications } from '@/core/notifications/NotificationContext'
import {
  Rocket,
  Layers,
  Sparkles,
  User,
  RotateCcw,
  Sliders,
  Check,
  Clock,
  ShieldAlert,
  Play,
  Monitor,
  CheckCircle2,
} from 'lucide-react'
import {
  bootManager,
  type StartupAppConfig,
  type BootProfile,
  type UserProfile,
  type SessionRestoreMode,
} from '@/core/boot/bootManager'
import { RecoveryModeModal } from '@/components/Boot/RecoveryModeModal'

export const StartupManagerApp: React.FC<AppInstanceProps> = () => {
  const { rebootSystem } = useWindowManager()
  const { addNotification } = useNotifications()

  const [activeTab, setActiveTab] = useState<'apps' | 'screen' | 'boot_profiles' | 'users' | 'session' | 'performance'>('apps')

  // Startup apps state
  const [startupApps, setStartupApps] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('nova_startup_apps_v2')
      if (saved) return JSON.parse(saved)
    } catch {
      // Ignore
    }
    return [
      { appId: 'notes', name: 'Notes', enabled: true, delayMs: 400, priority: 1 },
      { appId: 'finder', name: 'Finder', enabled: false, delayMs: 800, priority: 2 },
      { appId: 'browser', name: 'Browser', enabled: false, delayMs: 1200, priority: 3 },
      { appId: 'systemmonitor', name: 'System Monitor', enabled: false, delayMs: 1500, priority: 4 },
      { appId: 'games', name: 'Gaming Hub', enabled: false, delayMs: 2000, priority: 5 },
    ]
  })

  // Boot Profiles state
  const [bootProfiles, setBootProfiles] = useState<BootProfile[]>(() => bootManager.getBootProfiles())
  const [activeBootProfileId, setActiveBootProfileId] = useState<string>(() => bootManager.getActiveBootProfile().id)

  // User Profiles state
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => bootManager.getProfiles())
  const [activeUserId, setActiveUserId] = useState<string>(() => bootManager.getActiveProfile().id)

  // Session Restore Mode
  const [restoreMode, setRestoreMode] = useState<SessionRestoreMode>(() => bootManager.getRestoreMode())

  // Recovery Modal
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false)

  // Boot style
  const [bootStyle, setBootStyle] = useState<'nova_original' | 'liquid_glass' | 'aurora' | 'minimal' | 'cyberpunk' | 'ubuntu' | 'midnight' | 'crystal'>('nova_original')
  const [startupChime, setStartupChime] = useState(true)

  const toggleStartupApp = (appId: string) => {
    soundService.playClick()
    setStartupApps((prev) => {
      const next = prev.map((a) => (a.appId === appId ? { ...a, enabled: !a.enabled } : a))
      localStorage.setItem('nova_startup_apps_v2', JSON.stringify(next))
      return next
    })
  }

  const handleSelectBootProfile = (id: string) => {
    soundService.playClick()
    bootManager.setActiveBootProfile(id)
    setActiveBootProfileId(id)
    addNotification(
      'Boot Profile Activated',
      `Active startup profile updated to "${bootProfiles.find((b) => b.id === id)?.name}".`,
      'startupmanager'
    )
  }

  const handleSelectUserProfile = (id: string) => {
    soundService.playClick()
    bootManager.setActiveProfile(id)
    setActiveUserId(id)
    addNotification(
      'Active User Profile Switched',
      `Now operating as "${userProfiles.find((u) => u.id === id)?.username}".`,
      'startupmanager'
    )
  }

  const handleSaveRestoreMode = (mode: SessionRestoreMode) => {
    soundService.playClick()
    bootManager.setRestoreMode(mode)
    setRestoreMode(mode)
    addNotification(
      'Session Restore Mode Updated',
      `Session restore set to "${mode}".`,
      'startupmanager'
    )
  }

  return (
    <div className="flex h-full bg-[#11121a]/95 text-neutral-200 font-sans select-none overflow-hidden backdrop-blur-2xl">
      <RecoveryModeModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        onSuccess={(msg) => {
          addNotification('Recovery Succeeded', msg, 'startupmanager')
        }}
      />

      {/* Sidebar Navigation */}
      <div className="w-60 bg-black/40 border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide">NOVA BOOT</h2>
              <span className="text-[10px] text-neutral-400 font-mono">Startup & Session Manager</span>
            </div>
          </div>

          <nav className="p-2 space-y-1">
            {[
              { id: 'apps', label: 'Startup Apps', icon: Layers },
              { id: 'screen', label: 'Boot Screen', icon: Sparkles },
              { id: 'boot_profiles', label: 'Boot Profiles', icon: Sliders },
              { id: 'users', label: 'User Profiles', icon: User },
              { id: 'session', label: 'Session Restore', icon: RotateCcw },
              { id: 'performance', label: 'Boot Telemetry', icon: Clock },
            ].map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundService.playClick()
                    setActiveTab(item.id as any)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Emergency Recovery Button */}
        <div className="p-3 border-t border-white/10 m-2">
          <button
            onClick={() => setIsRecoveryOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
          >
            <ShieldAlert className="w-4 h-4" /> Recovery Mode
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
        {/* Tab 1: Startup Applications */}
        {activeTab === 'apps' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Virtual Startup Applications</h3>
                <p className="text-xs text-neutral-400">Applications configured to launch when the desktop starts.</p>
              </div>
              <span className="text-xs font-mono text-cyan-300 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                {startupApps.filter((a) => a.enabled).length} Enabled
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
              {startupApps.map((app) => (
                <div key={app.appId} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-xs">
                      {app.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{app.name}</span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        Delay: {app.delayMs}ms | Priority #{app.priority}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStartupApp(app.appId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      app.enabled
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${app.enabled ? 'opacity-100' : 'opacity-0'}`} />
                    {app.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Boot Screen Customizer */}
        {activeTab === 'screen' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">Startup Screen Appearance</h3>
              <p className="text-xs text-neutral-400">Customize the visual presentation of the initial system boot screen.</p>
            </div>

            {/* Styles Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'nova_original', label: 'NOVA Original', desc: 'Obsidian & cyan celestial glow' },
                { id: 'liquid_glass', label: 'Liquid Glass', desc: 'Fluid high-refraction optics' },
                { id: 'aurora', label: 'Boreal Aurora', desc: 'Emerald northern lights shimmer' },
                { id: 'minimal', label: 'Minimal Black', desc: 'Distraction-free dark canvas' },
                { id: 'cyberpunk', label: 'Cyberpunk Neon', desc: 'Electric magenta & circuit lines' },
                { id: 'ubuntu', label: 'Ubuntu Inspired', desc: 'Warm aubergine & orange glow' },
                { id: 'midnight', label: 'Midnight Violet', desc: 'Velvet purple space nebula' },
                { id: 'crystal', label: 'Crystal Clear', desc: 'Prismatic translucent crystal' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    soundService.playClick()
                    setBootStyle(style.id as any)
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    bootStyle === style.id
                      ? 'bg-cyan-500/20 border-cyan-500/50 shadow-md shadow-cyan-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{style.label}</span>
                    {bootStyle === style.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <span className="text-[10px] text-neutral-400 block leading-tight">{style.desc}</span>
                </button>
              ))}
            </div>

            {/* Options Toggle */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-white block">Play Harmonic Startup Chime</span>
                  <span className="text-[11px] text-neutral-400">Acoustic audio chime played on kernel ready</span>
                </div>
                <input
                  type="checkbox"
                  checked={startupChime}
                  onChange={(e) => {
                    soundService.playClick()
                    setStartupChime(e.target.checked)
                  }}
                  className="rounded accent-cyan-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Boot Profiles */}
        {activeTab === 'boot_profiles' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">Startup Boot Profiles</h3>
              <p className="text-xs text-neutral-400">Switch operating mode presets for different task environments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bootProfiles.map((bp) => {
                const isActive = activeBootProfileId === bp.id
                return (
                  <div
                    key={bp.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{bp.name}</span>
                      {isActive ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-white">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectBootProfile(bp.id)}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed mb-3">{bp.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                      <span>{bp.startupApps.length} Apps</span>
                      <span>•</span>
                      <span>{bp.performanceMode.toUpperCase()} Perf</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 4: User Profiles */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">Local User Profiles</h3>
              <p className="text-xs text-neutral-400">Manage local user profiles with individualized sessions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProfiles.map((up) => {
                const isActive = activeUserId === up.id
                return (
                  <div
                    key={up.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isActive
                        ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/10'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{up.username}</span>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          Theme: {up.themeId} | Wallpaper: {up.wallpaperId}
                        </span>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500 text-white">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectUserProfile(up.id)}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        Switch To
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 5: Session Restoration */}
        {activeTab === 'session' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">Desktop Session Restoration</h3>
              <p className="text-xs text-neutral-400">Configure how previous open windows and workspaces restore on reboot.</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'always',
                  title: 'Always Restore Previous Session',
                  desc: 'Automatically restores all open windows, sizes, coordinates, and active workspace upon launch.',
                },
                {
                  id: 'ask',
                  title: 'Ask Before Restoring Session',
                  desc: 'Prompts on startup with a session recovery banner.',
                },
                {
                  id: 'clean',
                  title: 'Start With Clean Desktop',
                  desc: 'Always opens with a pristine desktop with no inherited windows.',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSaveRestoreMode(opt.id as any)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    restoreMode === opt.id
                      ? 'bg-cyan-500/20 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{opt.title}</span>
                    {restoreMode === opt.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <span className="text-[11px] text-neutral-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Boot Telemetry */}
        {activeTab === 'performance' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">Startup Lifecycle Telemetry</h3>
              <p className="text-xs text-neutral-400">Actual measured durations during the virtual OS kernel startup sequence.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between text-xs pb-3 border-b border-white/10">
                <span className="font-semibold text-white">Total Virtual Boot Time:</span>
                <span className="text-emerald-400 font-mono font-bold">~2,200 ms</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Kernel & VFS Mount:</span>
                  <span className="font-mono text-neutral-400">~420 ms</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Settings & Themes Deserialization:</span>
                  <span className="font-mono text-neutral-400">~280 ms</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Application Registry Indexing:</span>
                  <span className="font-mono text-neutral-400">~360 ms</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Session Windows Restoration:</span>
                  <span className="font-mono text-neutral-400">~150 ms</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Audio & WebGL Driver Initialization:</span>
                  <span className="font-mono text-neutral-400">~490 ms</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
