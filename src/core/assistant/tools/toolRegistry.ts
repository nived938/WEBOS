import type { AppId } from '@/types'
import { APPS_REGISTRY } from '@/core/appRegistry/apps.config'
import { WALLPAPERS } from '@/core/settings/wallpapers'
import { BUILTIN_THEMES } from '@/core/theme/themes'
import { telemetryService } from '@/apps/SystemMonitor/utils/telemetry'
import type { ToolCall, ToolExecutionResult } from '../types'

export interface ToolDefinition {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, { type: string; description: string; enum?: string[] }>
    required: string[]
  }
  isDestructive?: boolean
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'open_app',
    description: 'Launch or bring to focus any registered NOVA OS application by AppId or title.',
    parameters: {
      type: 'object',
      properties: {
        appId: {
          type: 'string',
          description: 'The unique application identifier (e.g. "browser", "notes", "finder", "systemmonitor", "games").',
        },
      },
      required: ['appId'],
    },
  },
  {
    name: 'close_app',
    description: 'Close an active virtual window or application by its ID or title.',
    parameters: {
      type: 'object',
      properties: {
        windowIdOrAppId: {
          type: 'string',
          description: 'The window ID or application ID to close.',
        },
      },
      required: ['windowIdOrAppId'],
    },
  },
  {
    name: 'minimize_app',
    description: 'Minimize an open window to the dock.',
    parameters: {
      type: 'object',
      properties: {
        windowIdOrAppId: { type: 'string', description: 'Window or App to minimize' },
      },
      required: ['windowIdOrAppId'],
    },
  },
  {
    name: 'restore_app',
    description: 'Restore a minimized window.',
    parameters: {
      type: 'object',
      properties: {
        windowIdOrAppId: { type: 'string', description: 'Window or App to restore' },
      },
      required: ['windowIdOrAppId'],
    },
  },
  {
    name: 'list_apps',
    description: 'List installed applications and currently open virtual windows in NOVA OS.',
    parameters: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description: 'Filter category or keyword (optional).',
          enum: ['all', 'running', 'games', 'productivity', 'system'],
        },
      },
      required: [],
    },
  },
  {
    name: 'change_wallpaper',
    description: 'Change desktop or lock screen wallpaper.',
    parameters: {
      type: 'object',
      properties: {
        wallpaperId: {
          type: 'string',
          description: 'Wallpaper ID (e.g. "nova-aurora", "deep-space", "neon-cyberpunk", "emerald-matrix", "solar-flare").',
        },
      },
      required: ['wallpaperId'],
    },
  },
  {
    name: 'change_theme',
    description: 'Change the active visual theme across all windows, dock, and panels.',
    parameters: {
      type: 'object',
      properties: {
        themeId: {
          type: 'string',
          description: 'Theme ID (e.g. "nova-dark", "nova-light", "liquid-glass", "cyberpunk", "ubuntu-orange", "emerald").',
        },
      },
      required: ['themeId'],
    },
  },
  {
    name: 'change_accent',
    description: 'Change the system accent highlight color.',
    parameters: {
      type: 'object',
      properties: {
        color: {
          type: 'string',
          description: 'Accent color name.',
          enum: ['blue', 'purple', 'emerald', 'orange', 'rose', 'amber'],
        },
      },
      required: ['color'],
    },
  },
  {
    name: 'set_dock_position',
    description: 'Move the dock to the bottom, left, or right side of the screen.',
    parameters: {
      type: 'object',
      properties: {
        position: {
          type: 'string',
          description: 'Dock placement.',
          enum: ['bottom', 'left', 'right'],
        },
      },
      required: ['position'],
    },
  },
  {
    name: 'switch_workspace',
    description: 'Switch the active virtual desktop workspace (1 to 4).',
    parameters: {
      type: 'object',
      properties: {
        workspaceId: {
          type: 'number',
          description: 'Workspace index (1: Main, 2: Work, 3: Gaming, 4: Entertainment).',
        },
      },
      required: ['workspaceId'],
    },
  },
  {
    name: 'get_system_stats',
    description: 'Retrieve genuine live telemetry: current frame rate (FPS), JS heap memory, active windows, and storage quota.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'launch_game',
    description: 'Search for and launch a game from the NOVA Arcade / Gaming Hub.',
    parameters: {
      type: 'object',
      properties: {
        gameNameOrId: {
          type: 'string',
          description: 'Game name or ID (e.g. "blockworld", "marble3d", "space3d", "chess", "racing3d").',
        },
      },
      required: ['gameNameOrId'],
    },
  },
  {
    name: 'lock_system',
    description: 'Immediately lock the virtual NOVA operating system screen.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'set_volume',
    description: 'Adjust the system audio volume level.',
    parameters: {
      type: 'object',
      properties: {
        volume: {
          type: 'number',
          description: 'Volume percentage between 0 and 100.',
        },
      },
      required: ['volume'],
    },
  },
  {
    name: 'toggle_sounds',
    description: 'Toggle system audio sound effects on or off.',
    parameters: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', description: 'True to enable, false to mute' },
      },
      required: ['enabled'],
    },
  },
  {
    name: 'delete_file',
    description: 'Move a file in the virtual filesystem to the trash (Destructive action).',
    parameters: {
      type: 'object',
      properties: {
        fileIdOrPath: { type: 'string', description: 'ID or name of the file to remove' },
      },
      required: ['fileIdOrPath'],
    },
    isDestructive: true,
  },
  {
    name: 'reset_settings',
    description: 'Reset operating system visual personalization settings to factory defaults (Destructive action).',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    isDestructive: true,
  },
]

export function getToolDefinition(name: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((t) => t.name === name)
}

export interface OSActionContext {
  openApp: (appId: AppId, args?: Record<string, unknown>) => string
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void
  windows: any[]
  runningAppIds: AppId[]
  updateSettings: (settings: any) => void
  settings: any
  switchWorkspace: (id: number) => void
  lockSystem: () => void
  moveToTrash?: (id: string) => void
  vfsNodes?: any
}

export async function executeOSTool(
  call: ToolCall,
  ctx: OSActionContext
): Promise<ToolExecutionResult> {
  const { name, args } = call

  try {
    switch (name) {
      case 'open_app': {
        const appId = String(args.appId || '').toLowerCase()
        // Match against APPS_REGISTRY
        const match = Object.keys(APPS_REGISTRY).find(
          (k) => k.toLowerCase() === appId || APPS_REGISTRY[k as AppId]?.title.toLowerCase().includes(appId)
        )
        if (match) {
          const winId = ctx.openApp(match as AppId)
          return {
            toolCallId: call.id,
            toolName: name,
            success: true,
            result: `Opened application "${APPS_REGISTRY[match as AppId]?.title}" (Window ID: ${winId})`,
          }
        }
        return {
          toolCallId: call.id,
          toolName: name,
          success: false,
          result: null,
          error: `Application matching "${appId}" was not found in the app registry.`,
        }
      }

      case 'close_app': {
        const query = String(args.windowIdOrAppId || '').toLowerCase()
        const target = ctx.windows.find(
          (w) => w.id.toLowerCase() === query || w.appId.toLowerCase() === query || w.title.toLowerCase().includes(query)
        )
        if (target) {
          ctx.closeWindow(target.id)
          return {
            toolCallId: call.id,
            toolName: name,
            success: true,
            result: `Closed window "${target.title}"`,
          }
        }
        return {
          toolCallId: call.id,
          toolName: name,
          success: false,
          result: null,
          error: `No open window found matching "${query}".`,
        }
      }

      case 'minimize_app': {
        const query = String(args.windowIdOrAppId || '').toLowerCase()
        const target = ctx.windows.find(
          (w) => w.id.toLowerCase() === query || w.appId.toLowerCase() === query || w.title.toLowerCase().includes(query)
        )
        if (target) {
          ctx.minimizeWindow(target.id)
          return {
            toolCallId: call.id,
            toolName: name,
            success: true,
            result: `Minimized window "${target.title}"`,
          }
        }
        return {
          toolCallId: call.id,
          toolName: name,
          success: false,
          result: null,
          error: `No window found to minimize.`,
        }
      }

      case 'restore_app': {
        const query = String(args.windowIdOrAppId || '').toLowerCase()
        const target = ctx.windows.find(
          (w) => w.id.toLowerCase() === query || w.appId.toLowerCase() === query || w.title.toLowerCase().includes(query)
        )
        if (target) {
          ctx.restoreWindow(target.id)
          return {
            toolCallId: call.id,
            toolName: name,
            success: true,
            result: `Restored window "${target.title}"`,
          }
        }
        return {
          toolCallId: call.id,
          toolName: name,
          success: false,
          result: null,
          error: `No window found to restore.`,
        }
      }

      case 'list_apps': {
        const filter = args.filter || 'all'
        if (filter === 'running') {
          const list = ctx.windows.map((w) => `${w.title} (${w.appId}) [${w.isMinimized ? 'minimized' : 'active'}]`)
          return {
            toolCallId: call.id,
            toolName: name,
            success: true,
            result: list.length > 0 ? list : 'No applications are currently open.',
          }
        }
        const appTitles = Object.values(APPS_REGISTRY).map((a) => `${a.title} [id: ${a.id}] (${a.category})`)
        return {
          toolCallId: call.id,
          toolName: name,
          success: true,
          result: `Total registered applications: ${appTitles.length}. Sample: ${appTitles.slice(0, 15).join(', ')}...`,
        }
      }

      case 'change_wallpaper': {
        const wpInput = String(args.wallpaperId || '').toLowerCase()
        const match = WALLPAPERS.find(
          (w) => w.id.toLowerCase() === wpInput || w.name.toLowerCase().includes(wpInput)
        )
        if (match) {
          ctx.updateSettings({ wallpaperId: match.id })
          return {
            toolCallId: call.id,
            toolName: name,
            success: true,
            result: `Changed desktop wallpaper to "${match.name}" (id: ${match.id})`,
          }
        }
        return {
          toolCallId: call.id,
          toolName: name,
          success: false,
          result: null,
          error: `Wallpaper matching "${wpInput}" not found. Available wallpapers: ${WALLPAPERS.map((w) => w.id).join(', ')}`,
        }
      }

      case 'change_theme': {
        const themeInput = String(args.themeId || '').toLowerCase()
        const match = BUILTIN_THEMES.find(
          (t) => t.id.toLowerCase() === themeInput || t.name.toLowerCase().includes(themeInput)
        )
        if (match) {
          ctx.updateSettings({ activeThemeId: match.id })
          return {
            toolCallId: call.id,
            toolName: name,
            success: true,
            result: `Switched desktop theme to "${match.name}" (id: ${match.id})`,
          }
        }
        return {
          toolCallId: call.id,
          toolName: name,
          success: false,
          result: null,
          error: `Theme matching "${themeInput}" not found. Available themes: ${BUILTIN_THEMES.map((t) => t.id).join(', ')}`,
        }
      }

      case 'change_accent': {
        const color = String(args.color || 'blue') as any
        ctx.updateSettings({ accentColor: color })
        return {
          toolCallId: call.id,
          toolName: name,
          success: true,
          result: `Changed system accent color to "${color}".`,
        }
      }

      case 'set_dock_position': {
        const pos = args.position as 'bottom' | 'left' | 'right'
        ctx.updateSettings({
          dockSettings: {
            ...ctx.settings.dockSettings,
            position: pos,
          },
        })
        return {
          toolCallId: call.id,
          toolName: name,
          success: true,
          result: `Dock moved to ${pos}.`,
        }
      }

      case 'switch_workspace': {
        const wsId = Number(args.workspaceId || 1)
        ctx.switchWorkspace(wsId)
        return {
          toolCallId: call.id,
          toolName: name,
          success: true,
          result: `Switched to workspace #${wsId}.`,
        }
      }

      case 'get_system_stats': {
        const fps = telemetryService.getFps()
        const heap = telemetryService.getJsHeap()
        const storage = await telemetryService.getStorageEstimate()
        return {
          toolCallId: call.id,
          toolName: name,
          success: true,
          result: {
            currentFps: fps,
            jsHeapUsedMb: heap.usedMb || 'sandboxed',
            runningWindowsCount: ctx.windows.length,
            storageUsedMb: storage.usedMb || 0,
            storageQuotaMb: storage.quotaMb || 0,
          },
        }
      }

      case 'launch_game': {
        const query = String(args.gameNameOrId || '').toLowerCase()
        const gameKeys = Object.keys(APPS_REGISTRY).filter((k) => k.startsWith('game_') || k === 'games')
        const matched = gameKeys.find(
          (k) => k.toLowerCase().includes(query) || APPS_REGISTRY[k as AppId]?.title.toLowerCase().includes(query)
        )
        if (matched) {
          ctx.openApp(matched as AppId)
          return {
            toolCallId: call.id,
            toolName: name,
            success: true,
            result: `Launched game "${APPS_REGISTRY[matched as AppId]?.title}"`,
          }
        }
        // Fallback open Games Center
        ctx.openApp('games')
        return {
          toolCallId: call.id,
          toolName: name,
          success: true,
          result: `Game "${query}" opened in Games Center.`,
        }
      }

      case 'lock_system': {
        ctx.lockSystem()
        return {
          toolCallId: call.id,
          toolName: name,
          success: true,
          result: 'NOVA OS screen is now locked.',
        }
      }

      case 'set_volume': {
        const vol = Math.max(0, Math.min(100, Number(args.volume || 80))) / 100
        ctx.updateSettings({ volume: vol })
        return {
          toolCallId: call.id,
          toolName: name,
          success: true,
          result: `Audio volume set to ${Math.round(vol * 100)}%.`,
        }
      }

      case 'toggle_sounds': {
        const enabled = Boolean(args.enabled)
        ctx.updateSettings({ soundEffects: enabled })
        return {
          toolCallId: call.id,
          toolName: name,
          success: true,
          result: `Sound effects ${enabled ? 'enabled' : 'muted'}.`,
        }
      }

      case 'delete_file': {
        if (ctx.moveToTrash && args.fileIdOrPath) {
          ctx.moveToTrash(String(args.fileIdOrPath))
          return {
            toolCallId: call.id,
            toolName: name,
            success: true,
            result: `Moved file "${args.fileIdOrPath}" to trash.`,
          }
        }
        return {
          toolCallId: call.id,
          toolName: name,
          success: false,
          result: null,
          error: 'VFS trash service not available.',
        }
      }

      case 'reset_settings': {
        ctx.updateSettings({
          activeThemeId: 'nova-dark',
          wallpaperId: 'nova-aurora',
          accentColor: 'blue',
        })
        return {
          toolCallId: call.id,
          toolName: name,
          success: true,
          result: 'Visual personalization settings restored to defaults.',
        }
      }

      default:
        return {
          toolCallId: call.id,
          toolName: name,
          success: false,
          result: null,
          error: `Tool "${name}" is not implemented.`,
        }
    }
  } catch (err: any) {
    return {
      toolCallId: call.id,
      toolName: name,
      success: false,
      result: null,
      error: err.message || 'Tool execution encountered an exception.',
    }
  }
}
