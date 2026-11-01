import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { FileText, ArrowRightLeft, Copy, Check, Download } from 'lucide-react'

const SAMPLE_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nova-os-cluster
  labels:
    app: nova-desktop
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nova-desktop
  template:
    metadata:
      labels:
        app: nova-desktop
    spec:
      containers:
      - name: desktop-shell
        image: nova/shell:2.5
        ports:
        - containerPort: 5173
`

export const YamlEditorApp: React.FC<AppInstanceProps> = () => {
  const [yamlContent, setYamlContent] = useState(SAMPLE_YAML)
  const [jsonOutput, setJsonOutput] = useState('')
  const [copied, setCopied] = useState(false)

  // Lightweight YAML to JSON parser for common key-value maps
  const convertToJson = () => {
    soundService.play('buttonClick')
    const lines = yamlContent.split('\n')
    const result: Record<string, any> = {}

    lines.forEach((line) => {
      const parts = line.split(':')
      if (parts.length >= 2) {
        const key = parts[0].trim().replace(/^-\s*/, '')
        const val = parts.slice(1).join(':').trim()
        if (key && val) {
          result[key] = isNaN(Number(val)) ? val : Number(val)
        }
      }
    })

    setJsonOutput(JSON.stringify(result, null, 2))
  }

  const handleCopy = () => {
    soundService.play('buttonClick')
    navigator.clipboard.writeText(yamlContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-mono text-xs select-none">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-amber-400" />
          <span className="font-semibold text-white font-sans">YAML & Config Studio</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={convertToJson}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/15 text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowRightLeft size={13} /> Parse to JSON
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1 font-medium shadow"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy YAML'}
          </button>
        </div>
      </div>

      {/* Editors Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-white/10 bg-[#1a1a24] overflow-hidden">
        {/* YAML Editor */}
        <div className="flex flex-col h-full">
          <div className="px-3 py-1.5 bg-black/20 border-b border-white/10 text-[11px] font-sans text-neutral-400">
            YAML Source
          </div>
          <textarea
            value={yamlContent}
            onChange={(e) => setYamlContent(e.target.value)}
            className="flex-1 p-3 bg-transparent text-amber-300 resize-none focus:outline-none leading-relaxed select-text font-mono"
            spellCheck={false}
          />
        </div>

        {/* JSON Preview */}
        <div className="flex flex-col h-full bg-black/20">
          <div className="px-3 py-1.5 bg-black/30 border-b border-white/10 text-[11px] font-sans text-neutral-400">
            JSON Output
          </div>
          <pre className="flex-1 p-3 text-emerald-300 overflow-auto select-text font-mono leading-relaxed">
            {jsonOutput || '// Click "Parse to JSON" to inspect parsed objects'}
          </pre>
        </div>
      </div>
    </div>
  )
}
