import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Upload,
  Music as MusicIcon,
  Disc,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface Track {
  id: string
  title: string
  artist: string
  duration: number // in seconds
  isProcedural: boolean
  synthType?: number
  audioUrl?: string
}

const DEFAULT_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Cosmic Drift',
    artist: 'Nova Sound Lab',
    duration: 180,
    isProcedural: true,
    synthType: 1,
  },
  {
    id: 'track-2',
    title: 'Neon Horizon',
    artist: 'Nova Sound Lab',
    duration: 210,
    isProcedural: true,
    synthType: 2,
  },
  {
    id: 'track-3',
    title: 'Deep Space Flow',
    artist: 'Starlight Audio',
    duration: 160,
    isProcedural: true,
    synthType: 3,
  },
  {
    id: 'track-4',
    title: 'Midnight Drive',
    artist: 'Nova Sound Lab',
    duration: 195,
    isProcedural: true,
    synthType: 4,
  },
]

export const MusicApp: React.FC<AppInstanceProps> = () => {
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)

  const activeTrack = tracks[currentTrackIndex]

  // Web Audio Context & Nodes for Procedural Synthesis
  const audioCtxRef = useRef<AudioContext | null>(null)
  const synthTimerRef = useRef<number | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const visualizerCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Start procedural ambient synth note generator
  const triggerProceduralNote = useCallback((synthType: number = 1) => {
    if (!audioCtxRef.current) return
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()

    const t = ctx.currentTime
    // Scale notes (Pentatonic / Minor 7th chords for soothing ambient vibes)
    const scale =
      synthType === 1
        ? [261.63, 293.66, 329.63, 392.0, 440.0, 523.25] // C pentatonic
        : synthType === 2
        ? [220.0, 261.63, 293.66, 329.63, 392.0, 440.0] // A minor
        : synthType === 3
        ? [196.0, 246.94, 293.66, 369.99, 440.0, 493.88] // G major 7
        : [174.61, 220.0, 261.63, 329.63, 392.0, 523.25] // F lydian

    const freq = scale[Math.floor(Math.random() * scale.length)]
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = synthType % 2 === 0 ? 'sine' : 'triangle'
    osc.frequency.setValueAtTime(freq, t)

    const noteDuration = 1.8 + Math.random() * 1.5
    const targetGain = (isMuted ? 0 : volume) * 0.12

    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(targetGain, t + 0.3)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + noteDuration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + noteDuration + 0.1)
  }, [volume, isMuted])

  // Playback control effect
  useEffect(() => {
    if (isPlaying) {
      if (activeTrack.isProcedural) {
        if (!audioCtxRef.current) {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          audioCtxRef.current = new AudioCtx()
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume()
        }

        // Trigger notes at musical intervals
        synthTimerRef.current = window.setInterval(() => {
          triggerProceduralNote(activeTrack.synthType || 1)
        }, 800)
      } else if (activeTrack.audioUrl && audioElementRef.current) {
        audioElementRef.current.play().catch(() => {})
      }
    } else {
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current)
        synthTimerRef.current = null
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause()
      }
    }

    return () => {
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current)
      }
    }
  }, [isPlaying, activeTrack, triggerProceduralNote])

  // Progress timer
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= activeTrack.duration) {
          // Track ended: next or repeat
          if (isRepeat) {
            return 0
          } else {
            handleNextTrack()
            return 0
          }
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, activeTrack, isRepeat])

  const togglePlay = () => {
    soundService.playClick()
    setIsPlaying((p) => !p)
  }

  const handleNextTrack = () => {
    soundService.playClick()
    setCurrentTime(0)
    if (isShuffle) {
      const nextIdx = Math.floor(Math.random() * tracks.length)
      setCurrentTrackIndex(nextIdx)
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
    }
  }

  const handlePrevTrack = () => {
    soundService.playClick()
    if (currentTime > 4) {
      setCurrentTime(0)
    } else {
      setCurrentTime(0)
      setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
    }
  }

  const handleUserAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    const newTrack: Track = {
      id: 'track-' + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local Music File',
      duration: 200,
      isProcedural: false,
      audioUrl: url,
    }

    setTracks((prev) => [newTrack, ...prev])
    setCurrentTrackIndex(0)
    setCurrentTime(0)
    setIsPlaying(true)
    soundService.playClick()
  }

  // Audio visualizer animation
  useEffect(() => {
    const canvas = visualizerCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let frame = 0

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const numBars = 28
      const barWidth = w / numBars - 2

      for (let i = 0; i < numBars; i++) {
        const factor = Math.sin(frame * 0.08 + i * 0.3) * 0.5 + 0.5
        const barHeight = isPlaying ? Math.max(4, factor * (h * 0.8)) : 4

        const grad = ctx.createLinearGradient(0, h, 0, h - barHeight)
        grad.addColorStop(0, '#8b5cf6')
        grad.addColorStop(1, '#ec4899')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.roundRect(i * (barWidth + 2), h - barHeight, barWidth, barHeight, 2)
        ctx.fill()
      }

      if (isPlaying) frame++
      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900/90 text-neutral-200 select-none backdrop-blur-xl">
      {/* Hidden native audio element for user uploaded files */}
      <audio
        ref={audioElementRef}
        src={activeTrack?.audioUrl}
        onEnded={handleNextTrack}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Album Artwork & Visualizer */}
        <div className="w-1/2 p-6 flex flex-col items-center justify-center border-r border-white/10 bg-black/20">
          <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-tr from-purple-900 to-indigo-700 flex items-center justify-center mb-4 group border border-white/10">
            <Disc
              size={80}
              className={`text-white/40 ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '6s' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
              <span className="text-xs font-semibold text-white truncate">{activeTrack.title}</span>
              <span className="text-[11px] text-neutral-400 truncate">{activeTrack.artist}</span>
            </div>
          </div>

          {/* Visualizer Canvas */}
          <div className="w-48 h-10 mt-1">
            <canvas ref={visualizerCanvasRef} width={192} height={40} className="w-full h-full" />
          </div>
        </div>

        {/* Right: Playlist Queue */}
        <div className="w-1/2 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Playlist Queue
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleUserAudioUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium transition"
            >
              <Upload size={13} /> Import Audio
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {tracks.map((t, idx) => {
              const isCurr = idx === currentTrackIndex
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    soundService.playClick()
                    setCurrentTrackIndex(idx)
                    setCurrentTime(0)
                    setIsPlaying(true)
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                    isCurr ? 'bg-purple-600/30 text-white font-medium' : 'hover:bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MusicIcon size={14} className={isCurr ? 'text-purple-400' : 'text-neutral-500'} />
                    <div className="truncate">
                      <div className="text-xs truncate">{t.title}</div>
                      <div className="text-[10px] text-neutral-500">{t.artist}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono ml-2">
                    {formatTime(t.duration)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="p-4 border-t border-white/10 bg-neutral-950/70 backdrop-blur-md flex flex-col gap-2">
        {/* Progress Scrubber */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={activeTrack.duration}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <span>{formatTime(activeTrack.duration)}</span>
        </div>

        {/* Playback Controls & Volume */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShuffle((s) => !s)}
              className={`p-1.5 rounded transition ${isShuffle ? 'text-purple-400' : 'text-neutral-500 hover:text-white'}`}
              title="Shuffle"
            >
              <Shuffle size={14} />
            </button>
            <button
              onClick={() => setIsRepeat((r) => !r)}
              className={`p-1.5 rounded transition ${isRepeat ? 'text-purple-400' : 'text-neutral-500 hover:text-white'}`}
              title="Repeat"
            >
              <Repeat size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevTrack}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 active:scale-95 transition"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button
              onClick={handleNextTrack}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 w-28">
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="text-neutral-400 hover:text-white transition"
            >
              {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value))
                setIsMuted(false)
              }}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
