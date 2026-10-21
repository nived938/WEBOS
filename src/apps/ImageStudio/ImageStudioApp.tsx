import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Sliders, RefreshCw, Download, Sparkles, Image as ImageIcon } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

const SAMPLES = [
  { name: 'Aurora Nebula', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop' },
  { name: 'Cyber City', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop' },
  { name: 'Alpine Peaks', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop' }
]

export const ImageStudioApp: React.FC<AppInstanceProps> = () => {
  const [activeImage, setActiveImage] = useState(SAMPLES[0].url)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [blur, setBlur] = useState(0)
  const [sepia, setSepia] = useState(0)
  const [hue, setHue] = useState(0)
  const [grayscale, setGrayscale] = useState(0)

  const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) sepia(${sepia}%) hue-rotate(${hue}deg) grayscale(${grayscale}%)`

  const handleReset = () => {
    soundService.playClick()
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setBlur(0)
    setSepia(0)
    setHue(0)
    setGrayscale(0)
  }

  const applyPreset = (name: 'cyber' | 'noir' | 'vintage') => {
    soundService.playClick()
    if (name === 'cyber') {
      setBrightness(115)
      setContrast(130)
      setSaturation(160)
      setHue(290)
      setSepia(0)
      setGrayscale(0)
    } else if (name === 'noir') {
      setBrightness(90)
      setContrast(160)
      setSaturation(0)
      setGrayscale(100)
      setSepia(0)
      setHue(0)
    } else if (name === 'vintage') {
      setBrightness(105)
      setContrast(90)
      setSaturation(85)
      setSepia(50)
      setGrayscale(0)
      setHue(10)
    }
  }

  return (
    <div className="flex h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Sidebar Controls */}
      <div className="w-64 bg-neutral-950/70 border-r border-white/10 p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Adjustments</span>
            </span>
            <button onClick={handleReset} className="text-[10px] text-neutral-400 hover:text-white" title="Reset">
              Reset
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Presets</span>
            <div className="grid grid-cols-3 gap-1">
              <button onClick={() => applyPreset('cyber')} className="py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-fuchsia-400">Cyber</button>
              <button onClick={() => applyPreset('noir')} className="py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-neutral-300">Noir</button>
              <button onClick={() => applyPreset('vintage')} className="py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-amber-400">Vintage</button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-[11px] text-neutral-300 mb-1">
                <span>Brightness</span>
                <span>{brightness}%</span>
              </div>
              <input type="range" min={30} max={200} value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded appearance-none" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-neutral-300 mb-1">
                <span>Contrast</span>
                <span>{contrast}%</span>
              </div>
              <input type="range" min={30} max={200} value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded appearance-none" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-neutral-300 mb-1">
                <span>Saturation</span>
                <span>{saturation}%</span>
              </div>
              <input type="range" min={0} max={250} value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded appearance-none" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-neutral-300 mb-1">
                <span>Blur</span>
                <span>{blur}px</span>
              </div>
              <input type="range" min={0} max={15} value={blur} onChange={e => setBlur(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded appearance-none" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-neutral-300 mb-1">
                <span>Sepia</span>
                <span>{sepia}%</span>
              </div>
              <input type="range" min={0} max={100} value={sepia} onChange={e => setSepia(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded appearance-none" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-neutral-300 mb-1">
                <span>Hue Shift</span>
                <span>{hue}°</span>
              </div>
              <input type="range" min={0} max={360} value={hue} onChange={e => setHue(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded appearance-none" />
            </div>
          </div>
        </div>

        {/* Sample Switcher */}
        <div className="pt-4 border-t border-white/10 space-y-1.5">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Sample Photos</span>
          <div className="flex gap-1.5">
            {SAMPLES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundService.playClick()
                  setActiveImage(s.url)
                }}
                className={`flex-1 py-1 rounded text-[10px] truncate ${activeImage === s.url ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-400'}`}
              >
                {s.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div className="flex-1 bg-neutral-950 flex items-center justify-center p-6 overflow-hidden relative">
        <img
          src={activeImage}
          alt="Studio preview"
          style={{ filter: filterStyle }}
          className="max-h-full max-w-full rounded-xl object-contain shadow-2xl transition-all duration-75"
        />
      </div>
    </div>
  )
}
