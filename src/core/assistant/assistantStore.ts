import type {
  AssistantMessage,
  AssistantSettings,
  MemoryItem,
  AIProviderType,
} from './types'

const SETTINGS_KEY = 'nova_ai_assistant_settings_v2'
const CONVERSATION_KEY = 'nova_ai_conversation_v2'
const MEMORY_KEY = 'nova_ai_memory_v2'

export const DEFAULT_ASSISTANT_SETTINGS: AssistantSettings = {
  name: 'NOVA AI',
  greeting: 'Hello Commander! I am your NOVA OS intelligent assistant. How can I help you navigate your desktop today?',
  personality: 'friendly',
  responseLength: 'balanced',
  activeProvider: 'offline',
  providers: {
    offline: {
      type: 'offline',
      endpoint: 'local-deterministic',
      model: 'nova-command-router-v1',
      streaming: false,
      available: true,
    },
    ollama: {
      type: 'ollama',
      endpoint: 'http://localhost:11434',
      model: 'llama3:latest',
      streaming: true,
      available: false,
    },
    gemini: {
      type: 'gemini',
      endpoint: 'https://generativelanguage.googleapis.com',
      apiKey: '',
      model: 'gemini-2.0-flash',
      streaming: true,
      available: false,
    },
    openai: {
      type: 'openai',
      endpoint: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o-mini',
      streaming: true,
      available: false,
    },
  },
  voiceInputEnabled: true,
  voiceOutputEnabled: false,
  autoSpeak: false,
  voiceRate: 1.0,
  voicePitch: 1.0,
  memoryEnabled: true,
  privacyShareContext: true,
  shortcutKey: 'Alt+Space',
}

class AssistantStore {
  private settings: AssistantSettings = DEFAULT_ASSISTANT_SETTINGS
  private messages: AssistantMessage[] = []
  private memories: MemoryItem[] = []

  constructor() {
    this.loadState()
  }

  private loadState() {
    if (typeof window === 'undefined') return
    try {
      const s = localStorage.getItem(SETTINGS_KEY)
      if (s) {
        this.settings = { ...DEFAULT_ASSISTANT_SETTINGS, ...JSON.parse(s) }
      }

      const m = localStorage.getItem(CONVERSATION_KEY)
      if (m) {
        this.messages = JSON.parse(m)
      } else {
        this.messages = [
          {
            id: 'msg-welcome',
            role: 'assistant',
            content: this.settings.greeting,
            timestamp: Date.now(),
          },
        ]
      }

      const mem = localStorage.getItem(MEMORY_KEY)
      if (mem) {
        this.memories = JSON.parse(mem)
      } else {
        this.memories = [
          {
            id: 'mem-1',
            key: 'preferred_theme',
            value: 'Liquid Glass',
            category: 'theme',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'mem-2',
            key: 'favorite_apps',
            value: 'Browser, Notes, Gaming Hub',
            category: 'favorite_app',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ]
      }
    } catch {
      this.settings = DEFAULT_ASSISTANT_SETTINGS
    }
  }

  public getSettings(): AssistantSettings {
    return this.settings
  }

  public updateSettings(partial: Partial<AssistantSettings>) {
    this.settings = { ...this.settings, ...partial }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings))
      } catch {
        // Ignore
      }
    }
  }

  public getMessages(): AssistantMessage[] {
    return this.messages
  }

  public addMessage(msg: AssistantMessage) {
    this.messages.push(msg)
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100)
    }
    this.saveMessages()
  }

  public updateMessage(id: string, partial: Partial<AssistantMessage>) {
    this.messages = this.messages.map((m) => (m.id === id ? { ...m, ...partial } : m))
    this.saveMessages()
  }

  public clearMessages() {
    this.messages = [
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: this.settings.greeting,
        timestamp: Date.now(),
      },
    ]
    this.saveMessages()
  }

  private saveMessages() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CONVERSATION_KEY, JSON.stringify(this.messages))
      } catch {
        // Ignore
      }
    }
  }

  public getMemories(): MemoryItem[] {
    return this.memories
  }

  public addMemory(key: string, value: string, category: MemoryItem['category'] = 'general') {
    const item: MemoryItem = {
      id: `mem-${Date.now()}`,
      key,
      value,
      category,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.memories.push(item)
    this.saveMemories()
  }

  public deleteMemory(id: string) {
    this.memories = this.memories.filter((m) => m.id !== id)
    this.saveMemories()
  }

  public clearMemories() {
    this.memories = []
    this.saveMemories()
  }

  private saveMemories() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(this.memories))
      } catch {
        // Ignore
      }
    }
  }
}

export const assistantStore = new AssistantStore()
