import React, { useState, useEffect, useCallback } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { History, Delete } from 'lucide-react'

export const CalculatorApp: React.FC<AppInstanceProps> = ({ isFocused }) => {
  const [display, setDisplay] = useState('0')
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isScientific, setIsScientific] = useState(false)

  const inputDigit = useCallback((digit: string) => {
    soundService.playClick()
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }, [display, waitingForOperand])

  const inputDot = useCallback(() => {
    soundService.playClick()
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }, [display, waitingForOperand])

  const clearAll = useCallback(() => {
    soundService.playClick()
    setDisplay('0')
    setPrevValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }, [])

  const deleteLast = useCallback(() => {
    soundService.playClick()
    if (waitingForOperand) return
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0')
    } else {
      setDisplay(display.slice(0, -1))
    }
  }, [display, waitingForOperand])

  const toggleSign = useCallback(() => {
    soundService.playClick()
    const val = parseFloat(display)
    if (!isNaN(val)) {
      setDisplay(String(-val))
    }
  }, [display])

  const inputPercent = useCallback(() => {
    soundService.playClick()
    const val = parseFloat(display)
    if (!isNaN(val)) {
      setDisplay(String(val / 100))
    }
  }, [display])

  const performOperation = useCallback((nextOp: string) => {
    soundService.playClick()
    const inputValue = parseFloat(display)

    if (prevValue === null) {
      setPrevValue(inputValue)
    } else if (operation) {
      const currentValue = prevValue || 0
      let result = currentValue

      switch (operation) {
        case '+':
          result = currentValue + inputValue
          break
        case '−':
        case '-':
          result = currentValue - inputValue
          break
        case '×':
        case '*':
          result = currentValue * inputValue
          break
        case '÷':
        case '/':
          result = inputValue !== 0 ? currentValue / inputValue : 0
          break
        case '^':
          result = Math.pow(currentValue, inputValue)
          break
        default:
          break
      }

      const formattedResult = Number(result.toFixed(8)).toString()
      setHistory((prev) => [`${currentValue} ${operation} ${inputValue} = ${formattedResult}`, ...prev.slice(0, 19)])
      setPrevValue(result)
      setDisplay(formattedResult)
    }

    setWaitingForOperand(true)
    setOperation(nextOp === '=' ? null : nextOp)
  }, [display, prevValue, operation])

  // Scientific unary operations
  const performScientific = useCallback((fn: string) => {
    soundService.playClick()
    const val = parseFloat(display)
    if (isNaN(val)) return
    let res = val
    switch (fn) {
      case 'sin':
        res = Math.sin((val * Math.PI) / 180)
        break
      case 'cos':
        res = Math.cos((val * Math.PI) / 180)
        break
      case 'tan':
        res = Math.tan((val * Math.PI) / 180)
        break
      case 'sqrt':
        res = val >= 0 ? Math.sqrt(val) : 0
        break
      case 'sq':
        res = val * val
        break
      case 'log':
        res = val > 0 ? Math.log10(val) : 0
        break
      case 'ln':
        res = val > 0 ? Math.log(val) : 0
        break
      case 'pi':
        res = Math.PI
        break
      case 'e':
        res = Math.E
        break
    }
    const strRes = Number(res.toFixed(8)).toString()
    setHistory((prev) => [`${fn}(${val}) = ${strRes}`, ...prev.slice(0, 19)])
    setDisplay(strRes)
    setWaitingForOperand(true)
  }, [display])

  // Keyboard support when focused
  useEffect(() => {
    if (!isFocused) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key)
      } else if (e.key === '.') {
        inputDot()
      } else if (e.key === '+' || e.key === '-') {
        performOperation(e.key === '-' ? '−' : '+')
      } else if (e.key === '*') {
        performOperation('×')
      } else if (e.key === '/') {
        e.preventDefault()
        performOperation('÷')
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault()
        performOperation('=')
      } else if (e.key === 'Backspace') {
        deleteLast()
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        clearAll()
      } else if (e.key === '%') {
        inputPercent()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocused, inputDigit, inputDot, performOperation, deleteLast, clearAll, inputPercent])

  return (
    <div className="flex flex-col h-full bg-neutral-900/90 text-white select-none backdrop-blur-xl relative">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-xs text-neutral-400">
        <button
          onClick={() => setIsScientific((s) => !s)}
          className={`px-2 py-0.5 rounded transition ${
            isScientific ? 'bg-orange-500 text-white font-medium' : 'hover:bg-white/10 text-neutral-300'
          }`}
        >
          {isScientific ? 'Basic' : 'Scientific'}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory((h) => !h)}
            className={`p-1 rounded transition ${showHistory ? 'text-orange-400 bg-white/10' : 'hover:text-white'}`}
            title="History"
          >
            <History size={16} />
          </button>
        </div>
      </div>

      {/* Main Calculation View */}
      <div className="flex-1 flex flex-col justify-end p-4">
        {/* Previous equation indicator */}
        <div className="text-right text-xs text-neutral-400 font-mono h-5 overflow-hidden">
          {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
        </div>

        {/* Current display value */}
        <div className="text-right font-light tracking-tight text-4xl sm:text-5xl font-mono truncate text-white my-2">
          {display}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="p-3 pt-0 grid gap-2">
        {isScientific && (
          <div className="grid grid-cols-4 gap-2 pb-1 border-b border-white/10 text-xs font-mono">
            <button onClick={() => performScientific('sin')} className="h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300">sin</button>
            <button onClick={() => performScientific('cos')} className="h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300">cos</button>
            <button onClick={() => performScientific('tan')} className="h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300">tan</button>
            <button onClick={() => performOperation('^')} className="h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300">x^y</button>
            <button onClick={() => performScientific('sqrt')} className="h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300">√x</button>
            <button onClick={() => performScientific('sq')} className="h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300">x²</button>
            <button onClick={() => performScientific('pi')} className="h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300">π</button>
            <button onClick={() => performScientific('e')} className="h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300">e</button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 text-lg font-medium">
          {/* Row 1 */}
          <button onClick={clearAll} className="h-12 rounded-xl bg-neutral-700/80 hover:bg-neutral-600/80 text-neutral-200 active:scale-95 transition">
            {display !== '0' ? 'C' : 'AC'}
          </button>
          <button onClick={toggleSign} className="h-12 rounded-xl bg-neutral-700/80 hover:bg-neutral-600/80 text-neutral-200 active:scale-95 transition">
            ±
          </button>
          <button onClick={inputPercent} className="h-12 rounded-xl bg-neutral-700/80 hover:bg-neutral-600/80 text-neutral-200 active:scale-95 transition">
            %
          </button>
          <button onClick={() => performOperation('÷')} className="h-12 rounded-xl bg-orange-500 hover:bg-orange-400 text-white active:scale-95 transition text-xl font-bold">
            ÷
          </button>

          {/* Row 2 */}
          <button onClick={() => inputDigit('7')} className="h-12 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white active:scale-95 transition">
            7
          </button>
          <button onClick={() => inputDigit('8')} className="h-12 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white active:scale-95 transition">
            8
          </button>
          <button onClick={() => inputDigit('9')} className="h-12 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white active:scale-95 transition">
            9
          </button>
          <button onClick={() => performOperation('×')} className="h-12 rounded-xl bg-orange-500 hover:bg-orange-400 text-white active:scale-95 transition text-xl font-bold">
            ×
          </button>

          {/* Row 3 */}
          <button onClick={() => inputDigit('4')} className="h-12 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white active:scale-95 transition">
            4
          </button>
          <button onClick={() => inputDigit('5')} className="h-12 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white active:scale-95 transition">
            5
          </button>
          <button onClick={() => inputDigit('6')} className="h-12 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white active:scale-95 transition">
            6
          </button>
          <button onClick={() => performOperation('−')} className="h-12 rounded-xl bg-orange-500 hover:bg-orange-400 text-white active:scale-95 transition text-xl font-bold">
            −
          </button>

          {/* Row 4 */}
          <button onClick={() => inputDigit('1')} className="h-12 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white active:scale-95 transition">
            1
          </button>
          <button onClick={() => inputDigit('2')} className="h-12 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white active:scale-95 transition">
            2
          </button>
          <button onClick={() => inputDigit('3')} className="h-12 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white active:scale-95 transition">
            3
          </button>
          <button onClick={() => performOperation('+')} className="h-12 rounded-xl bg-orange-500 hover:bg-orange-400 text-white active:scale-95 transition text-xl font-bold">
            +
          </button>

          {/* Row 5 */}
          <button onClick={() => inputDigit('0')} className="h-12 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white active:scale-95 transition">
            0
          </button>
          <button onClick={inputDot} className="h-12 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 text-white active:scale-95 transition font-bold">
            .
          </button>
          <button onClick={deleteLast} className="h-12 flex items-center justify-center rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 text-neutral-300 active:scale-95 transition" title="Backspace">
            <Delete size={20} />
          </button>
          <button onClick={() => performOperation('=')} className="h-12 rounded-xl bg-orange-500 hover:bg-orange-400 text-white active:scale-95 transition text-xl font-bold">
            =
          </button>
        </div>
      </div>

      {/* History Slide-over Drawer */}
      {showHistory && (
        <div className="absolute inset-0 bg-neutral-900/95 backdrop-blur-2xl z-20 flex flex-col p-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
            <span className="font-semibold text-sm">Calculation History</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHistory([])}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-white/5"
              >
                Clear
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-sm">
            {history.length === 0 ? (
              <div className="text-neutral-500 text-center py-8 text-xs">No recent calculations</div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const resultPart = item.split('=')[1]?.trim()
                    if (resultPart) setDisplay(resultPart)
                    setShowHistory(false)
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer text-right text-neutral-300 hover:text-white transition"
                >
                  {item}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
