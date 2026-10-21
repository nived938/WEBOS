import React, { useState, useRef, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Music, Radio, Volume2, Sparkles } from 'lucide-react'

const NOTES = [
  { note: 'C', freq: 261.63, isBlack: false, key: 'a' },
  { note: 'C#', freq: 277.18, isBlack: true, key: 'w' },
  { note: 'D', freq: 293.66, isBlack: false, key: 's' },
  { note: 'D#', freq: 311.13, isBlack: true, key: 'e' },
  { note: 'E', freq: 329.63, isBlack: false, key: 'd' },
  { note: 'F', freq: 349.23, isBlack: false, key: 'f' },
  { note: 'F#', freq: 369.99, isBlack: true, key: 't' },
  { note: 'G', freq: 392.00, isBlack: false, key: 'g' },
  { note: 'G#', freq: 415.30, isBlack: true, key: 'y' },
  { note: 'A', freq: 440.00, isBlack: false, key: 'h' },
  { note: 'A#', freq: 466.16, isBlack: true, key: 'u' },
  { note: 'B', freq: 493.88, isBlack: false, key: 'j' },
]

export const AudioStudioApp: React.FC<AppInstanceProps> = () => {
  const [wave, setWave] = useState<OscillatorType>('sine')
  const [octave, setOctave] = useState<number>(1)
  const [activeNote, setActiveNote] = useState<string | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      audioCtxRef.current = new AudioCtx()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  const playNote = (freq: number, noteName: string) => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = wave
      osc.frequency.setValueAtTime(freq * octave, ctx.currentTime)

      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.6)
      setActiveNote(noteName)
      setTimeout(() => setActiveNote(null), 300)
    } catch {}
  }

  const playDrum = (type: 'kick' | 'snare' | 'hihat') => {
    try {
      const ctx = getAudioContext()
      if (type === 'kick') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        gain.gain.setValueAtTime(1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
      } else if (type === 'snare') {
        const noise = ctx.createBufferSource()
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1
        noise.buffer = buffer

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.5, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

        noise.connect(gain)
        gain.connect(ctx.destination)
        noise.start()
      } else if (type === 'hihat') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(8000, ctx.currentTime)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.05)
      }
    } catch {}
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Synthesizer Controls */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Music className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-white">Synthesizer & Drum Studio</span>
        </div>

        {/* Waveform Selector */}
        <div className="flex items-center space-x-1 bg-neutral-950 p-1 rounded-lg border border-white/10">
          {(['sine', 'square', 'sawtooth', 'triangle'] as const).map(w => (
            <button
              key={w}
              onClick={() => setWave(w)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize ${
                wave === w ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Octave */}
        <div className="flex items-center space-x-1.5 font-mono">
          <span className="text-[10px] text-neutral-400">Octave:</span>
          <button
            onClick={() => setOctave(o => Math.max(0.5, o / 2))}
            className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
          >
            -
          </button>
          <span className="w-4 text-center">{octave}x</span>
          <button
            onClick={() => setOctave(o => Math.min(4, o * 2))}
            className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
          >
            +
          </button>
        </div>
      </div>

      {/* Drum Machine Section */}
      <div className="p-4 bg-neutral-950/60 border-b border-white/5">
        <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold mb-2">Procedural Drums</div>
        <div className="grid grid-cols-3 gap-3 max-w-sm">
          <button
            onClick={() => playDrum('kick')}
            className="h-16 rounded-xl bg-gradient-to-br from-rose-600 to-rose-800 text-white font-bold flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <span>KICK</span>
            <span className="text-[9px] opacity-75">Punchy 808</span>
          </button>
          <button
            onClick={() => playDrum('snare')}
            className="h-16 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <span>SNARE</span>
            <span className="text-[9px] opacity-75">White Noise</span>
          </button>
          <button
            onClick={() => playDrum('hihat')}
            className="h-16 rounded-xl bg-gradient-to-br from-sky-600 to-sky-800 text-white font-bold flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <span>HI-HAT</span>
            <span className="text-[9px] opacity-75">Metallic</span>
          </button>
        </div>
      </div>

      {/* Piano Keys Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-neutral-950">
        <div className="text-[11px] text-neutral-400 mb-4">Click piano keys to trigger real-time Web Audio oscillators</div>
        <div className="relative flex justify-center h-48 select-none">
          {NOTES.map((n) => {
            if (n.isBlack) return null
            const isPressed = activeNote === n.note
            return (
              <div
                key={n.note}
                onClick={() => playNote(n.freq, n.note)}
                className={`w-12 h-44 border border-neutral-300 rounded-b-lg flex flex-col justify-end items-center pb-2 cursor-pointer transition-all ${
                  isPressed ? 'bg-purple-200' : 'bg-white hover:bg-neutral-100'
                }`}
              >
                <span className="text-black font-bold text-xs">{n.note}</span>
                <span className="text-[9px] text-neutral-400 font-mono">[{n.key}]</span>
              </div>
            )
          })}

          {/* Overlay Black Keys */}
          {NOTES.map((n, i) => {
            if (!n.isBlack) return null
            const isPressed = activeNote === n.note
            // Calculate absolute left offset based on white keys
            const whiteIndex = NOTES.slice(0, i).filter(x => !x.isBlack).length
            const leftOffset = whiteIndex * 48 - 14

            return (
              <div
                key={n.note}
                onClick={(e) => {
                  e.stopPropagation()
                  playNote(n.freq, n.note)
                }}
                style={{ left: `${leftOffset}px` }}
                className={`absolute top-0 w-7 h-28 rounded-b-md z-10 flex flex-col justify-end items-center pb-1 cursor-pointer transition-all ${
                  isPressed ? 'bg-purple-600' : 'bg-neutral-900 hover:bg-neutral-800'
                }`}
              >
                <span className="text-white font-bold text-[10px]">{n.note}</span>
                <span className="text-[8px] text-neutral-400 font-mono">[{n.key}]</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
