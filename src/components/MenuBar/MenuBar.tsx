import React, { useState, useEffect, useRef } from 'react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useSettings } from '@/core/settings/SettingsContext'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import { soundService } from '@/core/audio/soundService'
import { ControlCenter } from './ControlCenter'
import { NotificationCenter } from './NotificationCenter'
import {
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Battery,
  Search,
  Sliders,
  Bell,
  Sparkles,
  LayoutGrid,
  Layers,
  Lock,
  User,
  Bot,
  Compass,
  Power,
  Moon,
} from 'lucide-react'

interface MenuBarProps {
  onOpenSpotlight: () => void
}

export const MenuBar: React.FC<MenuBarProps> = ({ onOpenSpotlight }) => {
  const {
    activeWindow,
    openApp,
    closeActiveWindow,
    minimizeActiveWindow,
    toggleMaximizeActiveWindow,
    activeWorkspace,
    switchWorkspace,
    toggleOverview,
    toggleLauncher,
    lockSystem,
    sleepSystem,
    rebootSystem,
    powerOffSystem,
  } = useWindowManager()
  const { settings, updateSettings } = useSettings()
  const { unreadCount, addNotification } = useNotifications()

  const [currentTimeStr, setCurrentTimeStr] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [showControlCenter, setShowControlCenter] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showWifiFlyout, setShowWifiFlyout] = useState(false)
  const [showVolumeFlyout, setShowVolumeFlyout] = useState(false)
  const [showBatteryFlyout, setShowBatteryFlyout] = useState(false)
  const [showUserFlyout, setShowUserFlyout] = useState(false)

  const menuBarRef = useRef<HTMLDivElement>(null)

  // Live Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatted = now.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }) + ' ' + now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      setCurrentTimeStr(formatted)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
        setShowControlCenter(false)
        setShowNotifications(false)
        setShowWifiFlyout(false)
        setShowVolumeFlyout(false)
        setShowBatteryFlyout(false)
      }
    }
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  const activeAppDef = activeWindow ? APPS_REGISTRY[activeWindow.appId] : null
  const activeTitle = activeAppDef ? activeAppDef.title : 'Finder'

  const toggleDropdown = (menuName: string) => {
    soundService.playClick()
    setActiveMenu((prev) => (prev === menuName ? null : menuName))
    setShowControlCenter(false)
    setShowNotifications(false)
    setShowWifiFlyout(false)
    setShowVolumeFlyout(false)
    setShowBatteryFlyout(false)
  }

  return (
    <div
      ref={menuBarRef}
      className="fixed top-0 inset-x-0 h-7 bg-neutral-900/60 dark:bg-black/40 backdrop-blur-2xl border-b border-white/10 z-50 flex items-center justify-between px-3 text-[12px] text-neutral-200 select-none shadow-sm"
    >
      {/* Left Section: NOVA Logo + Active App + Menus */}
      <div className="flex items-center gap-1">
        {/* Nova Apple-equivalent Logo Button */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('system')}
            className={`px-2 py-0.5 rounded flex items-center transition ${
              activeMenu === 'system' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white'
            }`}
            title="NOVA System Menu"
          >
            {/* Sleek Nova Geometric Celestial Star */}
            <svg
              className="w-3.5 h-3.5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </button>

          {/* System Dropdown */}
          {activeMenu === 'system' && (
            <div className="absolute top-7 left-0 w-52 bg-neutral-900/90 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl py-1 text-xs text-neutral-200 animate-in fade-in duration-100 z-50">
              <button
                onClick={() => {
                  openApp('settings')
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
              >
                About NOVA OS
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                onClick={() => {
                  openApp('settings')
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
              >
                System Settings...
              </button>
              <button
                onClick={() => {
                  openApp('appstore')
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
              >
                App Store...
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                onClick={() => {
                  toggleLauncher(true)
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition flex items-center justify-between"
              >
                <span>App Launcher</span>
                <span className="text-[10px] text-neutral-400">Ctrl+A</span>
              </button>
              <button
                onClick={() => {
                  toggleOverview(true)
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition flex items-center justify-between"
              >
                <span>Mission Control</span>
                <span className="text-[10px] text-neutral-400">F3</span>
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                onClick={() => {
                  lockSystem()
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition flex items-center justify-between"
              >
                <span>Lock Screen</span>
                <span className="text-[10px] text-neutral-400">Ctrl+Alt+L</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu(null)
                  sleepSystem()
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
              >
                Sleep
              </button>
              <button
                onClick={() => {
                  setActiveMenu(null)
                  rebootSystem()
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
              >
                Restart...
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                onClick={() => {
                  setActiveMenu(null)
                  powerOffSystem()
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-600 hover:text-white text-red-300 transition"
              >
                Shut Down...
              </button>
            </div>
          )}
        </div>

        {/* Active Application Name in Bold */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('app')}
            className={`px-2 py-0.5 rounded font-bold transition text-white ${
              activeMenu === 'app' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            {activeTitle}
          </button>

          {activeMenu === 'app' && (
            <div className="absolute top-7 left-0 w-48 bg-neutral-900/90 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl py-1 text-xs text-neutral-200 z-50">
              <button
                onClick={() => {
                  openApp('settings')
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
              >
                About {activeTitle}
              </button>
              <button
                onClick={() => {
                  openApp('settings')
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
              >
                Preferences...
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                onClick={() => {
                  closeActiveWindow()
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-red-300"
              >
                Quit {activeTitle}
              </button>
            </div>
          )}
        </div>

        {/* Context Menus: File, Edit, View, Window, Help */}
        {['File', 'Edit', 'View', 'Window', 'Help'].map((item) => (
          <div key={item} className="relative">
            <button
              onClick={() => toggleDropdown(item)}
              className={`px-2 py-0.5 rounded transition ${
                activeMenu === item ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-neutral-300 hover:text-white'
              }`}
            >
              {item}
            </button>

            {activeMenu === item && (
              <div className="absolute top-7 left-0 w-48 bg-neutral-900/90 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl py-1 text-xs text-neutral-200 z-50">
                {item === 'File' && (
                  <>
                    <button
                      onClick={() => {
                        openApp('finder')
                        setActiveMenu(null)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
                    >
                      New Finder Window
                    </button>
                    <button
                      onClick={() => {
                        closeActiveWindow()
                        setActiveMenu(null)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
                    >
                      Close Window (Ctrl+W)
                    </button>
                  </>
                )}
                {item === 'Edit' && (
                  <>
                    <div className="px-3 py-1.5 text-neutral-500">Undo (Ctrl+Z)</div>
                    <div className="px-3 py-1.5 text-neutral-500">Redo (Ctrl+Y)</div>
                    <div className="my-1 border-t border-white/10" />
                    <div className="px-3 py-1.5 text-neutral-300">Cut (Ctrl+X)</div>
                    <div className="px-3 py-1.5 text-neutral-300">Copy (Ctrl+C)</div>
                    <div className="px-3 py-1.5 text-neutral-300">Paste (Ctrl+V)</div>
                  </>
                )}
                {item === 'View' && (
                  <>
                    <button
                      onClick={() => {
                        toggleMaximizeActiveWindow()
                        setActiveMenu(null)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
                    >
                      Toggle Fullscreen
                    </button>
                  </>
                )}
                {item === 'Window' && (
                  <>
                    <button
                      onClick={() => {
                        minimizeActiveWindow()
                        setActiveMenu(null)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
                    >
                      Minimize (Ctrl+M)
                    </button>
                    <button
                      onClick={() => {
                        toggleMaximizeActiveWindow()
                        setActiveMenu(null)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
                    >
                      Zoom / Maximize
                    </button>
                  </>
                )}
                {item === 'Help' && (
                  <>
                    <button
                      onClick={() => {
                        openApp('notes')
                        setActiveMenu(null)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
                    >
                      NOVA OS Guide
                    </button>
                    <button
                      onClick={() => {
                        openApp('games')
                        setActiveMenu(null)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
                    >
                      Play Nova Odyssey
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right Section: System Controls, Clock, Battery, Notification */}
      <div className="flex items-center gap-1.5">
        {/* Virtual Desktops / Workspaces Switcher */}
        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white/5 border border-white/10 mr-1 text-[11px]">
          {[1, 2, 3, 4].map((ws) => (
            <button
              key={ws}
              onClick={() => switchWorkspace(ws)}
              title={`Switch to Desktop ${ws}`}
              className={`w-5 h-5 rounded flex items-center justify-center font-medium transition ${
                activeWorkspace === ws
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {ws}
            </button>
          ))}
        </div>

        {/* Mission Control Button */}
        <button
          onClick={() => toggleOverview()}
          className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition"
          title="Mission Control (F3)"
        >
          <Layers size={14} />
        </button>

        {/* App Launcher Button */}
        <button
          onClick={() => toggleLauncher()}
          className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition"
          title="App Launcher (Ctrl + A)"
        >
          <LayoutGrid size={14} />
        </button>

        {/* Wi-Fi Indicator Button */}
        <div className="relative">
          <button
            onClick={() => {
              soundService.playClick()
              setShowWifiFlyout((w) => !w)
              setShowControlCenter(false)
              setShowNotifications(false)
            }}
            className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title="Wi-Fi Status"
          >
            {settings.wifiEnabled ? <Wifi size={14} /> : <WifiOff size={14} className="text-neutral-500" />}
          </button>

          {showWifiFlyout && (
            <div className="absolute top-7 right-0 w-56 bg-neutral-900/90 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl p-3 text-xs text-neutral-200 z-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Wi-Fi</span>
                <input
                  type="checkbox"
                  checked={settings.wifiEnabled}
                  onChange={(e) => updateSettings({ wifiEnabled: e.target.checked })}
                  className="accent-blue-600"
                />
              </div>
              {settings.wifiEnabled ? (
                <div className="text-[11px] text-neutral-400">
                  <div className="text-blue-400 font-medium">✓ Connected to Nova-Guest 5G</div>
                  <div>IP Address: 192.168.1.142</div>
                  <div>Speed: 866 Mbps</div>
                </div>
              ) : (
                <div className="text-[11px] text-neutral-500">Wi-Fi is currently disabled</div>
              )}
            </div>
          )}
        </div>

        {/* Volume Flyout */}
        <div className="relative">
          <button
            onClick={() => {
              soundService.playClick()
              setShowVolumeFlyout((v) => !v)
              setShowControlCenter(false)
              setShowNotifications(false)
            }}
            className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title="Volume Control"
          >
            {settings.volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {showVolumeFlyout && (
            <div className="absolute top-7 right-0 w-48 bg-neutral-900/90 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl p-3 text-xs text-neutral-200 z-50 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-white">Sound Output</span>
                <span className="font-mono text-neutral-400">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Battery Status */}
        <div className="relative">
          <button
            onClick={() => {
              soundService.playClick()
              setShowBatteryFlyout((b) => !b)
            }}
            className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition text-[11px] font-mono"
            title="Battery: 100%"
          >
            <span>100%</span>
            <Battery size={15} />
          </button>

          {showBatteryFlyout && (
            <div className="absolute top-7 right-0 w-48 bg-neutral-900/90 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl p-3 text-xs text-neutral-200 z-50 space-y-1">
              <div className="font-semibold text-white">Battery Condition</div>
              <div className="text-[11px] text-emerald-400 font-medium">Normal (100% Health)</div>
              <div className="text-[10px] text-neutral-400">Power Source: Power Adapter</div>
            </div>
          )}
        </div>

        {/* Spotlight Search Icon */}
        <button
          onClick={() => {
            soundService.playClick()
            onOpenSpotlight()
          }}
          className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition"
          title="Spotlight Search (Ctrl + Space)"
        >
          <Search size={14} />
        </button>

        {/* Control Center Toggle */}
        <button
          onClick={() => {
            soundService.playClick()
            setShowControlCenter((c) => !c)
            setShowNotifications(false)
            setShowWifiFlyout(false)
            setShowVolumeFlyout(false)
          }}
          className={`p-1 rounded transition ${
            showControlCenter ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-neutral-300 hover:text-white'
          }`}
          title="Control Center"
        >
          <Sliders size={14} />
        </button>

        {/* Notification Center Bell */}
        <button
          onClick={() => {
            soundService.playClick()
            setShowNotifications((n) => !n)
            setShowControlCenter(false)
            setShowWifiFlyout(false)
            setShowUserFlyout(false)
          }}
          className={`p-1 rounded transition relative ${
            showNotifications ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-neutral-300 hover:text-white'
          }`}
          title="Notification Center"
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_#3b82f6]" />
          )}
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              soundService.playClick()
              setShowUserFlyout((u) => !u)
              setShowControlCenter(false)
              setShowNotifications(false)
              setShowWifiFlyout(false)
              setShowVolumeFlyout(false)
            }}
            className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-white/10 text-neutral-200 hover:text-white transition text-xs"
            title={`User: ${settings.username || 'Commander Nova'}`}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-[1px] overflow-hidden flex items-center justify-center">
              {settings.userAvatar && (settings.userAvatar.startsWith('data:image/') || settings.userAvatar.startsWith('http')) ? (
                <img src={settings.userAvatar} alt="User" className="w-full h-full rounded-full object-cover" />
              ) : settings.userAvatar === 'avatar-bot' ? (
                <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center">
                  <Bot size={11} className="text-cyan-300" />
                </div>
              ) : settings.userAvatar === 'avatar-compass' ? (
                <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center">
                  <Compass size={11} className="text-purple-300" />
                </div>
              ) : settings.userAvatar === 'avatar-sparkles' ? (
                <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center">
                  <Sparkles size={11} className="text-amber-300" />
                </div>
              ) : (
                <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center">
                  <User size={11} className="text-cyan-300" />
                </div>
              )}
            </div>
            <span className="hidden md:inline text-[11px] font-medium max-w-[90px] truncate">
              {settings.username || 'Nova'}
            </span>
          </button>

          {showUserFlyout && (
            <div className="absolute top-7 right-0 w-56 bg-neutral-900/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 text-xs text-neutral-200 z-50 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1.5px] shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
                  {settings.userAvatar && (settings.userAvatar.startsWith('data:image/') || settings.userAvatar.startsWith('http')) ? (
                    <img src={settings.userAvatar} alt="User" className="w-full h-full rounded-full object-cover" />
                  ) : settings.userAvatar === 'avatar-bot' ? (
                    <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center">
                      <Bot size={18} className="text-cyan-300" />
                    </div>
                  ) : settings.userAvatar === 'avatar-compass' ? (
                    <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center">
                      <Compass size={18} className="text-purple-300" />
                    </div>
                  ) : settings.userAvatar === 'avatar-sparkles' ? (
                    <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center">
                      <Sparkles size={18} className="text-amber-300" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center">
                      <User size={18} className="text-cyan-300" />
                    </div>
                  )}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-white truncate">
                    {settings.username || 'Commander Nova'}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {settings.userGreeting || 'Welcome back'}
                  </div>
                </div>
              </div>

              <div className="space-y-0.5 pt-1">
                <button
                  onClick={() => {
                    openApp('settings')
                    setShowUserFlyout(false)
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition text-[11px]"
                >
                  Profile & Security Settings...
                </button>
                <div className="my-1 border-t border-white/10" />
                <button
                  onClick={() => {
                    setShowUserFlyout(false)
                    lockSystem()
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition text-[11px]"
                >
                  <span className="flex items-center gap-1.5">
                    <Lock size={12} /> Lock Screen
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Ctrl+Alt+L</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserFlyout(false)
                    sleepSystem()
                  }}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition text-[11px]"
                >
                  <Moon size={12} /> Sleep
                </button>
                <button
                  onClick={() => {
                    setShowUserFlyout(false)
                    rebootSystem()
                  }}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition text-[11px]"
                >
                  <Sparkles size={12} /> Restart...
                </button>
                <div className="my-1 border-t border-white/10" />
                <button
                  onClick={() => {
                    setShowUserFlyout(false)
                    powerOffSystem()
                  }}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-red-600 hover:text-white text-red-300 transition text-[11px]"
                >
                  <Power size={12} /> Shut Down...
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Clock & Date */}
        <button
          onClick={() => {
            soundService.playClick()
            setShowNotifications((n) => !n)
          }}
          className="px-2 py-0.5 rounded hover:bg-white/10 text-neutral-200 hover:text-white font-medium text-[11px] transition"
        >
          {currentTimeStr}
        </button>
      </div>

      {/* Flyout Panels */}
      <ControlCenter isOpen={showControlCenter} onClose={() => setShowControlCenter(false)} />
      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  )
}
