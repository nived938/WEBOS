import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Mic, Play, Pause, Trash2, Clock, Volume2 } from 'lucide-react'

interface VoiceMemo {
  id: string
  title: string
  date: string
  duration: string
  isPlaying: boolean
}

const INITIAL_MEMOS: VoiceMemo[] = [
  { id: '1', title: 'Architecture Review Meeting', date: 'Today, 10:30 AM', duration: '03:42', isPlaying: false },
  { id: '2', title: 'Compositor Spec Brainstorm', date: 'Yesterday', duration: '01:15', isPlaying: false },
  { id: '3', title: 'Quick UI Audio Feedback idea', date: 'Nov 12', duration: '00:45', isPlaying: false },
]

export const VoiceRecorderApp: React.FC<AppInstanceProps> = () => {
  const [memos, setMemos] = useState<VoiceMemo[]>(INITIAL_MEMOS)
  const [isRecording, setIsRecording] = useState(false)

  const togglePlay = (id: string) => {
    soundService.play('buttonClick')
    setMemos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isPlaying: !m.isPlaying } : { ...m, isPlaying: false }))
    )
  }

  const deleteMemo = (id: string) => {
    soundService.play('buttonClick')
    setMemos((prev) => prev.filter((m) => m.id !== id))
  }

  const addSimulatedMemo = () => {
    soundService.play('buttonClick')
    setIsRecording(true)
    setTimeout(() => {
      setIsRecording(false)
      const newM: VoiceMemo = {
        id: 'memo_' + Date.now(),
        title: `Voice Memo ${memos.length + 1}`,
        date: 'Just now',
        duration: '00:30',
        isPlaying: false,
      }
      setMemos((prev) => [newM, ...prev])
    }, 1500)
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <span className="font-semibold text-white text-xs">Voice Memos</span>
        <button
          onClick={addSimulatedMemo}
          disabled={isRecording}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow transition-colors ${
            isRecording ? 'bg-red-600 animate-pulse text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          <Mic size={13} /> {isRecording ? 'Recording memo...' : 'Record Memo'}
        </button>
      </div>

      {/* Memos List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {memos.map((memo) => (
          <div
            key={memo.id}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => togglePlay(memo.id)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  memo.isPlaying ? 'bg-amber-500 text-black' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {memo.isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>

              <div>
                <h3 className="text-xs font-semibold text-white">{memo.title}</h3>
                <div className="flex items-center gap-3 text-[10px] text-neutral-400 mt-0.5">
                  <span>{memo.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {memo.duration}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {memo.isPlaying && <Volume2 size={16} className="text-amber-400 animate-pulse" />}
              <button
                onClick={() => deleteMemo(memo.id)}
                className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-1 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
