import React, { useRef, useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { ArrowRight, Square, Type, Download, Trash2, EyeOff } from 'lucide-react'

export const ScreenshotEditorApp: React.FC<AppInstanceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [tool, setTool] = useState<'arrow' | 'rect' | 'text' | 'blur'>('arrow')
  const [color, setColor] = useState('#ef4444')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw simulated screenshot
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#1e293b'
    ctx.fillRect(20, 20, canvas.width - 40, 48)

    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 15px Inter, sans-serif'
    ctx.fillText('NOVA OS Desktop Compositor Telemetry', 36, 50)
  }, [])

  const handleDownload = () => {
    soundService.play('buttonClick')
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'annotated-screenshot.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool('arrow')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
              tool === 'arrow' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <ArrowRight size={13} /> Arrow
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
              tool === 'rect' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <Square size={13} /> Box
          </button>
          <button
            onClick={() => setTool('blur')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
              tool === 'blur' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-neutral-400'
            }`}
          >
            <EyeOff size={13} /> Blur Mask
          </button>

          <div className="h-4 w-[1px] bg-white/15 mx-1" />

          {['#ef4444', '#3b82f6', '#10b981', '#f59e0b'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-5 h-5 rounded-full border ${
                color === c ? 'border-white scale-110' : 'border-transparent'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleDownload}
          className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
        >
          <Download size={13} /> Export
        </button>
      </div>

      <div className="flex-1 bg-black/60 p-6 flex items-center justify-center overflow-auto">
        <canvas
          ref={canvasRef}
          width={640}
          height={400}
          className="border border-white/15 rounded-xl shadow-2xl cursor-crosshair bg-[#0f172a]"
        />
      </div>
    </div>
  )
}
