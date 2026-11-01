import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Layout, Copy, Check, Sliders } from 'lucide-react'

export const CssPlaygroundApp: React.FC<AppInstanceProps> = () => {
  const [displayMode, setDisplayMode] = useState<'flex' | 'grid'>('flex')
  const [flexDirection, setFlexDirection] = useState<'row' | 'column'>('row')
  const [justifyContent, setJustifyContent] = useState('center')
  const [alignItems, setAlignItems] = useState('center')
  const [gap, setGap] = useState(16)
  const [boxCount, setBoxCount] = useState(4)
  const [copied, setCopied] = useState(false)

  const generatedCss = `/* NOVA OS CSS Generator */
.container {
  display: ${displayMode};
  ${displayMode === 'flex' ? `flex-direction: ${flexDirection};\n  ` : `grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));\n  `}justify-content: ${justifyContent};
  align-items: ${alignItems};
  gap: ${gap}px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}`

  const handleCopy = () => {
    soundService.play('buttonClick')
    navigator.clipboard.writeText(generatedCss)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout size={16} className="text-pink-400" />
          <span className="font-semibold text-white">Flexbox & Grid CSS Lab</span>
        </div>

        <button
          onClick={handleCopy}
          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs transition-colors flex items-center gap-1 font-medium shadow"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied CSS' : 'Copy CSS'}
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Controls Sidebar */}
        <div className="w-full md:w-72 bg-black/30 border-r border-white/10 p-4 space-y-4 overflow-y-auto">
          {/* Display mode */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5 uppercase tracking-wider">
              Layout Engine
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDisplayMode('flex')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  displayMode === 'flex' ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-400'
                }`}
              >
                Flexbox
              </button>
              <button
                onClick={() => setDisplayMode('grid')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  displayMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-400'
                }`}
              >
                CSS Grid
              </button>
            </div>
          </div>

          {/* Direction */}
          {displayMode === 'flex' && (
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5 uppercase tracking-wider">
                Flex Direction
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFlexDirection('row')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${
                    flexDirection === 'row' ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-400'
                  }`}
                >
                  Row
                </button>
                <button
                  onClick={() => setFlexDirection('column')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${
                    flexDirection === 'column' ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-400'
                  }`}
                >
                  Column
                </button>
              </div>
            </div>
          )}

          {/* Justify Content */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5 uppercase tracking-wider">
              Justify Content
            </label>
            <select
              value={justifyContent}
              onChange={(e) => setJustifyContent(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none"
            >
              <option value="flex-start">flex-start</option>
              <option value="center">center</option>
              <option value="flex-end">flex-end</option>
              <option value="space-between">space-between</option>
              <option value="space-around">space-around</option>
            </select>
          </div>

          {/* Align Items */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5 uppercase tracking-wider">
              Align Items
            </label>
            <select
              value={alignItems}
              onChange={(e) => setAlignItems(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none"
            >
              <option value="flex-start">flex-start</option>
              <option value="center">center</option>
              <option value="flex-end">flex-end</option>
              <option value="stretch">stretch</option>
            </select>
          </div>

          {/* Gap Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">Gap</span>
              <span className="font-mono text-white">{gap}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={64}
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Box Count */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">Items Count</span>
              <span className="font-mono text-white">{boxCount}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={boxCount}
              onChange={(e) => setBoxCount(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        {/* Live Visual Playground & Code */}
        <div className="flex-1 flex flex-col bg-[#1a1a24] overflow-hidden">
          {/* Visual Container */}
          <div className="flex-1 p-6 flex items-center justify-center overflow-auto bg-black/40">
            <div
              style={{
                display: displayMode,
                flexDirection: displayMode === 'flex' ? flexDirection : undefined,
                gridTemplateColumns:
                  displayMode === 'grid'
                    ? 'repeat(auto-fit, minmax(80px, 1fr))'
                    : undefined,
                justifyContent,
                alignItems,
                gap: `${gap}px`,
              }}
              className="w-full h-full max-h-[380px] p-4 bg-white/5 border border-dashed border-white/20 rounded-2xl overflow-auto"
            >
              {Array.from({ length: boxCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg flex-shrink-0"
                >
                  #{i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Generated Code Preview */}
          <div className="h-36 border-t border-white/10 bg-black/60 p-3 overflow-auto">
            <pre className="font-mono text-[11px] text-pink-300 leading-snug select-text">
              {generatedCss}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
