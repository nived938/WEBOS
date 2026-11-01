import type {
  AssistantMessage,
  AssistantSettings,
  ToolCall,
} from '../types'
import { parseOfflineIntent } from './offlineProvider'
import { sendOllamaMessage } from './ollamaProvider'
import { sendGeminiMessage, sendOpenAIMessage } from './geminiProvider'

export interface ProcessedAssistantResponse {
  reply: string
  toolCalls?: ToolCall[]
  usedProvider: string
  error?: string
}

export async function processAssistantRequest(
  prompt: string,
  history: AssistantMessage[],
  settings: AssistantSettings
): Promise<ProcessedAssistantResponse> {
  const activeType = settings.activeProvider
  const config = settings.providers[activeType]

  // 1. First, check if the prompt is an imperative OS command (e.g. "open browser", "change theme", "launch blockworld", "lock screen")
  // For OS commands, the deterministic offline router is instantaneous, accurate, and executes tools directly!
  const offlineIntent = parseOfflineIntent(prompt)
  if (offlineIntent.toolCalls && offlineIntent.toolCalls.length > 0) {
    return {
      reply: offlineIntent.reply,
      toolCalls: offlineIntent.toolCalls,
      usedProvider: 'NOVA Command Router (Direct OS Tool)',
    }
  }

  // 2. If active provider is offline, return offline reply
  if (activeType === 'offline' || !config) {
    return {
      reply: offlineIntent.reply,
      usedProvider: 'Offline Assistant Mode',
    }
  }

  // 3. Connect to configured AI provider
  if (activeType === 'ollama') {
    const res = await sendOllamaMessage(history, config)
    if (res.error) {
      // Fallback gracefully
      return {
        reply: `${res.error}\n\nFalling back to Offline Assistant Mode:\n${offlineIntent.reply}`,
        usedProvider: 'Offline Fallback',
        error: res.error,
      }
    }
    return { reply: res.text, usedProvider: `Ollama (${config.model})` }
  }

  if (activeType === 'gemini') {
    const res = await sendGeminiMessage(history, config)
    if (res.error) {
      return {
        reply: `${res.error}\n\nFalling back to Offline Assistant Mode:\n${offlineIntent.reply}`,
        usedProvider: 'Offline Fallback',
        error: res.error,
      }
    }
    return { reply: res.text, usedProvider: `Gemini (${config.model})` }
  }

  if (activeType === 'openai') {
    const res = await sendOpenAIMessage(history, config)
    if (res.error) {
      return {
        reply: `${res.error}\n\nFalling back to Offline Assistant Mode:\n${offlineIntent.reply}`,
        usedProvider: 'Offline Fallback',
        error: res.error,
      }
    }
    return { reply: res.text, usedProvider: `OpenAI API (${config.model})` }
  }

  return {
    reply: offlineIntent.reply,
    usedProvider: 'Offline Assistant Mode',
  }
}
