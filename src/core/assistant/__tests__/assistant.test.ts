import { describe, it, expect, beforeEach } from 'vitest'
import { parseOfflineIntent } from '../providers/offlineProvider'
import { TOOL_DEFINITIONS, getToolDefinition } from '../tools/toolRegistry'
import { assistantStore } from '../assistantStore'

// Provide localStorage mock for node test environment if needed
if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {}
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val.toString()
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
    },
    writable: true,
  })
}

describe('NOVA AI Assistant - Offline Intent Parser', () => {
  it('parses app launching commands accurately', () => {
    const res1 = parseOfflineIntent('open browser')
    expect(res1.toolCalls).toBeDefined()
    expect(res1.toolCalls?.[0].name).toBe('open_app')
    expect(res1.toolCalls?.[0].args.appId).toBe('browser')

    const res2 = parseOfflineIntent('launch system monitor')
    expect(res2.toolCalls?.[0].name).toBe('open_app')
    expect(res2.toolCalls?.[0].args.appId).toBe('systemmonitor')

    const res3 = parseOfflineIntent('start customization center')
    expect(res3.toolCalls?.[0].name).toBe('open_app')
    expect(res3.toolCalls?.[0].args.appId).toBe('customizationcenter')

    const res4 = parseOfflineIntent('open startup manager')
    expect(res4.toolCalls?.[0].name).toBe('open_app')
    expect(res4.toolCalls?.[0].args.appId).toBe('startupmanager')
  })

  it('parses game launch commands', () => {
    const res = parseOfflineIntent('play blockworld 3d')
    expect(res.toolCalls).toBeDefined()
    expect(res.toolCalls?.[0].name).toBe('launch_game')
    expect(res.toolCalls?.[0].args.gameNameOrId).toBe('game_blockworld')
  })

  it('parses theme and wallpaper switching commands', () => {
    const resTheme = parseOfflineIntent('switch theme to light')
    expect(resTheme.toolCalls?.[0].name).toBe('change_theme')
    expect(resTheme.toolCalls?.[0].args.themeId).toBe('nova-light')

    const resWp = parseOfflineIntent('change wallpaper to aurora')
    expect(resWp.toolCalls?.[0].name).toBe('change_wallpaper')
    expect(resWp.toolCalls?.[0].args.wallpaperId).toBe('nova-aurora')
  })

  it('parses system actions like lock and workspace change', () => {
    const resLock = parseOfflineIntent('lock screen now')
    expect(resLock.toolCalls?.[0].name).toBe('lock_system')

    const resWorkspace = parseOfflineIntent('switch to workspace 3')
    expect(resWorkspace.toolCalls?.[0].name).toBe('switch_workspace')
    expect(resWorkspace.toolCalls?.[0].args.workspaceId).toBe(3)
  })
})

describe('NOVA AI Assistant - Controlled Tool Registry', () => {
  it('registers all 17 controlled OS tools', () => {
    expect(TOOL_DEFINITIONS.length).toBe(17)
  })

  it('enforces isDestructive on dangerous operations requiring user confirmation', () => {
    const deleteTool = getToolDefinition('delete_file')
    expect(deleteTool).toBeDefined()
    expect(deleteTool?.isDestructive).toBe(true)

    const resetTool = getToolDefinition('reset_settings')
    expect(resetTool).toBeDefined()
    expect(resetTool?.isDestructive).toBe(true)

    const readTool = getToolDefinition('get_system_stats')
    expect(readTool).toBeDefined()
    expect(readTool?.isDestructive).toBeUndefined()
  })
})

describe('NOVA AI Assistant - Memory Operations', () => {
  it('stores and retrieves assistant memories', () => {
    const initialCount = assistantStore.getMemories().length
    assistantStore.addMemory('test_favorite_app', 'Terminal', 'preference')
    const updated = assistantStore.getMemories()
    expect(updated.length).toBe(initialCount + 1)
    const found = updated.find((m) => m.key === 'test_favorite_app')
    expect(found?.value).toBe('Terminal')

    if (found) {
      assistantStore.deleteMemory(found.id)
      expect(assistantStore.getMemories().find((m) => m.id === found.id)).toBeUndefined()
    }
  })
})
