import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { FileDiff, ArrowRightLeft, Check } from 'lucide-react'

const LEFT_SAMPLE = `// Version 1.0 Compositor
export function initWindow(id: string) {
  const win = document.createElement('div');
  win.className = 'window-frame';
  win.style.width = '640px';
  win.style.height = '480px';
  document.body.appendChild(win);
  return win;
}`

const RIGHT_SAMPLE = `// Version 2.5 Optical Compositor
export function initWindow(id: string) {
  const win = document.createElement('div');
  win.className = 'window-frame liquid-glass-refraction';
  win.style.width = '780px';
  win.style.height = '520px';
  win.setAttribute('data-workspace', 'main');
  document.body.appendChild(win);
  return win;
}`

export const FileDiffApp: React.FC<AppInstanceProps> = () => {
  const [leftText, setLeftText] = useState(LEFT_SAMPLE)
  const [rightText, setRightText] = useState(RIGHT_SAMPLE)

  const leftLines = leftText.split('\n')
  const rightLines = rightText.split('\n')

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileDiff size={16} className="text-cyan-400" />
          <span className="font-semibold text-white text-xs">Side-by-Side Diff Inspector</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded">- Original</span>
          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">+ Modified</span>
        </div>
      </div>

      {/* Side-by-side Editors */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-white/10 bg-[#191922] overflow-hidden">
        {/* Left Column */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="px-3 py-1.5 bg-black/30 border-b border-white/10 text-[11px] text-neutral-400 font-mono">
            Original (v1.0)
          </div>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            className="flex-1 p-3 bg-transparent text-neutral-300 font-mono text-xs resize-none focus:outline-none leading-relaxed select-text"
            spellCheck={false}
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col h-full overflow-hidden bg-black/10">
          <div className="px-3 py-1.5 bg-black/40 border-b border-white/10 text-[11px] text-emerald-400 font-mono">
            Modified (v2.5)
          </div>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            className="flex-1 p-3 bg-transparent text-emerald-300 font-mono text-xs resize-none focus:outline-none leading-relaxed select-text"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
