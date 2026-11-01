// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { DEFAULT_WORKSPACES } from '../WindowContext'

describe('Virtual Workspaces Subsystem', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides default initial workspaces (Main, Work, Gaming, Entertainment)', () => {
    expect(DEFAULT_WORKSPACES.length).toBe(4)
    expect(DEFAULT_WORKSPACES[0].name).toBe('Main')
    expect(DEFAULT_WORKSPACES[1].name).toBe('Work')
    expect(DEFAULT_WORKSPACES[2].name).toBe('Gaming')
    expect(DEFAULT_WORKSPACES[3].name).toBe('Entertainment')
  })

  it('allows dynamic workspace array expansion and local persistence', () => {
    const customWorkspaces = [
      ...DEFAULT_WORKSPACES,
      { id: 5, name: 'Research Lab' },
    ]
    localStorage.setItem('nova_workspaces_v2', JSON.stringify(customWorkspaces))

    const stored = JSON.parse(localStorage.getItem('nova_workspaces_v2') || '[]')
    expect(stored.length).toBe(5)
    expect(stored[4].name).toBe('Research Lab')
  })
})
