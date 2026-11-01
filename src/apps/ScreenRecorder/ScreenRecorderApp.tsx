import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Monitor, Square, Download, Video, CheckCircle } from 'lucide-react'

export const ScreenRecorderApp: React.FC<AppInstanceProps> = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [fps, setFps] = useState<30 | 60>(60)
  const [recordingReady, setRecordingReady] = useState(false)

  useEffect(() => {
    let interval: any = null
    if (isRecording) {
      interval = setInterval(() => {
        setElapsed((e) => e + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  const toggleRecord = () => {
    soundService.play('buttonClick')
    if (isRecording) {
      setIsRecording(false)
      setRecordingReady(true)
    } else {
      setElapsed(0)
      setRecordingReady(false)
      setIsRecording(true)
    }
  }

  const handleDownload = () => {
    soundService.play('buttonClick')
    const link = document.createElement('a')
    link.download = `nova-screen-capture-${Date.now()}.webm`
    link.href = '#'
    link.click()
    alert('Screen recording exported successfully.')
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden items-center justify-center p-6">
      <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
          <Monitor size={15} className="text-blue-400" />
          <span>DISPLAY CAPTURE PIPELINE</span>
        </div>

        {/* Live Status */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-white tracking-widest">
            00:{elapsed.toString().padStart(2, '0')}:00
          </div>
          <span
            className={`text-xs mt-2 inline-block px-2.5 py-0.5 rounded-full font-mono ${
              isRecording
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : 'bg-white/5 text-neutral-400'
            }`}
          >
            {isRecording ? '• RECORDING LIVE DESKTOP' : 'STANDBY READY'}
          </span>
        </div>

        {/* FPS selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Frame Rate:</span>
          {[30, 60].map((f) => (
            <button
              key={f}
              onClick={() => setFps(f as 30 | 60)}
              disabled={isRecording}
              className={`px-3 py-1 rounded-lg font-mono transition-colors ${
                fps === f ? 'bg-blue-600 text-white font-bold' : 'bg-white/5 text-neutral-400'
              }`}
            >
              {f} FPS
            </button>
          ))}
        </div>

        {/* Control Button */}
        <button
          onClick={toggleRecord}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${
            isRecording
              ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {isRecording ? <Square size={20} /> : <Video size={24} />}
        </button>

        {/* Export link */}
        {recordingReady && (
          <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle size={14} /> Screen Capture Complete
            </span>
            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 shadow"
            >
              <Download size={13} /> Save WebM
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
