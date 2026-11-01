import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Bot,
  User,
  Activity,
  Layers,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { useSettings } from '@/core/settings/SettingsContext'
import { useFileSystem } from '@/core/filesystem/FileSystemContext'
import { assistantStore } from '@/core/assistant/assistantStore'
import { processAssistantRequest } from '@/core/assistant/providers/providerManager'
import { executeOSTool, TOOL_DEFINITIONS } from '@/core/assistant/tools/toolRegistry'
import {
  speechRecognitionService,
  speechSynthesisService,
} from '@/core/assistant/voice/voiceServices'
import type {
  AssistantMessage,
  AssistantMode,
  ActionConfirmationRequest,
} from '@/core/assistant/types'

export const FloatingNovaAIAssistant: React.FC = () => {
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

  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<AssistantMode>('chat')
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [executionStep, setExecutionStep] = useState<string | null>(null)
  const [confirmationReq, setConfirmationReq] = useState<ActionConfirmationRequest | null>(null)

  const [assistantSettings, setAssistantSettings] = useState(() => assistantStore.getSettings())
  const [messages, setMessages] = useState<AssistantMessage[]>(() => assistantStore.getMessages())

  // Floating position for Draggable Orb
  const [orbPos, setOrbPos] = useState({ x: window.innerWidth - 90, y: window.innerHeight - 150 })
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, orbX: 0, orbY: 0 })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, executionStep])

  // Global Keyboard Shortcut: Alt + Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === 'Space') {
        e.preventDefault()
        soundService.playClick()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle Dragging of the Orb
  const handleOrbMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      orbX: orbPos.x,
      orbY: orbPos.y,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      setOrbPos({
        x: Math.max(20, Math.min(window.innerWidth - 80, dragStartRef.current.orbX + dx)),
        y: Math.max(50, Math.min(window.innerHeight - 80, dragStartRef.current.orbY + dy)),
      })
    }
    const handleMouseUp = () => {
      isDraggingRef.current = false
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
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
    setExecutionStep('Understanding instruction...')

    try {
      const response = await processAssistantRequest(text, assistantStore.getMessages(), assistantSettings)

      // If tool execution is requested
      if (response.toolCalls && response.toolCalls.length > 0) {
        for (const call of response.toolCalls) {
          const toolDef = TOOL_DEFINITIONS.find((t) => t.name === call.name)

          // Check if tool is destructive -> prompt confirmation!
          if (toolDef?.isDestructive) {
            setExecutionStep(`Awaiting confirmation for ${call.name}...`)
            await new Promise<void>((resolve) => {
              setConfirmationReq({
                id: call.id,
                toolName: call.name,
                args: call.args,
                description: `Tool "${call.name}" requires your authorization to proceed.`,
                isDestructive: true,
                onConfirm: async () => {
                  setConfirmationReq(null)
                  setExecutionStep(`Executing ${call.name}...`)
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
                  resolve()
                },
                onCancel: () => {
                  setConfirmationReq(null)
                  resolve()
                },
              })
            })
          } else {
            // Low-risk action -> execute immediately
            setExecutionStep(`Calling OS tool: ${call.name}...`)
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
            })
          }
        }
      }

      setExecutionStep(null)

      const assistantMsg: AssistantMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        toolCalls: response.toolCalls,
      }
      assistantStore.addMessage(assistantMsg)
      setMessages(assistantStore.getMessages())

      // Auto-speak if enabled
      if (assistantSettings.autoSpeak) {
        speechSynthesisService.speak(response.reply, assistantSettings.voiceRate, assistantSettings.voicePitch)
      }
    } catch (err: any) {
      setExecutionStep(null)
      assistantStore.addMessage({
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to process request.'}`,
        timestamp: Date.now(),
      })
      setMessages(assistantStore.getMessages())
    } finally {
      setIsProcessing(false)
    }
  }

  // Voice recognition toggle
  const toggleListening = () => {
    soundService.playClick()
    if (isListening) {
      speechRecognitionService.stop()
      setIsListening(false)
    } else {
      setIsListening(true)
      speechRecognitionService.start(
        (transcript, isFinal) => {
          setInput(transcript)
          if (isFinal) {
            setIsListening(false)
            handleSendMessage(transcript)
          }
        },
        (error) => {
          setIsListening(false)
        },
        () => {
          setIsListening(false)
        }
      )
    }
  }

  return (
    <>
      {/* 1. Floating Draggable Orb (Always visible on desktop) */}
      <div
        style={{ left: `${orbPos.x}px`, top: `${orbPos.y}px` }}
        onMouseDown={handleOrbMouseDown}
        onClick={(e) => {
          // If not dragged far, toggle open
          setIsOpen((prev) => !prev)
        }}
        className="fixed z-[8500] cursor-grab active:cursor-grabbing select-none group"
        title="NOVA AI (Alt + Space)"
      >
        <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-xl shadow-cyan-500/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
          <div className="w-full h-full rounded-full bg-black/80 backdrop-blur-xl flex items-center justify-center relative overflow-hidden">
            {/* Swirling glow particle */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 animate-spin duration-1000" />
            <Sparkles className="w-6 h-6 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
          </div>
        </div>
      </div>

      {/* 2. Floating AI Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-[8600] w-[420px] max-w-[90vw] h-[560px] max-h-[80vh] bg-[#141520]/95 border border-white/20 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Sparkles className="w-4 h-4 text-cyan-200" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {assistantSettings.name}
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                    {assistantSettings.activeProvider}
                  </span>
                </h3>
                <span className="text-[10px] text-neutral-400">Desktop AI Companion</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  soundService.playClick()
                  assistantStore.clearMessages()
                  setMessages(assistantStore.getMessages())
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Clear Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  soundService.playClick()
                  openApp('nova_ai')
                  setIsOpen(false)
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                title="Expand to Full Window"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isUser
                        ? 'bg-cyan-500 text-white'
                        : 'bg-purple-600/40 border border-purple-500/40 text-purple-300'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                      isUser
                        ? 'bg-cyan-500 text-white rounded-tr-none shadow-md shadow-cyan-500/10'
                        : 'bg-white/5 border border-white/10 text-neutral-200 rounded-tl-none backdrop-blur-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Tool Badges */}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                        {msg.toolCalls.map((t) => (
                          <span
                            key={t.id}
                            className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-white/10"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Stepper progress indicator */}
            {executionStep && (
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2 text-cyan-300 text-xs font-mono animate-pulse">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>{executionStep}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Action Confirmation Banner */}
          {confirmationReq && (
            <div className="p-3 bg-amber-500/20 border-t border-amber-500/40 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirmation Required: {confirmationReq.toolName}</span>
              </div>
              <p className="text-[11px] leading-tight">{confirmationReq.description}</p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={confirmationReq.onCancel}
                  className="px-2.5 py-1 rounded bg-white/10 text-white text-[11px] hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmationReq.onConfirm}
                  className="px-3 py-1 rounded bg-amber-500 text-black font-bold text-[11px] hover:bg-amber-400"
                >
                  Authorize
                </button>
              </div>
            </div>
          )}

          {/* Input Box Footer */}
          <div className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice recognition'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder={isListening ? 'Listening to speech...' : 'Ask NOVA AI or command the OS...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage()
              }}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isProcessing}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-white shadow-md shadow-cyan-500/20 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
