import type { AssistantMessage, ProviderConfig } from '../types'
import { parseOfflineIntent } from './offlineProvider'

export async function sendOllamaMessage(
  messages: AssistantMessage[],
  config: ProviderConfig,
  onChunk?: (text: string) => void
): Promise<{ text: string; error?: string }> {
  try {
    const formattedMessages = messages.map((m) => ({
      role: m.role === 'tool' ? 'user' : m.role,
      content: m.content,
    }))

    const res = await fetch(`${config.endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: formattedMessages,
        stream: false,
      }),
    })

    if (!res.ok) {
      throw new Error(`Ollama server returned HTTP ${res.status}: ${res.statusText}`)
    }

    const data = await res.json()
    const text = data.message?.content || ''
    if (onChunk) onChunk(text)
    return { text }
  } catch (err: any) {
    return {
      text: '',
      error: `Could not reach local Ollama at ${config.endpoint}. Make sure Ollama is running ('ollama serve') or use Offline Mode. (${err.message})`,
    }
  }
}
