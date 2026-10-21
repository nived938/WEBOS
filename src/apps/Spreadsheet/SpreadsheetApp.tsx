import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Table, Download, Plus, Trash2, Calculator } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'

export const SpreadsheetApp: React.FC<AppInstanceProps> = () => {
  const { addNotification } = useNotifications()

  const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  const INITIAL_ROWS = 12

  const [data, setData] = useState<Record<string, string>>({
    A1: 'Item',
    B1: 'Quantity',
    C1: 'Unit Price ($)',
    D1: 'Total ($)',
    A2: 'MacBook Pro M3',
    B2: '2',
    C2: '1999',
    D2: '=B2*C2',
    A3: 'Studio Display 5K',
    B3: '1',
    C3: '1599',
    D3: '=B3*C3',
    A4: 'Magic Keyboard',
    B4: '2',
    C4: '199',
    D4: '=B4*C4',
    A5: 'Magic Mouse',
    B5: '2',
    C5: '99',
    D5: '=B5*C5',
    A7: 'Grand Total',
    D7: '=SUM(D2:D5)',
  })

  const [selectedCell, setSelectedCell] = useState<string>('A1')
  const [formulaInput, setFormulaInput] = useState<string>('Item')

  // Evaluate cell content or formula
  const evaluateCell = (cellId: string, visited = new Set<string>()): string => {
    const raw = data[cellId] || ''
    if (!raw.startsWith('=')) return raw

    if (visited.has(cellId)) return '#CIRCULAR!'
    visited.add(cellId)

    const expr = raw.slice(1).trim().toUpperCase()

    // 1. SUM(A1:A5)
    const sumMatch = expr.match(/^SUM\(([A-G])([0-9]+):([A-G])([0-9]+)\)$/)
    if (sumMatch) {
      const colStart = sumMatch[1]
      const rowStart = parseInt(sumMatch[2], 10)
      const colEnd = sumMatch[3]
      const rowEnd = parseInt(sumMatch[4], 10)

      let total = 0
      const startC = colStart.charCodeAt(0)
      const endC = colEnd.charCodeAt(0)

      for (let c = startC; c <= endC; c++) {
        const colChar = String.fromCharCode(c)
        for (let r = rowStart; r <= rowEnd; r++) {
          const val = parseFloat(evaluateCell(`${colChar}${r}`, new Set(visited)))
          if (!isNaN(val)) total += val
        }
      }
      return String(total)
    }

    // 2. Simple math operations like B2*C2 or B2+C2
    try {
      const parsedMath = expr.replace(/([A-G][0-9]+)/g, (match) => {
        const val = parseFloat(evaluateCell(match, new Set(visited)))
        return isNaN(val) ? '0' : String(val)
      })

      // Safe arithmetic evaluator
      if (/^[\d+\-*/().\s]+$/.test(parsedMath)) {
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${parsedMath})`)()
        return String(Math.round(result * 100) / 100)
      }
    } catch {
      return '#VALUE!'
    }

    return raw
  }

  const handleCellClick = (cellId: string) => {
    soundService.playClick()
    setSelectedCell(cellId)
    setFormulaInput(data[cellId] || '')
  }

  const handleFormulaChange = (val: string) => {
    setFormulaInput(val)
    setData((prev) => ({ ...prev, [selectedCell]: val }))
  }

  const handleExportCSV = () => {
    soundService.playClick()
    let csv = ''
    for (let r = 1; r <= INITIAL_ROWS; r++) {
      const rowVals = COLS.map((c) => `"${evaluateCell(`${c}${r}`).replace(/"/g, '""')}"`)
      csv += rowVals.join(',') + '\n'
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'spreadsheet.csv'
    a.click()
    URL.revokeObjectURL(url)
    addNotification('Exported CSV', 'Spreadsheet downloaded as CSV file', 'spreadsheet')
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-11 bg-neutral-900/80 border-b border-white/10 px-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <Table size={16} className="text-emerald-400" />
          <span className="text-xs font-bold text-white">NOVA Sheets</span>
        </div>

        {/* Formula Input Bar */}
        <div className="flex-1 max-w-md flex items-center bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs">
          <span className="text-[11px] font-mono text-emerald-400 font-bold mr-2">{selectedCell}:</span>
          <input
            type="text"
            value={formulaInput}
            onChange={(e) => handleFormulaChange(e.target.value)}
            placeholder="Value or formula (e.g. =SUM(D2:D5) or =B2*C2)..."
            className="flex-1 bg-transparent border-none outline-none text-white text-xs font-mono"
          />
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-xs font-medium text-white transition shadow-md shadow-emerald-600/20"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Grid Canvas */}
      <div className="flex-1 overflow-auto bg-neutral-900/40 select-text font-mono text-xs">
        <table className="w-full border-collapse border border-white/10">
          <thead>
            <tr className="bg-neutral-900/90 text-neutral-400 text-center select-none sticky top-0 z-10 border-b border-white/10">
              <th className="w-10 p-1.5 border-r border-white/10 text-[10px]">#</th>
              {COLS.map((col) => (
                <th key={col} className="p-1.5 min-w-[110px] border-r border-white/10 font-bold text-white text-[11px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: INITIAL_ROWS }).map((_, rIdx) => {
              const rowNum = rIdx + 1
              return (
                <tr key={rowNum} className="border-b border-white/5 hover:bg-white/2 transition">
                  {/* Row Number */}
                  <td className="bg-neutral-900/60 text-neutral-500 text-center font-sans text-[10px] select-none border-r border-white/10 p-1">
                    {rowNum}
                  </td>
                  {/* Cells */}
                  {COLS.map((col) => {
                    const cellId = `${col}${rowNum}`
                    const isSelected = selectedCell === cellId
                    const evaluated = evaluateCell(cellId)
                    const isHeaderRow = rowNum === 1
                    return (
                      <td
                        key={col}
                        onClick={() => handleCellClick(cellId)}
                        className={`p-2 border-r border-white/5 cursor-cell truncate transition ${
                          isSelected
                            ? 'bg-blue-600/25 ring-2 ring-blue-500 text-white z-1'
                            : isHeaderRow
                            ? 'font-bold text-white bg-white/5'
                            : 'text-neutral-300'
                        }`}
                      >
                        {evaluated}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-neutral-900/90 border-t border-white/10 px-3 flex items-center justify-between text-[11px] text-neutral-400 font-sans shrink-0">
        <div>Cell {selectedCell} Selected</div>
        <div className="text-neutral-500">Supports =SUM(A1:B5), +, -, *, / math expressions</div>
      </div>
    </div>
  )
}
