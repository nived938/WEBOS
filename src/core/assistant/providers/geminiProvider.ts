import type { AssistantMessage, ProviderConfig } from '../types'

export async function sendGeminiMessage(
  messages: AssistantMessage[],
  config: ProviderConfig,
  onChunk?: (text: string) => void
): Promise<{ text: string; error?: string }> {
  try {
    if (!config.apiKey) {
      return {
        text: '',
        error: 'Gemini API key is not configured. Please enter your API key in Assistant Settings or switch to Offline Assistant Mode.',
      }
    }

    const contents = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const url = `${config.endpoint}/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    })

    if (!res.ok) {
      const errJson = await res.json().catch(() => null)
      throw new Error(errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`)
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    if (onChunk) onChunk(text)
    return { text }
  } catch (err: any) {
    return {
      text: '',
      error: `Gemini API request failed: ${err.message}`,
    }
  }
}

export async function sendOpenAIMessage(
  messages: AssistantMessage[],
  config: ProviderConfig,
  onChunk?: (text: string) => void
): Promise<{ text: string; error?: string }> {
  try {
    if (!config.apiKey && !config.endpoint.includes('localhost')) {
      return {
        text: '',
        error: 'API key is required for external OpenAI-compatible providers.',
      }
    }

    const formattedMessages = messages.map((m) => ({
      role: m.role === 'tool' ? 'user' : m.role,
      content: m.content,
    }))

    const res = await fetch(`${config.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: config.model,
        messages: formattedMessages,
      }),
    })

    if (!res.ok) {
      const errJson = await res.json().catch(() => null)
      throw new Error(errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`)
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    if (onChunk) onChunk(text)
    return { text }
  } catch (err: any) {
    return {
      text: '',
      error: `OpenAI provider request failed: ${err.message}`,
    }
  }
}
