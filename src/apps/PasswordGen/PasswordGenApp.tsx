import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { KeyRound, Copy, Check, RefreshCw, ShieldCheck } from 'lucide-react'

export const PasswordGenApp: React.FC<AppInstanceProps> = () => {
  const [length, setLength] = useState(18)
  const [useUpper, setUseUpper] = useState(true)
  const [useLower, setUseLower] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [password, setPassword] = useState('N0v@_0S-k3rn3l-2026!')
  const [copied, setCopied] = useState(false)

  const generate = () => {
    soundService.play('buttonClick')
    let chars = ''
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (useNumbers) chars += '0123456789'
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz'

    let result = ''
    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
    setPassword(result)
  }

  const handleCopy = () => {
    soundService.play('buttonClick')
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate entropy
  let poolSize = 0
  if (useUpper) poolSize += 26
  if (useLower) poolSize += 26
  if (useNumbers) poolSize += 10
  if (useSymbols) poolSize += 28
  const entropy = Math.round(length * Math.log2(poolSize || 2))

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden items-center justify-center p-6">
      <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <KeyRound size={18} className="text-amber-400" />
          <h2 className="text-sm font-bold text-white">Cryptographic Password Generator</h2>
        </div>

        {/* Display Box */}
        <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl flex items-center justify-between">
          <span className="font-mono text-sm text-emerald-400 select-text truncate pr-2">
            {password}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={generate}
              className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white"
              title="Regenerate"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs flex items-center gap-1 shadow"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Entropy indicator */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400" /> Entropy Strength:
          </span>
          <span className="font-mono text-emerald-400 font-bold">{entropy} bits (Excellent)</span>
        </div>

        {/* Sliders and Toggles */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">Length</span>
              <span className="font-mono text-white">{length} chars</span>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 rounded-lg">
              <input
                type="checkbox"
                checked={useUpper}
                onChange={(e) => setUseUpper(e.target.checked)}
                className="accent-blue-500"
              />
              Uppercase (A-Z)
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 rounded-lg">
              <input
                type="checkbox"
                checked={useLower}
                onChange={(e) => setUseLower(e.target.checked)}
                className="accent-blue-500"
              />
              Lowercase (a-z)
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 rounded-lg">
              <input
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => setUseNumbers(e.target.checked)}
                className="accent-blue-500"
              />
              Numbers (0-9)
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 rounded-lg">
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => setUseSymbols(e.target.checked)}
                className="accent-blue-500"
              />
              Symbols (!@#$)
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
