import React, { useState } from 'react'
import {
  X,
  Upload,
  FileCode,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import { customizationManager } from '../services/customizationManager'
import type { CustomizationPackage } from '../types'

interface ImportPackageModalProps {
  onClose: () => void
  onImportSuccess: (pkg: CustomizationPackage) => void
}

export const ImportPackageModal: React.FC<ImportPackageModalProps> = ({
  onClose,
  onImportSuccess,
}) => {
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setJsonText(text)
      setError(null)
    }
    reader.readAsText(file)
  }

  const handleProcessImport = async () => {
    soundService.playClick()
    if (!jsonText.trim()) {
      setError('Please provide a package manifest JSON or upload a .novapack file.')
      return
    }

    setIsValidating(true)
    setError(null)

    const result = customizationManager.validateCustomizationManifest(jsonText)
    if (!result.valid || !result.pkg) {
      setError(result.error || 'Invalid customization manifest format.')
      setIsValidating(false)
      return
    }

    // Compute checksum
    const hash = await customizationManager.computeSha256(jsonText)
    result.pkg.checksumSha256 = hash

    // Install
    customizationManager.installPackage(result.pkg)
    onImportSuccess(result.pkg)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181924] border border-white/20 rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-4 text-neutral-200">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Import Customization Package</h3>
              <span className="text-[11px] text-neutral-400">Import .novapack or .json manifest</span>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Drop Area */}
        <label className="border-2 border-dashed border-white/20 hover:border-cyan-400/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white/5 hover:bg-white/10">
          <FileCode className="w-8 h-8 text-cyan-400" />
          <span className="text-xs font-semibold text-white">Click to select .novapack / .json file</span>
          <span className="text-[10px] text-neutral-400">Manifests are cryptographically checked and sandboxed</span>
          <input
            type="file"
            accept=".json,.novapack"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Manual Textarea */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400 font-medium">Or paste JSON manifest directly:</label>
          <textarea
            rows={5}
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value)
              setError(null)
            }}
            placeholder='{ "id": "my-theme", "name": "Custom Theme", "category": "themes", ... }'
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProcessImport}
            disabled={isValidating}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/30 transition-all"
          >
            {isValidating ? 'Validating...' : 'Validate & Install'}
          </button>
        </div>
      </div>
    </div>
  )
}
