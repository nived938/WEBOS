import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Send, Plus, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export const ApiTesterApp: React.FC<AppInstanceProps> = () => {
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [url, setUrl] = useState<string>('https://api.github.com/zen')
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('headers')
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
    { key: 'Accept', value: 'application/json' },
    { key: 'User-Agent', value: 'NOVA-OS-Client/2.0' },
  ])
  const [bodyText, setBodyText] = useState<string>('{\n  "title": "New Task",\n  "completed": false\n}')
  const [response, setResponse] = useState<any>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [latency, setLatency] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSend = async () => {
    soundService.playClick()
    setLoading(true)
    const startTime = performance.now()

    try {
      const headerObj: Record<string, string> = {}
      headers.forEach(h => {
        if (h.key.trim()) headerObj[h.key] = h.value
      })

      const options: RequestInit = {
        method,
        headers: headerObj,
      }

      if (method !== 'GET' && bodyText.trim()) {
        options.body = bodyText
      }

      const res = await fetch(url, options)
      const elapsed = Math.round(performance.now() - startTime)
      setStatus(res.status)
      setLatency(elapsed)

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const json = await res.json()
        setResponse(JSON.stringify(json, null, 2))
      } else {
        const text = await res.text()
        setResponse(text)
      }
      soundService.playNotification()
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime)
      setStatus(0)
      setLatency(elapsed)
      setResponse(`Error executing request:\n${err.message || 'CORS or Network Failure'}\n\nTip: Browsers block cross-origin requests without CORS headers. Try public APIs like https://api.github.com/zen or https://jsonplaceholder.typicode.com/todos/1`)
    } finally {
      setLoading(false)
    }
  }

  const addHeader = () => {
    soundService.playClick()
    setHeaders(prev => [...prev, { key: '', value: '' }])
  }

  const removeHeader = (idx: number) => {
    soundService.playClick()
    setHeaders(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* URL & Method Input Bar */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center space-x-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as HttpMethod)}
          className={`px-3 py-1.5 rounded-lg font-bold font-mono focus:outline-none ${
            method === 'GET'
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : method === 'POST'
              ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
              : method === 'DELETE'
              ? 'bg-rose-600/30 text-rose-400 border border-rose-500/40'
              : 'bg-amber-600/30 text-amber-400 border border-amber-500/40'
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
          placeholder="https://api.example.com/v1"
          className="flex-1 bg-neutral-950 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{loading ? 'Sending...' : 'Send'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-4 bg-neutral-950/60 border-b border-white/5 space-x-4">
        <button
          onClick={() => setActiveTab('headers')}
          className={`py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'headers' ? 'border-blue-500 text-white' : 'border-transparent text-neutral-400'
          }`}
        >
          Headers ({headers.length})
        </button>
        <button
          onClick={() => setActiveTab('body')}
          className={`py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'body' ? 'border-blue-500 text-white' : 'border-transparent text-neutral-400'
          }`}
        >
          Body (JSON)
        </button>
      </div>

      {/* Main Workspace: Config & Response */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Request Config Pane */}
        <div className="flex-1 p-3 bg-neutral-950/40 overflow-y-auto border-b md:border-b-0 md:border-r border-white/10">
          {activeTab === 'headers' ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-neutral-400 uppercase font-semibold">Request Headers</span>
                <button onClick={addHeader} className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 text-[11px]">
                  <Plus className="w-3 h-3" />
                  <span>Add Header</span>
                </button>
              </div>

              {headers.map((h, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={h.key}
                    placeholder="Key"
                    onChange={(e) => {
                      const updated = [...headers]
                      updated[i].key = e.target.value
                      setHeaders(updated)
                    }}
                    className="flex-1 bg-neutral-900 border border-white/10 rounded px-2 py-1 font-mono text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    value={h.value}
                    placeholder="Value"
                    onChange={(e) => {
                      const updated = [...headers]
                      updated[i].value = e.target.value
                      setHeaders(updated)
                    }}
                    className="flex-1 bg-neutral-900 border border-white/10 rounded px-2 py-1 font-mono text-xs focus:outline-none"
                  />
                  <button onClick={() => removeHeader(i)} className="p-1 hover:text-red-400 text-neutral-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="text-[11px] text-neutral-400 uppercase font-semibold mb-1">JSON Payload</div>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="flex-1 bg-neutral-900 border border-white/10 rounded-lg p-3 font-mono text-xs text-neutral-200 resize-none focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Response Pane */}
        <div className="flex-1 flex flex-col bg-neutral-950 p-3 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[11px] text-neutral-400 uppercase font-semibold">Response Output</span>
            {status !== null && (
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className={`font-bold ${status >= 200 && status < 300 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Status: {status}
                </span>
                <span className="text-neutral-400">{latency} ms</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto mt-2 bg-neutral-900/50 rounded-lg p-3 border border-white/5 font-mono text-xs text-neutral-200">
            {response ? (
              <pre className="whitespace-pre-wrap">{response}</pre>
            ) : (
              <div className="text-neutral-500 italic mt-8 text-center font-sans">
                Click Send to trigger the HTTP request and view headers/body.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
