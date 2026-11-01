import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useSettings } from '@/core/settings/SettingsContext'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { assistantStore } from '@/core/assistant/assistantStore'
import { processAssistantRequest } from '@/core/assistant/providers/providerManager'
import { executeOSTool, TOOL_DEFINITIONS } from '@/core/assistant/tools/toolRegistry'
import {
  Sparkles,
  Send,
  RotateCcw,
  Settings,
  Bot,
  User,
  Activity,
  CheckCircle2,
  Trash2,
  Plus,
  Key,
  Server,
  Layers,
  Shield,
  HelpCircle,
} from 'lucide-react'
import type {
  AssistantMessage,
  AssistantSettings,
  AIProviderType,
} from '@/core/assistant/types'

export const NovaAIApp: React.FC<AppInstanceProps> = () => {
  const {
    openApp,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    focusWindow,
    windows,
    runningAppIds,
    switchWorkspace,
    lockSystem,
  } = useWindowManager()

  const { settings, updateSettings } = useSettings()
  const fileSystem = useFileSystem()

  const [activeTab, setActiveTab] = useState<'chat' | 'settings' | 'memory' | 'tools'>('chat')
  const [messages, setMessages] = useState<AssistantMessage[]>(() => assistantStore.getMessages())
  const [assistantSettings, setAssistantSettings] = useState<AssistantSettings>(() => assistantStore.getSettings())
  const [memories, setMemories] = useState(() => assistantStore.getMemories())
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Memory add state
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')

  const handleSendMessage = async () => {
    const text = input.trim()
    if (!text || isProcessing) return

    soundService.playClick()
    setInput('')

    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    assistantStore.addMessage(userMsg)
    setMessages(assistantStore.getMessages())

    setIsProcessing(true)

    try {
      const response = await processAssistantRequest(text, assistantStore.getMessages(), assistantSettings)

      if (response.toolCalls && response.toolCalls.length > 0) {
        for (const call of response.toolCalls) {
          await executeOSTool(call, {
            openApp,
            closeWindow,
            minimizeWindow,
            restoreWindow,
            focusWindow,
            windows,
            runningAppIds,
            updateSettings,
            settings,
            switchWorkspace,
            lockSystem,
            moveToTrash: fileSystem.moveToTrash,
          })
        }
      }

      const assistantMsg: AssistantMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        toolCalls: response.toolCalls,
      }
      assistantStore.addMessage(assistantMsg)
      setMessages(assistantStore.getMessages())
    } catch (err: any) {
      assistantStore.addMessage({
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message}`,
        timestamp: Date.now(),
      })
      setMessages(assistantStore.getMessages())
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveProvider = (providerType: AIProviderType, partial: any) => {
    soundService.playClick()
    const updated = {
      ...assistantSettings,
      providers: {
        ...assistantSettings.providers,
        [providerType]: {
          ...assistantSettings.providers[providerType],
          ...partial,
        },
      },
    }
    assistantStore.updateSettings(updated)
    setAssistantSettings(updated)
  }

  const handleSelectActiveProvider = (providerType: AIProviderType) => {
    soundService.playClick()
    const updated = { ...assistantSettings, activeProvider: providerType }
    assistantStore.updateSettings(updated)
    setAssistantSettings(updated)
  }

  const handleAddMemory = () => {
    if (!newKey.trim() || !newVal.trim()) return
    soundService.playClick()
    assistantStore.addMemory(newKey.trim(), newVal.trim())
    setMemories(assistantStore.getMemories())
    setNewKey('')
    setNewVal('')
  }

  const handleDeleteMemory = (id: string) => {
    soundService.playClick()
    assistantStore.deleteMemory(id)
    setMemories(assistantStore.getMemories())
  }

  return (
    <div className="flex h-full bg-[#11121a]/95 text-neutral-200 font-sans select-none overflow-hidden backdrop-blur-2xl">
      {/* Sidebar Navigation */}
      <div className="w-56 bg-black/40 border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide">NOVA AI</h2>
              <span className="text-[10px] text-neutral-400 font-mono">Intelligent Assistant</span>
            </div>
          </div>

          <nav className="p-2 space-y-1">
            {[
              { id: 'chat', label: 'Conversation', icon: Bot },
              { id: 'settings', label: 'AI Providers & API', icon: Settings },
              { id: 'memory', label: 'Memory Controls', icon: Layers },
              { id: 'tools', label: 'Tool Registry', icon: Activity },
            ].map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundService.playClick()
                    setActiveTab(item.id as any)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-white/10 text-center font-mono text-[10px] text-neutral-500">
          Provider: <span className="text-cyan-400 uppercase">{assistantSettings.activeProvider}</span>
        </div>
      </div>

      {/* Main Tab View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Tab 1: Chat View */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user'
                return (
                  <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isUser
                          ? 'bg-cyan-500 text-white'
                          : 'bg-purple-600/40 border border-purple-500/40 text-purple-300'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`p-4 rounded-2xl max-w-[75%] text-xs leading-relaxed ${
                        isUser
                          ? 'bg-cyan-500 text-white rounded-tr-none shadow-md shadow-cyan-500/10'
                          : 'bg-white/5 border border-white/10 text-neutral-200 rounded-tl-none backdrop-blur-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                          {msg.toolCalls.map((t) => (
                            <span
                              key={t.id}
                              className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-white/10"
                            >
                              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                              {t.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex items-center gap-3">
              <input
                type="text"
                placeholder="Message NOVA AI or enter an OS command (e.g. 'open browser', 'theme cyberpunk')..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage()
                }}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />

              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isProcessing}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Settings & AI Providers */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">AI Provider Configuration</h3>
              <p className="text-xs text-neutral-400">
                Choose between local deterministic command routing, local Ollama LLMs, or cloud AI endpoints.
              </p>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Offline Router */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  assistantSettings.activeProvider === 'offline'
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">Offline Command Router (Built-in)</span>
                  {assistantSettings.activeProvider === 'offline' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-white">Active</span>
                  ) : (
                    <button
                      onClick={() => handleSelectActiveProvider('offline')}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    >
                      Activate
                    </button>
                  )}
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                  100% offline, private, zero-latency desktop automation engine. Directly executes all window, theme, and game tools without sending data over the network.
                </p>
              </div>

              {/* Ollama Local */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  assistantSettings.activeProvider === 'ollama'
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">Local Ollama REST API</span>
                  {assistantSettings.activeProvider === 'ollama' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-white">Active</span>
                  ) : (
                    <button
                      onClick={() => handleSelectActiveProvider('ollama')}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    >
                      Activate
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Endpoint:</label>
                    <input
                      type="text"
                      value={assistantSettings.providers.ollama.endpoint}
                      onChange={(e) => handleSaveProvider('ollama', { endpoint: e.target.value })}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Model Name:</label>
                    <input
                      type="text"
                      value={assistantSettings.providers.ollama.model}
                      onChange={(e) => handleSaveProvider('ollama', { model: e.target.value })}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Gemini API */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  assistantSettings.activeProvider === 'gemini'
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">Google Gemini API</span>
                  {assistantSettings.activeProvider === 'gemini' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-white">Active</span>
                  ) : (
                    <button
                      onClick={() => handleSelectActiveProvider('gemini')}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    >
                      Activate
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">API Key (Stored locally in client session):</label>
                    <input
                      type="password"
                      placeholder="Enter Gemini API key..."
                      value={assistantSettings.providers.gemini.apiKey || ''}
                      onChange={(e) => handleSaveProvider('gemini', { apiKey: e.target.value })}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* OpenAI Compatible */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  assistantSettings.activeProvider === 'openai'
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">OpenAI-Compatible Custom Endpoint</span>
                  {assistantSettings.activeProvider === 'openai' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-white">Active</span>
                  ) : (
                    <button
                      onClick={() => handleSelectActiveProvider('openai')}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    >
                      Activate
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Base URL:</label>
                    <input
                      type="text"
                      value={assistantSettings.providers.openai.endpoint}
                      onChange={(e) => handleSaveProvider('openai', { endpoint: e.target.value })}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">API Key:</label>
                    <input
                      type="password"
                      placeholder="Bearer token..."
                      value={assistantSettings.providers.openai.apiKey || ''}
                      onChange={(e) => handleSaveProvider('openai', { apiKey: e.target.value })}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Local Memory Controls */}
        {activeTab === 'memory' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Assistant Memory Controls</h3>
              <p className="text-xs text-neutral-400">
                Memories stored strictly in your local browser sandbox to personalize assistant suggestions.
              </p>
            </div>

            {/* Add Memory Row */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3">
              <input
                type="text"
                placeholder="Key (e.g. favorite_color)..."
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Value (e.g. Electric Cyan)..."
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                onClick={handleAddMemory}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Memories List */}
            <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
              {memories.map((mem) => (
                <div key={mem.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-white block">{mem.key}</span>
                    <span className="text-xs text-neutral-300 font-mono">{mem.value}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Tool Registry Inspector */}
        {activeTab === 'tools' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Controlled OS Tool Registry ({TOOL_DEFINITIONS.length} Tools)</h3>
              <p className="text-xs text-neutral-400">
                Predefined, strongly typed functions that NOVA AI can safely invoke to control the desktop.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TOOL_DEFINITIONS.map((tool) => (
                <div key={tool.name} className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-300">{tool.name}()</span>
                    {tool.isDestructive && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Requires Confirmation
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-tight">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
