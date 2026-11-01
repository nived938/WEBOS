import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Archive, Download, FileText, Plus, CheckCircle } from 'lucide-react'

interface ArchivedFile {
  name: string
  originalSize: number
  compressedSize: number
}

const INITIAL_ARCHIVE_FILES: ArchivedFile[] = [
  { name: 'kernel_compositor.ts', originalSize: 45200, compressedSize: 12400 },
  { name: 'liquid_glass.frag', originalSize: 18500, compressedSize: 5200 },
  { name: 'desktop_wallpapers.json', originalSize: 84000, compressedSize: 21000 },
  { name: 'system_manifest.yaml', originalSize: 9200, compressedSize: 2800 },
]

export const FileCompressorApp: React.FC<AppInstanceProps> = () => {
  const [archiveFiles, setArchiveFiles] = useState<ArchivedFile[]>(INITIAL_ARCHIVE_FILES)
  const [format, setFormat] = useState<'ZIP' | 'TAR.GZ'>('ZIP')

  const totalOriginal = archiveFiles.reduce((acc, f) => acc + f.originalSize, 0)
  const totalCompressed = archiveFiles.reduce((acc, f) => acc + f.compressedSize, 0)
  const ratio = Math.round((1 - totalCompressed / totalOriginal) * 100)

  const handleDownloadArchive = () => {
    soundService.play('buttonClick')
    alert(`Archive ${format.toLowerCase()} downloaded successfully.`)
  }

  return (
    <div className="flex flex-col h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Archive size={16} className="text-amber-400" />
          <span className="font-semibold text-white text-xs">VFS Archive Compressor</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {(['ZIP', 'TAR.GZ'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-2.5 py-1 text-xs font-mono font-medium ${
                  format === fmt ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-400'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadArchive}
            className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
          >
            <Download size={13} /> Build Archive
          </button>
        </div>
      </div>

      {/* Compression Stats */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-around text-center">
        <div>
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Original Size</span>
          <span className="text-sm font-mono font-bold text-white">
            {(totalOriginal / 1024).toFixed(1)} KB
          </span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Compressed</span>
          <span className="text-sm font-mono font-bold text-emerald-400">
            {(totalCompressed / 1024).toFixed(1)} KB
          </span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Saved Ratio</span>
          <span className="text-sm font-mono font-bold text-cyan-400">{ratio}%</span>
        </div>
      </div>

      {/* Files List in Archive */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {archiveFiles.map((f, i) => (
          <div
            key={i}
            className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2.5">
              <FileText size={16} className="text-blue-400" />
              <span className="font-mono text-neutral-200">{f.name}</span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px] text-neutral-400">
              <span>{(f.originalSize / 1024).toFixed(1)} KB</span>
              <span>&rarr;</span>
              <span className="text-emerald-400">{(f.compressedSize / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
