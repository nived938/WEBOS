import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Play, FileCode, Check, Terminal, Copy, Plus, X } from 'lucide-react'

interface EditorTab {
  id: string
  name: string
  code: string
}

const DEFAULT_TABS: EditorTab[] = [
  {
    id: 'tab1',
    name: 'main.ts',
    code: `// NOVA OS Kernel Subsystem Test
function computeLiquidGlassRefraction(ior: number, thickness: number) {
  const dispersion = (ior - 1.0) * thickness * 0.42;
  console.log(\`Calculated glass optical dispersion: \${dispersion.toFixed(3)} nm\`);
  return dispersion;
}

const result = computeLiquidGlassRefraction(1.52, 12);
console.log("Kernel execution completed successfully.");`,
  },
  {
    id: 'tab2',
    name: 'types.ts',
    code: `export interface WindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
}`,
  },
]

export const CodeStudioApp: React.FC<AppInstanceProps> = () => {
  const [tabs, setTabs] = useState<EditorTab[]>(DEFAULT_TABS)
  const [activeTabId, setActiveTabId] = useState<string>('tab1')
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    'NOVA Code Studio v2.5 Sandbox Initialized.',
    'Ready for execution.',
  ])
  const [isRunning, setIsRunning] = useState(false)

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]

  const runCode = () => {
    soundService.play('buttonClick')
    setIsRunning(true)
    const logs: string[] = []

    try {
      const sandboxConsole = {
        log: (...args: any[]) => logs.push(args.map((a) => String(a)).join(' ')),
        error: (...args: any[]) => logs.push('[ERROR] ' + args.map((a) => String(a)).join(' ')),
        warn: (...args: any[]) => logs.push('[WARN] ' + args.map((a) => String(a)).join(' ')),
      }

      // Execute in isolated function context
      const runFn = new Function('console', activeTab.code)
      runFn(sandboxConsole)
      setConsoleOutput(logs.length ? logs : ['Code executed with no console output.'])
    } catch (err: any) {
      setConsoleOutput([`Runtime Error: ${err.message}`])
    } finally {
      setIsRunning(false)
    }
  }

  const handleAddTab = () => {
    soundService.play('buttonClick')
    const newId = 'tab_' + Date.now()
    const newTab: EditorTab = {
      id: newId,
      name: `script_${tabs.length + 1}.ts`,
      code: `console.log("Hello from script ${tabs.length + 1}!");`,
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newId)
  }

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabs.length === 1) return
    soundService.play('buttonClick')
    setTabs((prev) => prev.filter((t) => t.id !== id))
    if (activeTabId === id) {
      setActiveTabId(tabs.find((t) => t.id !== id)?.id || '')
    }
  }

  const lines = activeTab.code.split('\n')

  return (
    <div className="flex flex-col h-full bg-[#141419] text-neutral-200 font-mono text-xs select-none">
      {/* Top Controls & Tabs Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/50 px-2 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => {
                soundService.play('buttonClick')
                setActiveTabId(tab.id)
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg border-t border-x cursor-pointer transition-colors ${
                activeTabId === tab.id
                  ? 'bg-[#1e1e26] border-white/20 text-white font-medium'
                  : 'bg-black/30 border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileCode size={13} className="text-blue-400" />
              <span>{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="hover:text-red-400 p-0.5"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddTab}
            className="p-1 hover:bg-white/10 rounded text-neutral-400 ml-1"
            title="New File"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={runCode}
          disabled={isRunning}
          className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-sans flex items-center gap-1.5 font-medium transition-colors shadow mb-1.5"
        >
          <Play size={13} className="fill-white" /> Run Code
        </button>
      </div>

      {/* Editor & Console Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor Area with Line Numbers */}
        <div className="flex-1 flex bg-[#1a1a22] overflow-auto">
          {/* Line Numbers */}
          <div className="w-10 py-3 text-right pr-3 select-none text-neutral-600 font-mono text-xs border-r border-white/5">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            value={activeTab.code}
            onChange={(e) => {
              const code = e.target.value
              setTabs((prev) =>
                prev.map((t) => (t.id === activeTab.id ? { ...t, code } : t))
              )
            }}
            className="flex-1 p-3 bg-transparent text-emerald-400 focus:outline-none resize-none font-mono text-xs leading-5 select-text"
            spellCheck={false}
          />
        </div>

        {/* Console Output */}
        <div className="h-44 md:h-auto md:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-black/60 flex flex-col">
          <div className="px-3 py-2 border-b border-white/10 bg-white/5 flex items-center justify-between text-[11px] font-sans font-semibold text-neutral-300">
            <span className="flex items-center gap-1.5">
              <Terminal size={13} className="text-blue-400" /> Console Output
            </span>
            <button
              onClick={() => setConsoleOutput([])}
              className="text-[10px] text-neutral-500 hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-1 text-[11px] font-mono text-neutral-300">
            {consoleOutput.map((out, idx) => (
              <div
                key={idx}
                className={
                  out.startsWith('[ERROR]')
                    ? 'text-red-400'
                    : out.startsWith('[WARN]')
                    ? 'text-amber-400'
                    : 'text-neutral-300'
                }
              >
                &gt; {out}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
