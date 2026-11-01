import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Braces, Copy, Check, Minimize2, Maximize2, AlertCircle } from 'lucide-react'

const SAMPLE_JSON = `{
  "system": "NOVA OS",
  "version": "2.5.0",
  "kernel": {
    "compositor": "LiquidGlassOptics",
    "threads": 4,
    "memoryModel": "ClientVFS"
  },
  "workspaces": [
    { "id": 1, "name": "Main", "active": true },
    { "id": 2, "name": "Development", "active": false },
    { "id": 3, "name": "Gaming", "active": false }
  ],
  "features": {
    "pointerLock": true,
    "cryptoSalting": "PBKDF2",
    "themeSupport": ["cosmic", "cyberpunk", "nordic", "sunset"]
  }
}`

export const JsonExplorerApp: React.FC<AppInstanceProps> = () => {
  const [jsonText, setJsonText] = useState(SAMPLE_JSON)
  const [isValid, setIsValid] = useState(true)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handlePrettify = () => {
    soundService.play('buttonClick')
    try {
      const parsed = JSON.parse(jsonText)
      setJsonText(JSON.stringify(parsed, null, 2))
      setIsValid(true)
      setErrorMsg('')
    } catch (err: any) {
      setIsValid(false)
      setErrorMsg(err.message)
    }
  }

  const handleMinify = () => {
    soundService.play('buttonClick')
    try {
      const parsed = JSON.parse(jsonText)
      setJsonText(JSON.stringify(parsed))
      setIsValid(true)
      setErrorMsg('')
    } catch (err: any) {
      setIsValid(false)
      setErrorMsg(err.message)
    }
  }

  const handleCopy = () => {
    soundService.play('buttonClick')
    navigator.clipboard.writeText(jsonText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-mono text-xs select-none">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Braces size={16} className="text-blue-400" />
          <span className="font-semibold text-white font-sans">JSON Explorer & Validator</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrettify}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/15 text-neutral-200 transition-colors flex items-center gap-1"
          >
            <Maximize2 size={12} /> Format (2 spaces)
          </button>
          <button
            onClick={handleMinify}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/15 text-neutral-200 transition-colors flex items-center gap-1"
          >
            <Minimize2 size={12} /> Minify
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1 font-medium shadow"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div
        className={`px-4 py-1 text-[11px] font-sans flex items-center gap-1.5 ${
          isValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}
      >
        {isValid ? <Check size={12} /> : <AlertCircle size={12} />}
        <span>{isValid ? 'Valid JSON Syntax' : `Syntax Error: ${errorMsg}`}</span>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-4 bg-[#1a1a24] overflow-auto">
        <textarea
          value={jsonText}
          onChange={(e) => {
            const val = e.target.value
            setJsonText(val)
            try {
              JSON.parse(val)
              setIsValid(true)
              setErrorMsg('')
            } catch (err: any) {
              setIsValid(false)
              setErrorMsg(err.message)
            }
          }}
          className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-xs text-sky-300 leading-relaxed select-text"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
