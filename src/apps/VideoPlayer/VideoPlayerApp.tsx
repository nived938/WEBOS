import React, { useRef, useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Play, Pause, Volume2, VolumeX, Maximize, Film, SkipForward, SkipBack } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

const VIDEOS = [
  {
    title: 'Earth Orbit & Atmospheric Aurora',
    source: 'NASA Goddard Public Domain',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '0:15'
  },
  {
    title: 'Cosmic Explorations & Nebula',
    source: 'Deep Space Media',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: '0:15'
  },
  {
    title: 'Synthesized Neon Odyssey',
    source: 'Open Creative Project',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    duration: '0:15'
  }
]

export const VideoPlayerApp: React.FC<AppInstanceProps> = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [speed, setSpeed] = useState(1)

  const activeVideo = VIDEOS[currentIdx]

  const togglePlay = () => {
    soundService.playClick()
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      setDuration(videoRef.current.duration || 0)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = val
      setCurrentTime(val)
    }
  }

  const handleNext = () => {
    soundService.playClick()
    setCurrentIdx(i => (i + 1) % VIDEOS.length)
    setIsPlaying(false)
  }

  const handlePrev = () => {
    soundService.playClick()
    setCurrentIdx(i => (i - 1 + VIDEOS.length) % VIDEOS.length)
    setIsPlaying(false)
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${mins}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="flex flex-col h-full bg-black text-neutral-100 select-none overflow-hidden text-xs">
      {/* Video Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden group">
        <video
          ref={videoRef}
          src={activeVideo.src}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          className="max-h-full max-w-full object-contain cursor-pointer"
          onClick={togglePlay}
        />

        {/* Big play button overlay when paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-2xs cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 border border-white/20 flex items-center justify-center shadow-2xl transition-all">
              <Play className="w-8 h-8 fill-white text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Media Controller Bar */}
      <div className="p-3 bg-neutral-900 border-t border-white/10 space-y-2">
        {/* Scrubber bar */}
        <div className="flex items-center space-x-2">
          <span className="font-mono text-[10px] text-neutral-400 w-8 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <span className="font-mono text-[10px] text-neutral-400 w-8">{formatTime(duration)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={handlePrev} className="p-1 hover:text-white text-neutral-400">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={togglePlay} className="p-1.5 rounded-full bg-white text-black hover:bg-neutral-200">
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
            </button>
            <button onClick={handleNext} className="p-1 hover:text-white text-neutral-400">
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-1.5 ml-2">
              <button onClick={() => setIsMuted(m => !m)} className="text-neutral-400 hover:text-white">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={e => {
                  setVolume(Number(e.target.value))
                  if (videoRef.current) videoRef.current.volume = Number(e.target.value)
                  setIsMuted(false)
                }}
                className="w-16 h-1 bg-white/20 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-neutral-300 font-medium truncate max-w-[200px]">{activeVideo.title}</span>
            <button
              onClick={() => {
                const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1
                setSpeed(nextSpeed)
                if (videoRef.current) videoRef.current.playbackRate = nextSpeed
              }}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 font-mono text-[10px]"
            >
              {speed}x
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
