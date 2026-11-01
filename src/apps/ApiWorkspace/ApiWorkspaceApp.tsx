import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Send, Globe, Code, Check, AlertCircle, Clock } from 'lucide-react'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export const ApiWorkspaceApp: React.FC<AppInstanceProps> = () => {
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1')
  const [requestBody, setRequestBody] = useState('{\n  "title": "Test NOVA OS API Client",\n  "completed": false\n}')
  const [responseStatus, setResponseStatus] = useState<number | null>(null)
  const [responseBody, setResponseBody] = useState<string>('// Response will appear here after dispatching request')
  const [latency, setLatency] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    soundService.play('buttonClick')
    setLoading(true)
    const startTime = performance.now()

    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      }
      if (method !== 'GET') {
        options.body = requestBody
      }

      const res = await fetch(url, options)
      const endTime = performance.now()
      setLatency(Math.round(endTime - startTime))
      setResponseStatus(res.status)

      const text = await res.text()
      try {
        const json = JSON.parse(text)
        setResponseBody(JSON.stringify(json, null, 2))
      } catch {
        setResponseBody(text)
      }
    } catch (err: any) {
      setLatency(0)
      setResponseStatus(0)
      setResponseBody(`Network / CORS Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* URL Request Bar */}
      <div className="p-3 border-b border-white/10 bg-black/40 flex items-center gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as HttpMethod)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono focus:outline-none ${
            method === 'GET'
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : method === 'POST'
              ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
              : method === 'PUT'
              ? 'bg-amber-600/30 text-amber-400 border border-amber-500/40'
              : 'bg-rose-600/30 text-rose-400 border border-rose-500/40'
          }`}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/v1/resource"
          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow disabled:opacity-40"
        >
          <Send size={13} /> {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Editors Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-white/10 bg-[#1a1a24] overflow-hidden">
        {/* Request Payload */}
        <div className="flex flex-col h-full">
          <div className="px-3 py-2 bg-black/20 border-b border-white/10 text-xs font-medium text-neutral-400 flex items-center justify-between">
            <span>JSON Body (for POST/PUT)</span>
            <span className="text-[10px] text-neutral-500">application/json</span>
          </div>
          <textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            disabled={method === 'GET'}
            className="flex-1 p-3 bg-transparent text-emerald-300 font-mono text-xs resize-none focus:outline-none disabled:opacity-30 select-text leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Response View */}
        <div className="flex flex-col h-full bg-black/20">
          <div className="px-3 py-2 bg-black/30 border-b border-white/10 text-xs font-medium text-neutral-300 flex items-center justify-between">
            <span>Response Payload</span>
            {responseStatus !== null && (
              <div className="flex items-center gap-3 text-xs font-mono">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  Status: {responseStatus || 'FAILED'}
                </span>
                {latency !== null && (
                  <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                    <Clock size={11} /> {latency}ms
                  </span>
                )}
              </div>
            )}
          </div>
          <pre className="flex-1 p-3 font-mono text-xs text-sky-300 overflow-auto select-text leading-relaxed">
            {responseBody}
          </pre>
        </div>
      </div>
    </div>
  )
}
