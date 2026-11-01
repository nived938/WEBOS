import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Music, Play, Pause, Plus, Trash2, Clock, ListMusic } from 'lucide-react'

interface Track {
  id: string
  title: string
  artist: string
  duration: string
}

const DEFAULT_TRACKS: Track[] = [
  { id: 't1', title: 'Cosmic Refraction', artist: 'NOVA Synth Lab', duration: '3:45' },
  { id: 't2', title: 'Liquid Glass Horizons', artist: 'Specular Waves', duration: '4:12' },
  { id: 't3', title: 'Subsystem Echoes', artist: 'Kernel Beats', duration: '2:58' },
  { id: 't4', title: 'Zero Telemetry Chill', artist: 'Sandbox Protocol', duration: '5:02' },
]

export const PlaylistManagerApp: React.FC<AppInstanceProps> = () => {
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS)
  const [activeTrackId, setActiveTrackId] = useState<string>('t1')
  const [isPlaying, setIsPlaying] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newArtist, setNewArtist] = useState('')

  const handlePlay = (id: string) => {
    soundService.play('buttonClick')
    if (activeTrackId === id) {
      setIsPlaying(!isPlaying)
    } else {
      setActiveTrackId(id)
      setIsPlaying(true)
    }
  }

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    soundService.play('buttonClick')
    const item: Track = {
      id: 't_' + Date.now(),
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Unknown Artist',
      duration: '3:30',
    }
    setTracks((prev) => [...prev, item])
    setNewTitle('')
    setNewArtist('')
  }

  const handleDelete = (id: string) => {
    soundService.play('buttonClick')
    setTracks((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic size={18} className="text-pink-400" />
          <div>
            <h2 className="text-xs font-bold text-white">Curated Playlist Studio</h2>
            <span className="text-[10px] text-neutral-400">{tracks.length} Tracks • 15 mins total</span>
          </div>
        </div>

        <form onSubmit={handleAddTrack} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Track title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-neutral-500 focus:outline-none w-36"
          />
          <input
            type="text"
            placeholder="Artist..."
            value={newArtist}
            onChange={(e) => setNewArtist(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-neutral-500 focus:outline-none w-28"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1 shadow"
          >
            <Plus size={13} /> Add
          </button>
        </form>
      </div>

      {/* Tracks List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
        {tracks.map((track, i) => (
          <div
            key={track.id}
            className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${
              activeTrackId === track.id ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePlay(track.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  activeTrackId === track.id && isPlaying
                    ? 'bg-pink-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-neutral-300'
                }`}
              >
                {activeTrackId === track.id && isPlaying ? (
                  <Pause size={13} />
                ) : (
                  <Play size={13} className="ml-0.5" />
                )}
              </button>

              <div>
                <h4 className="text-xs font-semibold text-white">{track.title}</h4>
                <p className="text-[10px] text-neutral-400">{track.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-neutral-400">
              <span className="font-mono flex items-center gap-1">
                <Clock size={11} /> {track.duration}
              </span>
              <button
                onClick={() => handleDelete(track.id)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 transition-opacity"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
