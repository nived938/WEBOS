import React, { useState } from 'react'
import { useSettings } from '@/core/settings/SettingsContext'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'
import { BUILTIN_THEMES, exportThemeAsJSON, importThemeFromJSON } from '@/core/theme/themes'
import type { ThemeDefinition, AccentColor } from '@/types'
import {
  Palette,
  Check,
  Plus,
  Download,
  Upload,
  Copy,
  Trash2,
  Sparkles,
  Edit2,
  X,
  Layers,
} from 'lucide-react'

export const ThemesSection: React.FC = () => {
  const { settings, updateSettings } = useSettings()
  const { addNotification } = useNotifications()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null)

  // New/Edit Theme form state
  const [themeName, setThemeName] = useState('')
  const [themeDesc, setThemeDesc] = useState('')
  const [themeAccent, setThemeAccent] = useState<AccentColor>('blue')
  const [windowBg, setWindowBg] = useState('rgba(16, 20, 32, 0.82)')
  const [panelBg, setPanelBg] = useState('rgba(12, 16, 24, 0.75)')
  const [dockBg, setDockBg] = useState('rgba(15, 20, 30, 0.70)')
  const [borderColor, setBorderColor] = useState('rgba(255, 255, 255, 0.15)')
  const [textColor, setTextColor] = useState('#f8fafc')
  const [selectionColor, setSelectionColor] = useState('#3b82f6')
  const [borderRadius, setBorderRadius] = useState(16)
  const [shadowIntensity, setShadowIntensity] = useState(65)
  const [glassTransparency, setGlassTransparency] = useState(30)

  const handleApplyTheme = (theme: ThemeDefinition) => {
    soundService.playClick()
    updateSettings({
      activeThemeId: theme.id,
      accentColor: theme.accentColor,
      wallpaperId: theme.background.wallpaperId,
    })
    addNotification('Theme Applied', `Switched active theme to "${theme.name}"`, 'settings')
  }

  const handleExportTheme = (theme: ThemeDefinition) => {
    soundService.playClick()
    const jsonStr = exportThemeAsJSON(theme)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`
    a.click()
    URL.revokeObjectURL(url)
    addNotification('Theme Exported', `Saved "${theme.name}" as JSON file.`, 'settings')
  }

  const handleImportTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result as string
      const imported = importThemeFromJSON(content)
      if (imported) {
        soundService.playStartup()
        updateSettings({
          customThemes: [...settings.customThemes, imported],
          activeThemeId: imported.id,
        })
        addNotification('Theme Imported', `Added and activated "${imported.name}"`, 'settings')
      } else {
        addNotification('Import Error', 'Invalid or incompatible theme JSON format.', 'settings')
      }
    }
    reader.readAsText(file)
  }

  const handleDuplicateTheme = (theme: ThemeDefinition) => {
    soundService.playClick()
    const duplicated: ThemeDefinition = {
      ...theme,
      id: `custom-${Date.now()}`,
      name: `${theme.name} (Copy)`,
      isBuiltIn: false,
    }
    updateSettings({
      customThemes: [...settings.customThemes, duplicated],
    })
    addNotification('Theme Duplicated', `Created copy of "${theme.name}"`, 'settings')
  }

  const handleDeleteCustomTheme = (themeId: string) => {
    soundService.playTrashEmpty()
    const nextCustom = settings.customThemes.filter((t) => t.id !== themeId)
    const nextActive = settings.activeThemeId === themeId ? 'nova-dark' : settings.activeThemeId
    updateSettings({
      customThemes: nextCustom,
      activeThemeId: nextActive,
    })
    addNotification('Theme Deleted', 'Custom theme removed.', 'settings')
  }

  const handleSaveTheme = () => {
    if (!themeName.trim()) return

    const newTheme: ThemeDefinition = {
      id: editingThemeId || `custom-${Date.now()}`,
      name: themeName.trim(),
      description: themeDesc.trim() || 'Custom created theme',
      isBuiltIn: false,
      background: {
        wallpaperId: settings.wallpaperId,
        type: 'dynamic',
        fallbackColor: '#090919',
      },
      accentColor: themeAccent,
      windowBackground: windowBg,
      panelAppearance: panelBg,
      dockAppearance: dockBg,
      borderColor: borderColor,
      textColor: textColor,
      buttonStyle: 'glass',
      selectionColor: selectionColor,
      highlightColor: `${selectionColor}50`,
      shadowIntensity: shadowIntensity,
      borderRadius: borderRadius,
      glassTransparency: glassTransparency,
    }

    if (editingThemeId) {
      updateSettings({
        customThemes: settings.customThemes.map((t) => (t.id === editingThemeId ? newTheme : t)),
        activeThemeId: editingThemeId === settings.activeThemeId ? newTheme.id : settings.activeThemeId,
      })
      addNotification('Theme Updated', `Saved changes to "${newTheme.name}"`, 'settings')
    } else {
      updateSettings({
        customThemes: [...settings.customThemes, newTheme],
        activeThemeId: newTheme.id,
      })
      addNotification('Theme Created', `Created and activated "${newTheme.name}"`, 'settings')
    }

    setShowCreateModal(false)
    setEditingThemeId(null)
  }

  const handleOpenEdit = (theme: ThemeDefinition) => {
    setEditingThemeId(theme.id)
    setThemeName(theme.name)
    setThemeDesc(theme.description || '')
    setThemeAccent(theme.accentColor)
    setWindowBg(theme.windowBackground)
    setPanelBg(theme.panelAppearance)
    setDockBg(theme.dockAppearance)
    setBorderColor(theme.borderColor)
    setTextColor(theme.textColor)
    setSelectionColor(theme.selectionColor)
    setBorderRadius(theme.borderRadius)
    setShadowIntensity(theme.shadowIntensity)
    setGlassTransparency(theme.glassTransparency)
    setShowCreateModal(true)
  }

  const allThemes = [...BUILTIN_THEMES, ...settings.customThemes]

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1">Theme Studio</h3>
          <p className="text-neutral-400 text-xs">
            Browse 14 built-in system themes, import, export, or design your own custom color palettes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer transition">
            <Upload size={13} />
            <span>Import JSON</span>
            <input type="file" accept=".json,application/json" onChange={handleImportTheme} className="hidden" />
          </label>
          <button
            onClick={() => {
              soundService.playClick()
              setEditingThemeId(null)
              setThemeName('My Custom Theme')
              setThemeDesc('Personalized operating system theme')
              setShowCreateModal(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-md shadow-blue-600/20"
          >
            <Plus size={13} />
            <span>Create Theme</span>
          </button>
        </div>
      </div>

      {/* Built-in Themes Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
          <Layers size={14} className="text-blue-400" />
          <span>Built-in Themes ({BUILTIN_THEMES.length})</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BUILTIN_THEMES.map((theme) => {
            const isActive = settings.activeThemeId === theme.id
            return (
              <div
                key={theme.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/40'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{theme.name}</span>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                        style={{ backgroundColor: theme.selectionColor }}
                        title="Selection Accent"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                        style={{ backgroundColor: theme.windowBackground }}
                        title="Window Background"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportTheme(theme)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
                      title="Export Theme JSON"
                    >
                      <Download size={13} />
                    </button>
                    <button
                      onClick={() => handleDuplicateTheme(theme)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
                      title="Duplicate Theme"
                    >
                      <Copy size={13} />
                    </button>
                  </div>

                  {isActive ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-blue-300 font-semibold">
                      <Check size={13} /> Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApplyTheme(theme)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Custom User Themes */}
      {settings.customThemes.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span>Custom Themes ({settings.customThemes.length})</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {settings.customThemes.map((theme) => {
              const isActive = settings.activeThemeId === theme.id
              return (
                <div
                  key={theme.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/40'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{theme.name}</span>
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                          style={{ backgroundColor: theme.selectionColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                          style={{ backgroundColor: theme.windowBackground }}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                      {theme.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(theme)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
                        title="Edit Theme"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleExportTheme(theme)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
                        title="Export JSON"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomTheme(theme.id)}
                        className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition"
                        title="Delete Theme"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {isActive ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-amber-300 font-semibold">
                        <Check size={13} /> Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyTheme(theme)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Theme Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/20 rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="font-bold text-white text-sm">
                {editingThemeId ? 'Edit Custom Theme' : 'Create Custom Theme'}
              </h4>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-neutral-300">Theme Name</label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  className="w-full px-3 py-1.5 mt-1 rounded-xl bg-black/50 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-300">Description</label>
                <input
                  type="text"
                  value={themeDesc}
                  onChange={(e) => setThemeDesc(e.target.value)}
                  className="w-full px-3 py-1.5 mt-1 rounded-xl bg-black/50 border border-white/15 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-neutral-300">Window Background</label>
                  <input
                    type="text"
                    value={windowBg}
                    onChange={(e) => setWindowBg(e.target.value)}
                    className="w-full px-3 py-1.5 mt-1 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-neutral-300">Selection Color</label>
                  <input
                    type="text"
                    value={selectionColor}
                    onChange={(e) => setSelectionColor(e.target.value)}
                    className="w-full px-3 py-1.5 mt-1 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-neutral-300">Panel Background</label>
                  <input
                    type="text"
                    value={panelBg}
                    onChange={(e) => setPanelBg(e.target.value)}
                    className="w-full px-3 py-1.5 mt-1 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-neutral-300">Dock Background</label>
                  <input
                    type="text"
                    value={dockBg}
                    onChange={(e) => setDockBg(e.target.value)}
                    className="w-full px-3 py-1.5 mt-1 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-300">Border Radius</span>
                  <span className="font-mono text-cyan-300">{borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-300">Shadow Intensity</span>
                  <span className="font-mono text-cyan-300">{shadowIntensity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={shadowIntensity}
                  onChange={(e) => setShadowIntensity(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-300">Glass Transparency</span>
                  <span className="font-mono text-cyan-300">{glassTransparency}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={glassTransparency}
                  onChange={(e) => setGlassTransparency(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-xl text-neutral-300 hover:bg-white/10 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTheme}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md"
              >
                Save Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
