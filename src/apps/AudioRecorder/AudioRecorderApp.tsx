import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Mic, Square, Play, Pause, Download, Radio } from 'lucide-react'

export const AudioRecorderApp: React.FC<AppInstanceProps> = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [bars, setBars] = useState<number[]>(Array(32).fill(10))

  useEffect(() => {
    let timer: any = null
    let anim: any = null

    if (isRecording) {
      timer = setInterval(() => {
        setRecordTime((t) => t + 1)
      }, 1000)

      anim = setInterval(() => {
        setBars(Array.from({ length: 32 }, () => Math.floor(Math.random() * 80) + 10))
      }, 100)
    } else {
      setBars(Array(32).fill(10))
    }

    return () => {
      if (timer) clearInterval(timer)
      if (anim) clearInterval(anim)
    }
  }, [isRecording])

  const toggleRecord = () => {
    soundService.play('buttonClick')
    if (isRecording) {
      setIsRecording(false)
      // Provide simulated recorded blob audio
      setAudioUrl('simulated-record-sample.wav')
    } else {
      setRecordTime(0)
      setAudioUrl(null)
      setIsRecording(true)
    }
  }

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden items-center justify-center p-6">
      <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
          <Radio size={14} className={isRecording ? 'text-red-500 animate-pulse' : 'text-neutral-500'} />
          <span>{isRecording ? 'RECORDING LIVE AUDIO' : 'STUDIO READY'}</span>
        </div>

        {/* Timer display */}
        <div className="text-4xl font-mono font-bold text-white tracking-widest">
          {formatSecs(recordTime)}
        </div>

        {/* Live Audio Bars Waveform */}
        <div className="w-full h-24 bg-black/50 border border-white/5 rounded-xl flex items-end justify-center gap-1.5 p-3 overflow-hidden">
          {bars.map((height, i) => (
            <div
              key={i}
              style={{ height: `${height}%` }}
              className={`w-1.5 rounded-full transition-all duration-100 ${
                isRecording ? 'bg-gradient-to-t from-red-500 to-amber-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Record Control */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleRecord}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${
              isRecording
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-red-500 border border-red-500/30'
            }`}
          >
            {isRecording ? <Square size={20} /> : <Mic size={24} />}
          </button>
        </div>

        {/* Download result */}
        {audioUrl && !isRecording && (
          <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium">Capture Ready ({recordTime}s)</span>
            <button
              onClick={() => {
                soundService.play('buttonClick')
                const link = document.createElement('a')
                link.download = 'voice-recording.wav'
                link.href = '#'
                link.click()
              }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 shadow"
            >
              <Download size={13} /> Save WAV
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
