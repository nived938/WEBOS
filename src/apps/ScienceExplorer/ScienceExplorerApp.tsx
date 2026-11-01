import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Atom, Info } from 'lucide-react'

interface ElementData {
  number: number
  symbol: string
  name: string
  mass: string
  category: string
  color: string
}

const ELEMENTS: ElementData[] = [
  { number: 1, symbol: 'H', name: 'Hydrogen', mass: '1.008', category: 'Nonmetal', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { number: 2, symbol: 'He', name: 'Helium', mass: '4.0026', category: 'Noble Gas', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { number: 3, symbol: 'Li', name: 'Lithium', mass: '6.94', category: 'Alkali Metal', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
  { number: 4, symbol: 'Be', name: 'Beryllium', mass: '9.0122', category: 'Alkaline Earth', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { number: 5, symbol: 'B', name: 'Boron', mass: '10.81', category: 'Metalloid', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { number: 6, symbol: 'C', name: 'Carbon', mass: '12.011', category: 'Nonmetal', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: '14.007', category: 'Nonmetal', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { number: 8, symbol: 'O', name: 'Oxygen', mass: '15.999', category: 'Nonmetal', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { number: 9, symbol: 'F', name: 'Fluorine', mass: '18.998', category: 'Halogen', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: '20.180', category: 'Noble Gas', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { number: 11, symbol: 'Na', name: 'Sodium', mass: '22.990', category: 'Alkali Metal', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: '24.305', category: 'Alkaline Earth', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { number: 13, symbol: 'Al', name: 'Aluminum', mass: '26.982', category: 'Post-transition', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { number: 14, symbol: 'Si', name: 'Silicon', mass: '28.085', category: 'Metalloid', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
]

export const ScienceExplorerApp: React.FC<AppInstanceProps> = () => {
  const [selectedElement, setSelectedElement] = useState<ElementData>(ELEMENTS[0])

  return (
    <div className="flex h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Table grid view */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Atom size={18} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Periodic Table of Elements</h2>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2.5">
          {ELEMENTS.map((elem) => (
            <div
              key={elem.number}
              onClick={() => {
                soundService.play('buttonClick')
                setSelectedElement(elem)
              }}
              className={`p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-105 ${elem.color} ${
                selectedElement.number === elem.number ? 'ring-2 ring-white scale-105' : ''
              }`}
            >
              <span className="text-[10px] font-mono text-neutral-400">{elem.number}</span>
              <span className="text-xl font-bold font-mono text-center my-1">{elem.symbol}</span>
              <span className="text-[9px] truncate text-center text-neutral-300">{elem.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Element Detail Sidebar */}
      <div className="w-64 bg-black/40 border-l border-white/10 p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
            <Info size={14} className="text-blue-400" /> Element Telemetry
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-mono text-neutral-400 mb-1">
              Atomic #{selectedElement.number}
            </span>
            <span className="text-4xl font-extrabold font-mono text-white mb-1">
              {selectedElement.symbol}
            </span>
            <h3 className="text-sm font-bold text-white">{selectedElement.name}</h3>
            <span className="text-xs font-mono text-cyan-400 mt-1">
              {selectedElement.mass} u
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">Category</span>
              <span className="text-white font-medium">{selectedElement.category}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">Standard State</span>
              <span className="text-white font-medium">Gas / Solid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
