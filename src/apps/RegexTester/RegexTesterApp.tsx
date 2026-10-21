import React, { useState, useMemo } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Check, HelpCircle, Sparkles } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

const CHEAT_SHEET = [
  { name: 'Email Address', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
  { name: 'URL / Web Link', pattern: 'https?:\\/\\/[\\w\\.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+', flags: 'g' },
  { name: 'IPv4 Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
  { name: 'HEX Color', pattern: '#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b', flags: 'g' },
]

export const RegexTesterApp: React.FC<AppInstanceProps> = () => {
  const [pattern, setPattern] = useState<string>('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
  const [flags, setFlags] = useState<string>('g')
  const [testText, setTestText] = useState<string>(
    'Contact our engineering team at dev@nova-os.org or security@nova-os.org for questions. Invalid: test@.com.'
  )
  const [replaceText, setReplaceText] = useState<string>('[REDACTED]')

  const { matches, error, replaced } = useMemo(() => {
    try {
      const reg = new RegExp(pattern, flags)
      const allMatches: { text: string; index: number }[] = []
      let match: RegExpExecArray | null

      if (flags.includes('g')) {
        while ((match = reg.exec(testText)) !== null) {
          allMatches.push({ text: match[0], index: match.index })
          if (reg.lastIndex === match.index) reg.lastIndex++
        }
      } else {
        match = reg.exec(testText)
        if (match) allMatches.push({ text: match[0], index: match.index })
      }

      const rep = testText.replace(reg, replaceText)
      return { matches: allMatches, error: null, replaced: rep }
    } catch (err: any) {
      return { matches: [], error: err.message, replaced: '' }
    }
  }, [pattern, flags, testText, replaceText])

  const loadCheat = (p: string, f: string) => {
    soundService.playClick()
    setPattern(p)
    setFlags(f)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-y-auto font-mono text-xs">
      {/* Top Bar */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between font-sans">
        <span className="font-semibold text-neutral-200">Regular Expression Studio</span>
        <div className="flex items-center space-x-1">
          {CHEAT_SHEET.map(c => (
            <button
              key={c.name}
              onClick={() => loadCheat(c.pattern, c.flags)}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300 text-[11px] transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full">
        {/* Pattern Input & Flags */}
        <div className="space-y-1.5 font-sans">
          <label className="text-xs text-neutral-400">Regular Expression</label>
          <div className="flex items-center bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 font-mono">
            <span className="text-neutral-500 mr-2 text-sm">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="pattern"
              className="flex-1 bg-transparent text-white focus:outline-none text-xs"
            />
            <span className="text-neutral-500 mx-2 text-sm">/</span>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="flags"
              className="w-12 bg-transparent text-amber-400 focus:outline-none text-xs font-bold"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-xs font-sans bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        {/* Test String */}
        <div className="space-y-1.5 font-sans">
          <div className="flex justify-between items-center">
            <label className="text-xs text-neutral-400">Test String</label>
            <span className="text-[11px] text-emerald-400 font-bold">{matches.length} matches found</span>
          </div>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={4}
            className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-neutral-200 text-xs font-mono focus:outline-none leading-relaxed"
          />
        </div>

        {/* Matches list */}
        <div className="space-y-1.5 font-sans">
          <label className="text-xs text-neutral-400">Match Results</label>
          <div className="bg-neutral-950 border border-white/10 rounded-xl p-3 min-h-[70px] space-y-1.5">
            {matches.length === 0 ? (
              <span className="text-neutral-500 text-xs">No matches in test string</span>
            ) : (
              matches.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-mono bg-white/5 px-2.5 py-1 rounded">
                  <span className="text-emerald-400 font-semibold">{m.text}</span>
                  <span className="text-[10px] text-neutral-400 font-sans">Index: {m.index}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Substitution */}
        <div className="space-y-1.5 font-sans">
          <label className="text-xs text-neutral-400">Substitution / Replace With</label>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-neutral-200 text-xs font-mono focus:outline-none"
          />
          <div className="text-xs font-mono bg-white/5 p-3 rounded-xl border border-white/5 text-neutral-300">
            {replaced}
          </div>
        </div>
      </div>
    </div>
  )
}
