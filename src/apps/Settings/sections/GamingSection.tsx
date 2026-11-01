import React, { useState, useEffect } from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { usePointerLock } from '@/core/pointer/PointerLockContext'
import { soundService } from '@/core/audio/soundService'
import { Gamepad2, Zap, MousePointer, Activity, CheckCircle2 } from 'lucide-react'

export const GamingSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()
  const { isSupported: isPointerLockSupported, isLocked: isPointerLocked, requestLock: requestPointerLock } = usePointerLock()
  const [hasGamepad, setHasGamepad] = useState(false)

  useEffect(() => {
    const checkGamepad = () => {
      if (typeof navigator !== 'undefined' && 'getGamepads' in navigator) {
        const pads = navigator.getGamepads()
        const active = Array.from(pads).some((p) => p !== null)
        setHasGamepad(active)
      }
    }
    checkGamepad()
    window.addEventListener('gamepadconnected', checkGamepad)
    window.addEventListener('gamepaddisconnected', checkGamepad)
    return () => {
      window.removeEventListener('gamepadconnected', checkGamepad)
      window.removeEventListener('gamepaddisconnected', checkGamepad)
    }
  }, [])

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Gaming & Performance</h3>
        <p className="text-neutral-400 text-xs">
          High-performance compositor scheduling, 3D hardware pointer lock, and gamepad status.
        </p>
      </div>

      {/* High Performance Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2.5">
          <Zap size={18} className="text-amber-400" />
          <div>
            <div className="font-semibold text-white text-xs">High Performance Mode</div>
            <div className="text-[11px] text-neutral-400">Maximize compositor frame rates, bypass low-power throttles</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.performanceMode === 'high'}
          onChange={(e) =>
            updateSettings({
              performanceMode: e.target.checked ? 'high' : 'balanced',
            })
          }
          className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
        />
      </div>

      {/* Hardware Pointer Lock Test */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MousePointer size={16} className="text-cyan-400" />
            <div>
              <div className="font-semibold text-white text-xs">Hardware Pointer Lock Capture</div>
              <div className="text-[11px] text-neutral-400">
                Direct raw mouse movement capture for 3D games (Marble Runner 3D, Space Tunnel)
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPointerLocked ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'
              }`}
            />
            <span className="text-xs text-neutral-300 font-mono">
              Status: {isPointerLocked ? 'Captured (Locked)' : 'Unlocked'}
            </span>
          </div>

          <button
            onClick={() => {
              soundService.playClick()
              requestPointerLock()
            }}
            disabled={!isPointerLockSupported}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium transition shadow-md shadow-cyan-600/20"
          >
            {isPointerLockSupported ? 'Test Pointer Lock' : 'Not Supported'}
          </button>
        </div>
      </div>

      {/* Game Controller API status */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Gamepad2 size={18} className="text-purple-400" />
          <div>
            <div className="font-semibold text-white text-xs">Gamepad Controller Subsystem</div>
            <div className="text-[11px] text-neutral-400">Standard HTML5 Gamepad API polling</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${hasGamepad ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
          <span className="text-[11px] font-mono text-neutral-300">
            {hasGamepad ? 'Connected' : 'No Controller Detected'}
          </span>
        </div>
      </div>
    </div>
  )
}
