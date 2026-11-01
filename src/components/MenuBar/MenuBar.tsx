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
  Bluetooth,
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
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Check,
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
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace,
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
  const [showBluetoothFlyout, setShowBluetoothFlyout] = useState(false)
  const [showVolumeFlyout, setShowVolumeFlyout] = useState(false)
  const [showBatteryFlyout, setShowBatteryFlyout] = useState(false)
  const [showUserFlyout, setShowUserFlyout] = useState(false)
  const [showCalendarFlyout, setShowCalendarFlyout] = useState(false)
  const [showWorkspaceFlyout, setShowWorkspaceFlyout] = useState(false)

  // Calendar month state
  const [calendarDate, setCalendarDate] = useState(new Date())

  const menuBarRef = useRef<HTMLDivElement>(null)

  // Live Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatted =
        now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }) +
        ' ' +
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
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
        setShowBluetoothFlyout(false)
        setShowVolumeFlyout(false)
        setShowBatteryFlyout(false)
        setShowCalendarFlyout(false)
        setShowWorkspaceFlyout(false)
        setShowUserFlyout(false)
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
    setShowBluetoothFlyout(false)
    setShowVolumeFlyout(false)
    setShowBatteryFlyout(false)
    setShowCalendarFlyout(false)
    setShowWorkspaceFlyout(false)
  }

  const currentWorkspaceObj =
    workspaces.find((w) => w.id === activeWorkspace) || { id: activeWorkspace, name: `Workspace ${activeWorkspace}` }

  // Calendar days generation
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  return (
    <div
      ref={menuBarRef}
      className="fixed top-0 inset-x-0 h-8 bg-neutral-900/60 dark:bg-black/40 backdrop-blur-2xl border-b border-white/10 z-50 flex items-center justify-between px-3 text-[12px] text-neutral-200 select-none shadow-sm"
    >
      {/* Left Section: NOVA Logo + Activities Button + Active App + Dropdown Menus */}
      <div className="flex items-center gap-1.5">
        {/* NOVA Celestial Logo */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('system')}
            className={`px-2 py-1 rounded-lg flex items-center transition ${
              activeMenu === 'system' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white'
            }`}
            title="NOVA System Menu"
          >
            <svg
              className="w-4 h-4 fill-current text-blue-400"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </button>

          {/* System Dropdown */}
          {activeMenu === 'system' && (
            <div className="absolute top-8 left-0 w-52 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl py-1 text-xs text-neutral-200 animate-in fade-in duration-100 z-50">
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
                Software Center...
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                onClick={() => {
                  toggleOverview(true)
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition flex items-center justify-between"
              >
                <span>Activities Overview</span>
                <span className="text-[10px] text-neutral-400 font-mono">Super / F3</span>
              </button>
              <button
                onClick={() => {
                  toggleLauncher(true)
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition flex items-center justify-between"
              >
                <span>Application Grid</span>
                <span className="text-[10px] text-neutral-400 font-mono">Ctrl+A</span>
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
                <span className="text-[10px] text-neutral-400 font-mono">Ctrl+Alt+L</span>
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

        {/* Ubuntu GNOME-style Activities Button */}
        <button
          onClick={() => {
            soundService.playClick()
            toggleOverview(true)
          }}
          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95"
          title="Activities Overview (Super Key / F3)"
        >
          <LayoutGrid size={13} className="text-cyan-400" />
          <span>Activities</span>
        </button>

        {/* Active Application Name in Bold with Dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => toggleDropdown('app')}
            className={`px-2 py-0.5 rounded font-bold transition text-white ${
              activeMenu === 'app' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            {activeTitle}
          </button>

          {activeMenu === 'app' && (
            <div className="absolute top-8 left-0 w-48 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl py-1 text-xs text-neutral-200 z-50">
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

        {/* App Menus: File, Edit, View, Window, Help */}
        {['File', 'Edit', 'View', 'Window', 'Help'].map((item) => (
          <div key={item} className="relative hidden md:block">
            <button
              onClick={() => toggleDropdown(item)}
              className={`px-2 py-0.5 rounded transition ${
                activeMenu === item
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10 text-neutral-300 hover:text-white'
              }`}
            >
              {item}
            </button>

            {activeMenu === item && (
              <div className="absolute top-8 left-0 w-48 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl py-1 text-xs text-neutral-200 z-50">
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
                  <button
                    onClick={() => {
                      toggleMaximizeActiveWindow()
                      setActiveMenu(null)
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
                  >
                    Toggle Fullscreen
                  </button>
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
                  <button
                    onClick={() => {
                      openApp('notes')
                      setActiveMenu(null)
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
                  >
                    NOVA OS User Guide
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Center Section: Workspace Indicator Pill with Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            soundService.playClick()
            setShowWorkspaceFlyout(!showWorkspaceFlyout)
            setShowCalendarFlyout(false)
          }}
          className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 hover:bg-white/15 text-neutral-200 text-xs font-medium border border-white/10 transition shadow-sm"
          title="Virtual Workspaces"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>{currentWorkspaceObj.name}</span>
        </button>

        {showWorkspaceFlyout && (
          <div className="absolute top-9 left-1/2 -translate-x-1/2 w-64 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 text-xs text-neutral-200 z-50 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-semibold text-white">Workspaces</span>
              <button
                onClick={() => {
                  createWorkspace(`Workspace ${workspaces.length + 1}`)
                }}
                className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 text-[10px]"
              >
                <Plus size={11} /> Add
              </button>
            </div>

            <div className="space-y-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id)
                    setShowWorkspaceFlyout(false)
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition ${
                    activeWorkspace === ws.id
                      ? 'bg-blue-600 text-white font-medium'
                      : 'hover:bg-white/10 text-neutral-300'
                  }`}
                >
                  <span>{ws.name}</span>
                  {activeWorkspace === ws.id && <Check size={13} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Wi-Fi, Bluetooth, Volume, Battery, Spotlight, Controls, Clock & Calendar */}
      <div className="flex items-center gap-1.5">
        {/* Wi-Fi Indicator Flyout */}
        <div className="relative">
          <button
            onClick={() => {
              soundService.playClick()
              setShowWifiFlyout((w) => !w)
              setShowBluetoothFlyout(false)
              setShowVolumeFlyout(false)
              setShowBatteryFlyout(false)
              setShowCalendarFlyout(false)
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title="Wi-Fi Networks"
          >
            {settings.wifiEnabled ? (
              <Wifi size={14} className="text-cyan-400" />
            ) : (
              <WifiOff size={14} className="text-neutral-500" />
            )}
          </button>

          {showWifiFlyout && (
            <div className="absolute top-8 right-0 w-64 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-4 text-xs text-neutral-200 z-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Wi-Fi Connection</span>
                <input
                  type="checkbox"
                  checked={settings.wifiEnabled}
                  onChange={(e) => updateSettings({ wifiEnabled: e.target.checked })}
                  className="accent-blue-600"
                />
              </div>
              {settings.wifiEnabled ? (
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-300 font-medium flex items-center justify-between">
                    <span>✓ Nova-Gigabit-Mesh 5G</span>
                    <span className="text-[10px] text-blue-400 font-mono">Connected</span>
                  </div>
                  <div className="text-neutral-400 space-y-1 px-1">
                    <div className="flex justify-between">
                      <span>IP Address:</span>
                      <span className="font-mono text-white">192.168.1.108</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hardware Link:</span>
                      <span className="font-mono text-white">866 Mbps</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-neutral-500">Wi-Fi is turned off</div>
              )}
            </div>
          )}
        </div>

        {/* Bluetooth Indicator Flyout */}
        <div className="relative">
          <button
            onClick={() => {
              soundService.playClick()
              setShowBluetoothFlyout((b) => !b)
              setShowWifiFlyout(false)
              setShowVolumeFlyout(false)
              setShowBatteryFlyout(false)
              setShowCalendarFlyout(false)
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title="Bluetooth Devices"
          >
            <Bluetooth size={14} className="text-blue-400" />
          </button>

          {showBluetoothFlyout && (
            <div className="absolute top-8 right-0 w-64 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-4 text-xs text-neutral-200 z-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Bluetooth</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  Active
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 bg-white/5 rounded-xl flex items-center justify-between">
                  <span>Nova Wireless Headphones</span>
                  <span className="text-emerald-400">Connected (85%)</span>
                </div>
                <div className="p-2 bg-white/5 rounded-xl flex items-center justify-between">
                  <span>Precision Magic Trackpad</span>
                  <span className="text-emerald-400">Connected (90%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Volume Flyout */}
        <div className="relative">
          <button
            onClick={() => {
              soundService.playClick()
              setShowVolumeFlyout((v) => !v)
              setShowWifiFlyout(false)
              setShowBluetoothFlyout(false)
              setShowBatteryFlyout(false)
              setShowCalendarFlyout(false)
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title="Volume Control"
          >
            {settings.volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {showVolumeFlyout && (
            <div className="absolute top-8 right-0 w-52 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-4 text-xs text-neutral-200 z-50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">Volume</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {Math.round(settings.volume * 100)}%
                </span>
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

        {/* Battery Status Flyout */}
        <div className="relative">
          <button
            onClick={() => {
              soundService.playClick()
              setShowBatteryFlyout((b) => !b)
              setShowWifiFlyout(false)
              setShowBluetoothFlyout(false)
              setShowVolumeFlyout(false)
              setShowCalendarFlyout(false)
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition text-[11px] font-mono"
            title="Battery: 100%"
          >
            <span>100%</span>
            <Battery size={15} className="text-emerald-400" />
          </button>

          {showBatteryFlyout && (
            <div className="absolute top-8 right-0 w-52 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-4 text-xs text-neutral-200 z-50 space-y-2">
              <div className="font-semibold text-white">Power Source</div>
              <div className="text-[11px] text-emerald-400 font-medium">Power Adapter (Charging 100%)</div>
              <div className="text-[10px] text-neutral-400">Power Mode: High Performance</div>
            </div>
          )}
        </div>

        {/* Spotlight Search Icon */}
        <button
          onClick={() => {
            soundService.playClick()
            onOpenSpotlight()
          }}
          className="p-1 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition"
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
            setShowCalendarFlyout(false)
          }}
          className={`p-1 rounded-lg transition ${
            showControlCenter
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-neutral-300 hover:text-white'
          }`}
          title="Control Center"
        >
          <Sliders size={14} />
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => {
            soundService.playClick()
            setShowNotifications((n) => !n)
            setShowControlCenter(false)
            setShowCalendarFlyout(false)
          }}
          className={`p-1 rounded-lg transition relative ${
            showNotifications
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-neutral-300 hover:text-white'
          }`}
          title="Notification Center"
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_#3b82f6]" />
          )}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              soundService.playClick()
              setShowUserFlyout((u) => !u)
              setShowControlCenter(false)
              setShowNotifications(false)
              setShowCalendarFlyout(false)
            }}
            className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white transition text-xs"
            title={`User: ${settings.username || 'Commander Nova'}`}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-[1px] overflow-hidden flex items-center justify-center">
              <User size={11} className="text-white" />
            </div>
          </button>

          {showUserFlyout && (
            <div className="absolute top-8 right-0 w-56 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-4 text-xs text-neutral-200 z-50 space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1.5px] shadow-md flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">{settings.username || 'Commander Nova'}</div>
                  <div className="text-[10px] text-neutral-400">Active User</div>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    openApp('settings')
                    setShowUserFlyout(false)
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition"
                >
                  Settings & Personalization
                </button>
                <button
                  onClick={() => {
                    setShowUserFlyout(false)
                    lockSystem()
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition"
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
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition"
                >
                  <Moon size={12} /> Sleep
                </button>
                <button
                  onClick={() => {
                    setShowUserFlyout(false)
                    rebootSystem()
                  }}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition"
                >
                  <Sparkles size={12} /> Restart...
                </button>
                <div className="my-1 border-t border-white/10" />
                <button
                  onClick={() => {
                    setShowUserFlyout(false)
                    powerOffSystem()
                  }}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-red-600 hover:text-white text-red-300 transition"
                >
                  <Power size={12} /> Shut Down...
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Date & Time Button (Click to open Calendar flyout) */}
        <div className="relative">
          <button
            onClick={() => {
              soundService.playClick()
              setShowCalendarFlyout(!showCalendarFlyout)
              setShowControlCenter(false)
              setShowNotifications(false)
            }}
            className="px-2 py-0.5 rounded-lg hover:bg-white/10 text-neutral-200 hover:text-white font-medium text-[11px] transition flex items-center gap-1"
          >
            <span>{currentTimeStr}</span>
          </button>

          {/* Interactive Monthly Calendar Popover */}
          {showCalendarFlyout && (
            <div className="absolute top-8 right-0 w-72 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-4 text-xs text-neutral-200 z-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-white text-sm">
                  {monthNames[month]} {year}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center font-semibold text-[10px] text-neutral-400">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 text-center text-xs gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1
                  const isToday =
                    dayNum === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear()
                  return (
                    <div
                      key={dayNum}
                      className={`h-7 rounded-lg flex items-center justify-center cursor-pointer transition ${
                        isToday
                          ? 'bg-blue-600 text-white font-bold shadow'
                          : 'hover:bg-white/10 text-neutral-300'
                      }`}
                    >
                      {dayNum}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Flyout Panels */}
      <ControlCenter isOpen={showControlCenter} onClose={() => setShowControlCenter(false)} />
      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  )
}
