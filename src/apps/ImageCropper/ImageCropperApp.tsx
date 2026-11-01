import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Crop, RotateCw, ZoomIn, ZoomOut, Download, Image as ImageIcon } from 'lucide-react'

export const ImageCropperApp: React.FC<AppInstanceProps> = () => {
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3'>('16:9')
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  const handleExport = () => {
    soundService.play('buttonClick')
    const canvas = document.createElement('canvas')
    canvas.width = aspectRatio === '1:1' ? 400 : aspectRatio === '16:9' ? 640 : 480
    canvas.height = aspectRatio === '1:1' ? 400 : 360
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 24px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('NOVA OS Cropped Asset', canvas.width / 2, canvas.height / 2)

    const link = document.createElement('a')
    link.download = `cropped-${aspectRatio.replace(':', '-')}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Controls */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['1:1', '16:9', '4:3'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                soundService.play('buttonClick')
                setAspectRatio(r)
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                aspectRatio === r ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-400'
              }`}
            >
              {r}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-white/15 mx-1" />

          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1.5 rounded hover:bg-white/10 text-neutral-300"
            title="Rotate 90"
          >
            <RotateCw size={14} />
          </button>
        </div>

        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
        >
          <Download size={13} /> Crop & Save
        </button>
      </div>

      {/* Preview Viewport */}
      <div className="flex-1 bg-black/60 p-6 flex items-center justify-center overflow-hidden">
        <div
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
            transition: 'transform 0.15s ease-out',
          }}
          className={`relative border-2 border-dashed border-blue-400/80 bg-gradient-to-tr from-sky-900/40 to-indigo-900/40 rounded-xl flex items-center justify-center shadow-2xl ${
            aspectRatio === '1:1'
              ? 'w-72 h-72'
              : aspectRatio === '16:9'
              ? 'w-96 h-56'
              : 'w-80 h-60'
          }`}
        >
          <div className="text-center">
            <ImageIcon size={36} className="mx-auto text-blue-400/60 mb-2" />
            <span className="text-xs text-neutral-400 font-mono">Aspect: {aspectRatio}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
