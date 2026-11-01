import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Play, RotateCcw, Sparkles, Terminal } from 'lucide-react'

const TEMPLATES: Record<string, string> = {
  arrays: `// Array Transformation & Metrics
const metrics = [42, 88, 12, 95, 63, 77];
const doubled = metrics.map(x => x * 2);
const total = metrics.reduce((acc, curr) => acc + curr, 0);

console.log("Doubled Array:", doubled);
console.log("Computed Total:", total);
console.log("Average:", (total / metrics.length).toFixed(2));`,
  async: `// Async Simulation
async function fetchSystemLoad() {
  console.log("Querying NOVA OS performance counters...");
  return { cpu: "14%", ram: "2.1 GB / 8.0 GB", fps: 60 };
}

fetchSystemLoad().then(stats => {
  console.log("Telemetry received:", JSON.stringify(stats));
});`,
  fibonacci: `// Recursive Fibonacci
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

const sequence = Array.from({ length: 10 }, (_, i) => fib(i));
console.log("First 10 Fibonacci numbers:", sequence.join(", "));`,
}

export const JsPlaygroundApp: React.FC<AppInstanceProps> = () => {
  const [code, setCode] = useState(TEMPLATES.arrays)
  const [logs, setLogs] = useState<string[]>([])

  const runCode = () => {
    soundService.play('buttonClick')
    const captured: string[] = []
    try {
      const mockConsole = {
        log: (...args: any[]) => captured.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
        error: (...args: any[]) => captured.push('[ERR] ' + args.join(' ')),
      }
      const fn = new Function('console', code)
      fn(mockConsole)
      setLogs(captured.length ? captured : ['Execution finished without console output.'])
    } catch (e: any) {
      setLogs([`Runtime Exception: ${e.message}`])
    }
  }

  const loadTemplate = (key: string) => {
    soundService.play('buttonClick')
    setCode(TEMPLATES[key])
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-mono text-xs select-none">
      {/* Top Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-400" />
          <span className="font-semibold text-white font-sans">JavaScript Scratchpad</span>
          <div className="flex items-center gap-1 ml-4 font-sans text-xs">
            <span className="text-neutral-500">Presets:</span>
            {Object.keys(TEMPLATES).map((k) => (
              <button
                key={k}
                onClick={() => loadTemplate(k)}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 capitalize"
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={runCode}
          className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold font-sans flex items-center gap-1.5 shadow"
        >
          <Play size={13} className="fill-black" /> Evaluate
        </button>
      </div>

      {/* Editor & Console Output */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-white/10 bg-[#1a1a24] overflow-hidden">
        {/* Editor */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="p-4 bg-transparent text-yellow-300 resize-none focus:outline-none leading-relaxed select-text font-mono"
          spellCheck={false}
        />

        {/* Output Console */}
        <div className="bg-black/30 flex flex-col h-full">
          <div className="px-3 py-1.5 bg-black/40 border-b border-white/10 text-[11px] font-sans text-neutral-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Terminal size={12} /> Console Output
            </span>
            <button onClick={() => setLogs([])} className="hover:text-white">
              Clear
            </button>
          </div>
          <div className="flex-1 p-3 overflow-auto space-y-1 text-emerald-400 select-text font-mono text-[11px]">
            {logs.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
