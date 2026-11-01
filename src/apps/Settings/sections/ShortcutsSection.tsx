import React, { useState } from 'react'
import { Command, Keyboard, Search } from 'lucide-react'

export const ShortcutsSection: React.FC = () => {
  const [filter, setFilter] = useState('')

  const shortcutGroups = [
    {
      category: 'System & Control',
      items: [
        { name: 'Spotlight Search', keys: ['Meta', 'Space'], desc: 'Open global application search' },
        { name: 'Lock Operating System', keys: ['Alt', 'L'], desc: 'Instantly activate lock screen' },
        { name: 'App Switcher', keys: ['Alt', 'Tab'], desc: 'Cycle through running windows' },
        { name: 'Mission Control Overview', keys: ['Meta', 'Tab'], desc: 'Show all open windows across workspace' },
      ],
    },
    {
      category: 'Window Management',
      items: [
        { name: 'Snap Left Half', keys: ['Alt', 'Left'], desc: 'Snap window to left 50% of screen' },
        { name: 'Snap Right Half', keys: ['Alt', 'Right'], desc: 'Snap window to right 50% of screen' },
        { name: 'Maximize Window', keys: ['Alt', 'Up'], desc: 'Expand window to full viewport' },
        { name: 'Minimize Window', keys: ['Alt', 'Down'], desc: 'Stow window into Dock' },
        { name: 'Close Window', keys: ['Alt', 'W'], desc: 'Close frontmost active window' },
      ],
    },
    {
      category: 'Virtual Workspaces',
      items: [
        { name: 'Switch to Workspace 1', keys: ['Ctrl', '1'], desc: 'Jump to Main Desktop' },
        { name: 'Switch to Workspace 2', keys: ['Ctrl', '2'], desc: 'Jump to Code & Terminals' },
        { name: 'Switch to Workspace 3', keys: ['Ctrl', '3'], desc: 'Jump to Media & Entertainment' },
        { name: 'Switch to Workspace 4', keys: ['Ctrl', '4'], desc: 'Jump to Utilities & Labs' },
      ],
    },
    {
      category: 'Rapid App Launchers',
      items: [
        { name: 'Launch Terminal', keys: ['Ctrl', '`'], desc: 'Open Unix zsh terminal emulator' },
        { name: 'Launch File Manager', keys: ['Alt', 'F'], desc: 'Open Finder filesystem browser' },
        { name: 'Launch Settings', keys: ['Alt', ','], desc: 'Open System Personalization Center' },
      ],
    },
  ]

  const filteredGroups = shortcutGroups
    .map((grp) => ({
      ...grp,
      items: grp.items.filter(
        (it) =>
          it.name.toLowerCase().includes(filter.toLowerCase()) ||
          it.desc.toLowerCase().includes(filter.toLowerCase()) ||
          it.keys.some((k) => k.toLowerCase().includes(filter.toLowerCase()))
      ),
    }))
    .filter((grp) => grp.items.length > 0)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1">Keyboard Shortcuts</h3>
          <p className="text-neutral-400 text-xs">
            Cheatsheet of global hotkeys for window manipulation, system navigation, and workspace switching.
          </p>
        </div>
      </div>

      {/* Filter search box */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Filter shortcuts by name or hotkey..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 placeholder-neutral-500"
        />
      </div>

      {/* Shortcuts List */}
      <div className="space-y-5">
        {filteredGroups.map((group) => (
          <div key={group.category} className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-300">{group.category}</h4>
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden divide-y divide-white/5">
              {group.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 text-xs">
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-2 py-1 rounded-md bg-black/60 border border-white/20 font-mono text-[10px] font-semibold text-neutral-200 shadow-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
