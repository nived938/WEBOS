import React from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { Eye, Type, Contrast, Sparkles, Sliders } from 'lucide-react'

export const AccessibilitySection: React.FC = () => {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Accessibility</h3>
        <p className="text-neutral-400 text-xs">
          Optimize interface visibility, typography scaling, contrast contours, and focus outlines.
        </p>
      </div>

      {/* High Contrast Mode */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2.5">
          <Contrast size={18} className="text-emerald-400" />
          <div>
            <div className="font-semibold text-white text-xs">High Contrast Mode</div>
            <div className="text-[11px] text-neutral-400">Increase border strokes and sharpen typography</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.accessibilitySettings.highContrast}
          onChange={(e) =>
            updateSettings({
              accessibilitySettings: {
                ...settings.accessibilitySettings,
                highContrast: e.target.checked,
              },
            })
          }
          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Text Scaling Slider */}
      <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-300 font-medium flex items-center gap-2">
            <Type size={14} className="text-cyan-400" />
            <span>System Text Scale</span>
          </span>
          <span className="font-mono text-cyan-300">{settings.accessibilitySettings.textScale}%</span>
        </div>
        <input
          type="range"
          min={80}
          max={130}
          step={5}
          value={settings.accessibilitySettings.textScale}
          onChange={(e) =>
            updateSettings({
              accessibilitySettings: {
                ...settings.accessibilitySettings,
                textScale: Number(e.target.value),
              },
            })
          }
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500">
          <span>80% (Compact)</span>
          <span>100% (Standard)</span>
          <span>130% (High Readability)</span>
        </div>
      </div>

      {/* Grayscale Mode */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2.5">
          <Eye size={18} className="text-neutral-400" />
          <div>
            <div className="font-semibold text-white text-xs">Grayscale Display Mode</div>
            <div className="text-[11px] text-neutral-400">Convert the entire desktop color spectrum to monochrome</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.accessibilitySettings.grayscale}
          onChange={(e) =>
            updateSettings({
              accessibilitySettings: {
                ...settings.accessibilitySettings,
                grayscale: e.target.checked,
              },
            })
          }
          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Visible Focus Outlines */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2.5">
          <Sliders size={18} className="text-blue-400" />
          <div>
            <div className="font-semibold text-white text-xs">High Visibility Focus Outlines</div>
            <div className="text-[11px] text-neutral-400">Prominent cyan rings around keyboard focused elements</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.accessibilitySettings.focusOutlines}
          onChange={(e) =>
            updateSettings({
              accessibilitySettings: {
                ...settings.accessibilitySettings,
                focusOutlines: e.target.checked,
              },
            })
          }
          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
        />
      </div>
    </div>
  )
}
