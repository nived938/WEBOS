import type { AppId } from '@/types'

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool'

export interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
}

export interface ToolExecutionResult {
  toolCallId: string
  toolName: string
  success: boolean
  result: unknown
  error?: string
}

export interface AssistantMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  toolCalls?: ToolCall[]
  toolResults?: ToolExecutionResult[]
  executionStep?: string
  isStreaming?: boolean
}

export type AssistantMode = 'orb' | 'chat' | 'window' | 'voice' | 'hud'

export type AIProviderType = 'offline' | 'ollama' | 'gemini' | 'openai'

export type AssistantPersonality = 'professional' | 'friendly' | 'minimal' | 'technical' | 'casual'

export interface ProviderConfig {
  type: AIProviderType
  endpoint: string
  apiKey?: string
  model: string
  streaming: boolean
  available: boolean
}

export interface AssistantSettings {
  name: string
  greeting: string
  personality: AssistantPersonality
  responseLength: 'short' | 'balanced' | 'detailed'
  activeProvider: AIProviderType
  providers: Record<AIProviderType, ProviderConfig>
  voiceInputEnabled: boolean
  voiceOutputEnabled: boolean
  autoSpeak: boolean
  voiceRate: number
  voicePitch: number
  selectedVoiceName?: string
  memoryEnabled: boolean
  privacyShareContext: boolean
  shortcutKey: string
}

export interface MemoryItem {
  id: string
  key: string
  value: string
  category: 'preference' | 'favorite_app' | 'theme' | 'general'
  createdAt: number
  updatedAt: number
}

export interface ActionConfirmationRequest {
  id: string
  toolName: string
  args: Record<string, unknown>
  description: string
  isDestructive: boolean
  onConfirm: () => void
  onCancel: () => void
}
