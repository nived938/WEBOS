import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Check, Copy, AlertCircle, Minimize2, Maximize2, Trash2, Code } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

const DEFAULT_SAMPLE_JSON = `{
  "system": "NOVA OS",
  "version": "2.0.4",
  "kernel": {
    "type": "browser-microkernel",
    "webgl": true,
    "audioEngine": "WebAudio",
    "features": [
      "Dynamic Window Management",
      "Persistent VFS",
      "Multi-tab Web Browser",
      "3D Arcade Gaming"
    ]
  },
  "metrics": {
    "targetFps": 60,
    "memoryAllocatedMb": 64.5,
    "activeProcesses": 14
  }
}`

export const JsonFormatterApp: React.FC<AppInstanceProps> = () => {
  const [input, setInput] = useState<string>(DEFAULT_SAMPLE_JSON)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [indentSize, setIndentSize] = useState<number>(2)

  const handleFormat = () => {
    soundService.playClick()
    try {
      const parsed = JSON.parse(input)
      setInput(JSON.stringify(parsed, null, indentSize))
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Invalid JSON')
    }
  }

  const handleMinify = () => {
    soundService.playClick()
    try {
      const parsed = JSON.parse(input)
      setInput(JSON.stringify(parsed))
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Invalid JSON')
    }
  }

  const handleCopy = () => {
    soundService.playNotification()
    navigator.clipboard.writeText(input)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    soundService.playClick()
    setInput('')
    setError(null)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden font-mono">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between p-2.5 bg-neutral-800/80 border-b border-white/10 text-xs">
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-neutral-200 font-sans">JSON Formatter & Validator</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="bg-neutral-700/80 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
            <option value={1}>Tab</option>
          </select>

          <button
            onClick={handleFormat}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-sans font-medium text-xs shadow-sm"
          >
            Prettify
          </button>

          <button
            onClick={handleMinify}
            className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-200 font-sans font-medium text-xs"
          >
            Minify
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300 hover:text-white"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 bg-neutral-700 hover:bg-red-500/30 rounded text-neutral-400 hover:text-red-400"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error alert if invalid */}
      {error && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-3 py-2 flex items-center space-x-2 text-red-300 text-xs font-sans">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 relative bg-neutral-950 p-3">
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            if (error) setError(null)
          }}
          placeholder="Paste or write raw JSON here..."
          spellCheck={false}
          className="w-full h-full bg-transparent text-neutral-200 text-xs leading-relaxed resize-none focus:outline-none font-mono selection:bg-emerald-500/30"
        />
      </div>

      {/* Status Bar */}
      <div className="px-3 py-1.5 bg-neutral-950 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400 font-sans">
        <span>Chars: {input.length} | Lines: {input.split('\n').length}</span>
        <span className={error ? 'text-red-400 font-medium' : 'text-emerald-400 font-medium'}>
          {error ? 'Invalid JSON Syntax' : 'Valid JSON'}
        </span>
      </div>
    </div>
  )
}
