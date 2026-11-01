import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Database, Play, Download, Table, Check, AlertCircle } from 'lucide-react'

interface TableData {
  name: string
  columns: string[]
  rows: Record<string, any>[]
}

const SAMPLE_DATABASE: Record<string, TableData> = {
  users: {
    name: 'users',
    columns: ['id', 'username', 'role', 'status', 'created_at'],
    rows: [
      { id: 1, username: 'nived938', role: 'root_admin', status: 'active', created_at: '2026-01-10' },
      { id: 2, username: 'guest', role: 'restricted', status: 'active', created_at: '2026-02-14' },
      { id: 3, username: 'tester', role: 'developer', status: 'inactive', created_at: '2026-03-01' },
    ],
  },
  packages: {
    name: 'packages',
    columns: ['id', 'name', 'category', 'size_kb', 'installed'],
    rows: [
      { id: 'pkg-finder', name: 'Finder', category: 'System Tools', size_kb: 1433, installed: 1 },
      { id: 'pkg-terminal', name: 'Terminal', category: 'Development', size_kb: 950, installed: 1 },
      { id: 'pkg-code', name: 'Code Studio', category: 'Development', size_kb: 2450, installed: 1 },
      { id: 'pkg-pdf', name: 'PDF Reader', category: 'Productivity', size_kb: 1820, installed: 1 },
    ],
  },
  system_logs: {
    name: 'system_logs',
    columns: ['log_id', 'level', 'source', 'message', 'timestamp'],
    rows: [
      { log_id: 101, level: 'INFO', source: 'Compositor', message: 'Liquid glass shaders loaded', timestamp: '14:20:01' },
      { log_id: 102, level: 'INFO', source: 'WindowManager', message: 'Workspace 1 initialized', timestamp: '14:20:02' },
      { log_id: 103, level: 'WARN', source: 'Network', message: 'Simulated mesh latency: 12ms', timestamp: '14:20:15' },
    ],
  },
}

export const SqlBrowserApp: React.FC<AppInstanceProps> = () => {
  const [selectedTable, setSelectedTable] = useState<string>('users')
  const [query, setQuery] = useState<string>('SELECT * FROM users;')
  const [results, setResults] = useState<any[]>(SAMPLE_DATABASE['users'].rows)
  const [columns, setColumns] = useState<string[]>(SAMPLE_DATABASE['users'].columns)
  const [queryStatus, setQueryStatus] = useState<{ success: boolean; msg: string }>({
    success: true,
    msg: 'Query returned 3 rows in 2.4ms',
  })

  const runQuery = () => {
    soundService.play('buttonClick')
    const trimmed = query.trim()
    const match = trimmed.match(/from\s+([a-zA-Z_]+)/i)
    if (!match) {
      setQueryStatus({ success: false, msg: 'Syntax Error: Could not determine target table name.' })
      return
    }

    const tableName = match[1].toLowerCase()
    const table = SAMPLE_DATABASE[tableName]
    if (!table) {
      setQueryStatus({ success: false, msg: `Table '${tableName}' does not exist.` })
      return
    }

    setColumns(table.columns)
    setResults(table.rows)
    setQueryStatus({
      success: true,
      msg: `Query executed successfully: ${table.rows.length} rows returned.`,
    })
  }

  const exportCsv = () => {
    soundService.play('buttonClick')
    if (!results.length) return
    const header = columns.join(',')
    const rows = results.map((r) => columns.map((c) => JSON.stringify(r[c] ?? '')).join(','))
    const csvContent = [header, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${selectedTable}_export.csv`
    link.click()
  }

  return (
    <div className="flex h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Tables Sidebar */}
      <div className="w-52 bg-black/40 border-r border-white/10 p-3 flex flex-col gap-4">
        <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <Database size={14} className="text-blue-400" /> Schemas & Tables
        </div>

        <div className="space-y-1">
          {Object.keys(SAMPLE_DATABASE).map((tName) => (
            <button
              key={tName}
              onClick={() => {
                soundService.play('buttonClick')
                setSelectedTable(tName)
                setQuery(`SELECT * FROM ${tName};`)
                setColumns(SAMPLE_DATABASE[tName].columns)
                setResults(SAMPLE_DATABASE[tName].rows)
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                selectedTable === tName
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'hover:bg-white/10 text-neutral-400'
              }`}
            >
              <Table size={13} /> {tName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Query & Results Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#1a1a22]">
        {/* SQL Query Editor */}
        <div className="p-3 border-b border-white/10 bg-black/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              SQL Query Console
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={exportCsv}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-xs text-neutral-300 flex items-center gap-1"
              >
                <Download size={13} /> Export CSV
              </button>
              <button
                onClick={runQuery}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white flex items-center gap-1.5 shadow"
              >
                <Play size={13} className="fill-white" /> Run SQL
              </button>
            </div>
          </div>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-20 bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-blue-500 resize-none select-text"
          />

          <div
            className={`text-[11px] flex items-center gap-1.5 ${
              queryStatus.success ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {queryStatus.success ? <Check size={12} /> : <AlertCircle size={12} />}
            <span>{queryStatus.msg}</span>
          </div>
        </div>

        {/* Results Data Grid */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full border-collapse text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-neutral-300">
                {columns.map((c) => (
                  <th key={c} className="p-2.5 font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {results.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5">
                  {columns.map((col) => (
                    <td key={col} className="p-2.5">
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
