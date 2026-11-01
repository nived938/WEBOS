import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Code2, Play, CheckCircle, XCircle, Award } from 'lucide-react'

interface Challenge {
  id: number
  title: string
  description: string
  starterCode: string
  testFn: (userFn: any) => boolean
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'Challenge 1: Sum of Even Numbers',
    description: 'Write a function sumEvens(arr) that returns the sum of all even numbers in an array.',
    starterCode: `function sumEvens(arr) {\n  // Your implementation here\n  return arr.filter(n => n % 2 === 0).reduce((a, b) => a + b, 0);\n}`,
    testFn: (fn: any) => fn([1, 2, 3, 4, 5, 6]) === 12 && fn([1, 3, 5]) === 0,
  },
  {
    id: 2,
    title: 'Challenge 2: Reverse a String',
    description: 'Write a function reverseString(str) that returns the reversed string.',
    starterCode: `function reverseString(str) {\n  return str.split('').reverse().join('');\n}`,
    testFn: (fn: any) => fn('hello') === 'olleh' && fn('nova') === 'avon',
  },
]

export const CodingLessonsApp: React.FC<AppInstanceProps> = () => {
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0)
  const [code, setCode] = useState(CHALLENGES[0].starterCode)
  const [testResult, setTestResult] = useState<{ passed: boolean; msg: string } | null>(null)

  const challenge = CHALLENGES[activeChallengeIdx]

  const runTest = () => {
    soundService.play('buttonClick')
    try {
      // Evaluate function
      const evaluatedFn = new Function(`return (${code})`)()
      const passed = challenge.testFn(evaluatedFn)
      if (passed) {
        soundService.play('notification')
        setTestResult({ passed: true, msg: 'All test assertions passed successfully!' })
      } else {
        setTestResult({ passed: false, msg: 'Test failed: Returned output did not match expected value.' })
      }
    } catch (err: any) {
      setTestResult({ passed: false, msg: `Syntax / Runtime Error: ${err.message}` })
    }
  }

  const switchChallenge = (idx: number) => {
    soundService.play('buttonClick')
    setActiveChallengeIdx(idx)
    setCode(CHALLENGES[idx].starterCode)
    setTestResult(null)
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-emerald-400" />
          <span className="font-semibold text-white text-xs">Interactive Coding Academy</span>
        </div>

        <div className="flex items-center gap-1.5">
          {CHALLENGES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => switchChallenge(i)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeChallengeIdx === i
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10'
              }`}
            >
              Task #{c.id}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Challenge Instructions */}
        <div className="w-full md:w-80 bg-black/30 border-r border-white/10 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-2">{challenge.title}</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">{challenge.description}</p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 mt-4 ${
                testResult.passed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {testResult.passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span>{testResult.msg}</span>
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col bg-[#191922] overflow-hidden">
          <div className="px-3 py-1.5 bg-black/40 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400 font-mono">Solution Workspace</span>
            <button
              onClick={runTest}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow"
            >
              <Play size={12} className="fill-white" /> Run Tests
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 bg-transparent text-emerald-300 font-mono text-xs resize-none focus:outline-none leading-relaxed select-text"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
