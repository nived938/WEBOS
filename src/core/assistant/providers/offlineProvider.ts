import type { ToolCall } from '../types'

export interface ParsedOfflineIntent {
  reply: string
  toolCalls?: ToolCall[]
}

export function parseOfflineIntent(prompt: string): ParsedOfflineIntent {
  const p = prompt.trim().toLowerCase()

  // 1. App Launching
  if (p.includes('open ') || p.includes('launch ') || p.includes('start ')) {
    const target = p.replace(/(open|launch|start)\s+/i, '').replace(/app|the|application/g, '').trim()

    if (target.includes('browser') || target.includes('internet') || target.includes('web')) {
      return {
        reply: 'Opening Browser...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'browser' } }],
      }
    }
    if (target.includes('notes') || target.includes('notepad')) {
      return {
        reply: 'Opening Notes...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'notes' } }],
      }
    }
    if (target.includes('system monitor') || target.includes('task manager') || target.includes('activity monitor') || target.includes('monitor')) {
      return {
        reply: 'Opening NOVA System Monitor...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'systemmonitor' } }],
      }
    }
    if (target.includes('finder') || target.includes('files') || target.includes('file manager')) {
      return {
        reply: 'Opening Finder...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'finder' } }],
      }
    }
    if (target.includes('settings') || target.includes('personalization')) {
      return {
        reply: 'Opening System Settings...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'settings' } }],
      }
    }
    if (target.includes('games') || target.includes('gaming') || target.includes('arcade')) {
      return {
        reply: 'Opening NOVA Gaming Hub...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'games' } }],
      }
    }
    if (target.includes('customization') || target.includes('marketplace') || target.includes('themes center')) {
      return {
        reply: 'Opening Customization Center...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'customizationcenter' } }],
      }
    }
    if (target.includes('boot') || target.includes('startup')) {
      return {
        reply: 'Opening Startup Manager...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'startupmanager' } }],
      }
    }
    if (target.includes('calculator')) {
      return {
        reply: 'Opening Calculator...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'calculator' } }],
      }
    }
    if (target.includes('terminal')) {
      return {
        reply: 'Opening Terminal...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'terminal' } }],
      }
    }
    if (target.includes('store') || target.includes('app store')) {
      return {
        reply: 'Opening App Store...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'appstore' } }],
      }
    }

    // Generic open
    return {
      reply: `Searching for and opening "${target}"...`,
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: target } }],
    }
  }

  // 2. Games Launching
  if (p.includes('play ') || p.includes('blockworld') || p.includes('minecraft') || p.includes('game')) {
    if (p.includes('blockworld') || p.includes('voxel') || p.includes('minecraft')) {
      return {
        reply: 'Launching NOVA Blockworld 3D procedural voxel sandbox...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'launch_game', args: { gameNameOrId: 'game_blockworld' } }],
      }
    }
    if (p.includes('marble') || p.includes('ball')) {
      return {
        reply: 'Launching Marble Runner 3D...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'launch_game', args: { gameNameOrId: 'game_marble3d' } }],
      }
    }
    if (p.includes('space') || p.includes('tunnel')) {
      return {
        reply: 'Launching Space Tunnel 3D...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'launch_game', args: { gameNameOrId: 'game_space3d' } }],
      }
    }
    if (p.includes('chess')) {
      return {
        reply: 'Launching Chess Master...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'launch_game', args: { gameNameOrId: 'game_chess' } }],
      }
    }
    if (p.includes('racing')) {
      return {
        reply: 'Launching Hyper Racing 3D...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'launch_game', args: { gameNameOrId: 'game_racing3d' } }],
      }
    }
    return {
      reply: 'Opening Games Center...',
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'games' } }],
    }
  }

  // 3. Theme Changing
  if (p.includes('theme') || p.includes('style')) {
    if (p.includes('cyberpunk') || p.includes('neon')) {
      return {
        reply: 'Switching active theme to Cyberpunk Neon...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_theme', args: { themeId: 'cyberpunk' } }],
      }
    }
    if (p.includes('liquid') || p.includes('glass')) {
      return {
        reply: 'Switching active theme to NOVA Liquid Glass...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_theme', args: { themeId: 'liquid-glass' } }],
      }
    }
    if (p.includes('dark') || p.includes('obsidian')) {
      return {
        reply: 'Switching active theme to NOVA Dark (Obsidian)...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_theme', args: { themeId: 'nova-dark' } }],
      }
    }
    if (p.includes('light') || p.includes('white')) {
      return {
        reply: 'Switching active theme to NOVA Light...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_theme', args: { themeId: 'nova-light' } }],
      }
    }
    if (p.includes('ubuntu') || p.includes('orange')) {
      return {
        reply: 'Switching active theme to Ubuntu Yaru Orange...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_theme', args: { themeId: 'ubuntu-orange' } }],
      }
    }
    if (p.includes('emerald') || p.includes('green')) {
      return {
        reply: 'Switching active theme to Emerald Matrix...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_theme', args: { themeId: 'emerald' } }],
      }
    }
    if (p.includes('crystal')) {
      return {
        reply: 'Switching active theme to Crystal...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_theme', args: { themeId: 'frosted-glass' } }],
      }
    }
    return {
      reply: 'Opening Theme personalization in Settings...',
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'settings' } }],
    }
  }

  // 4. Wallpaper Changing
  if (p.includes('wallpaper') || p.includes('background')) {
    if (p.includes('aurora')) {
      return {
        reply: 'Changing desktop wallpaper to NOVA Aurora Borealis...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_wallpaper', args: { wallpaperId: 'nova-aurora' } }],
      }
    }
    if (p.includes('space') || p.includes('galaxy') || p.includes('stars')) {
      return {
        reply: 'Changing desktop wallpaper to Deep Space...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_wallpaper', args: { wallpaperId: 'deep-space' } }],
      }
    }
    if (p.includes('cyberpunk') || p.includes('city')) {
      return {
        reply: 'Changing desktop wallpaper to Cyberpunk Metropolis...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_wallpaper', args: { wallpaperId: 'neon-cyberpunk' } }],
      }
    }
    if (p.includes('matrix') || p.includes('emerald')) {
      return {
        reply: 'Changing desktop wallpaper to Emerald Matrix Flow...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_wallpaper', args: { wallpaperId: 'emerald-matrix' } }],
      }
    }
    if (p.includes('solar') || p.includes('sun')) {
      return {
        reply: 'Changing desktop wallpaper to Helios Solar Flare...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_wallpaper', args: { wallpaperId: 'solar-flare' } }],
      }
    }
    if (p.includes('obsidian') || p.includes('stealth')) {
      return {
        reply: 'Changing desktop wallpaper to Obsidian Stealth...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'change_wallpaper', args: { wallpaperId: 'obsidian-stealth' } }],
      }
    }
    return {
      reply: 'Opening Wallpaper studio...',
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'open_app', args: { appId: 'wallpaperstudio' } }],
    }
  }

  // 5. Dock Placement
  if (p.includes('dock')) {
    if (p.includes('left')) {
      return {
        reply: 'Moving dock to the left side of the screen...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'set_dock_position', args: { position: 'left' } }],
      }
    }
    if (p.includes('bottom')) {
      return {
        reply: 'Moving dock to the bottom of the screen...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'set_dock_position', args: { position: 'bottom' } }],
      }
    }
    if (p.includes('right')) {
      return {
        reply: 'Moving dock to the right side of the screen...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'set_dock_position', args: { position: 'right' } }],
      }
    }
  }

  // 6. System Stats & Performance
  if (p.includes('stats') || p.includes('performance') || p.includes('fps') || p.includes('usage') || p.includes('system')) {
    return {
      reply: 'Checking live system telemetry and opening System Monitor...',
      toolCalls: [
        { id: `tc-stats-${Date.now()}`, name: 'get_system_stats', args: {} },
        { id: `tc-open-${Date.now()}`, name: 'open_app', args: { appId: 'systemmonitor' } },
      ],
    }
  }

  // 7. Lock Screen
  if (p.includes('lock screen') || p.includes('lock os') || p.includes('lock system') || p.includes('lock')) {
    return {
      reply: 'Locking NOVA OS screen...',
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'lock_system', args: {} }],
    }
  }

  // 8. Workspaces
  if (p.includes('workspace')) {
    if (/\b1\b/.test(p) || /\bmain\b/i.test(p)) {
      return {
        reply: 'Switching to Workspace #1 (Main)...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'switch_workspace', args: { workspaceId: 1 } }],
      }
    }
    if (/\b3\b/.test(p) || /\bgaming\b/i.test(p)) {
      return {
        reply: 'Switching to Workspace #3 (Gaming)...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'switch_workspace', args: { workspaceId: 3 } }],
      }
    }
    if (/\b4\b/.test(p) || /\bentertainment\b/i.test(p)) {
      return {
        reply: 'Switching to Workspace #4 (Entertainment)...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'switch_workspace', args: { workspaceId: 4 } }],
      }
    }
    if (/\b2\b/.test(p) || /\bdev\b/i.test(p) || /\bwork\b/i.test(p.replace(/workspace/g, ''))) {
      return {
        reply: 'Switching to Workspace #2 (Work)...',
        toolCalls: [{ id: `tc-${Date.now()}`, name: 'switch_workspace', args: { workspaceId: 2 } }],
      }
    }
  }

  // 9. List apps / what is running
  if (p.includes('list apps') || p.includes('what apps') || p.includes('running apps') || p.includes('open windows')) {
    return {
      reply: 'Fetching list of currently active applications and windows...',
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'list_apps', args: { filter: 'running' } }],
    }
  }

  // 10. Volume / Sound
  if (p.includes('mute') || p.includes('silence') || (p.includes('turn off') && p.includes('sound'))) {
    return {
      reply: 'Muting system sound effects...',
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'toggle_sounds', args: { enabled: false } }],
    }
  }
  if (p.includes('unmute') || (p.includes('turn on') && p.includes('sound'))) {
    return {
      reply: 'Enabling system sound effects...',
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'toggle_sounds', args: { enabled: true } }],
    }
  }

  // Conversational built-in intelligence
  if (p.includes('who are you') || p.includes('what are you') || p.includes('your name')) {
    return {
      reply: 'I am NOVA AI, your intelligent desktop assistant built directly into NOVA OS. I can launch applications, switch themes and wallpapers, manage virtual workspaces, check real system telemetry, and automate your desktop through controlled tools!',
    }
  }

  if (p.includes('help') || p.includes('what can you do')) {
    return {
      reply: `Here are some things I can do for you:
• Launch apps: "Open Browser", "Launch Notes", "Open System Monitor"
• Play games: "Play NOVA Blockworld", "Launch Marble Runner 3D"
• Personalize desktop: "Change theme to Cyberpunk", "Set wallpaper to Deep Space"
• Window management: "Move dock to left", "Switch to workspace 2"
• System management: "Check system stats", "Lock screen", "Mute sounds"
• Customization: "Open Customization Center"`,
    }
  }

  if (p.includes('hello') || p.includes('hi') || p.includes('hey')) {
    return {
      reply: 'Greetings Commander! How can I assist you on NOVA OS today?',
    }
  }

  // Default fallback conversational response
  return {
    reply: `I heard: "${prompt}". In Offline Assistant Mode, you can ask me to open any app, change themes, switch wallpapers, launch 3D games like Blockworld, or monitor system performance! (You can also connect a local Ollama model in settings for full LLM conversations).`,
  }
}
