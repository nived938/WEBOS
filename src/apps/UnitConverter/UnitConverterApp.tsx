import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { ArrowRightLeft, Scale, Ruler, Thermometer, HardDrive, Gauge } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

type Category = 'length' | 'mass' | 'temp' | 'storage' | 'speed'

export const UnitConverterApp: React.FC<AppInstanceProps> = () => {
  const [category, setCategory] = useState<Category>('length')
  const [valFrom, setValFrom] = useState<string>('1')
  const [unitFrom, setUnitFrom] = useState<string>('m')
  const [unitTo, setUnitTo] = useState<string>('ft')

  const convertUnits = (value: number, from: string, to: string, cat: Category): number => {
    if (isNaN(value)) return 0
    if (cat === 'length') {
      // Base: meters
      const inMeters: Record<string, number> = { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, yd: 0.9144, ft: 0.3048, in: 0.0254 }
      const meters = value * (inMeters[from] || 1)
      return meters / (inMeters[to] || 1)
    }
    if (cat === 'mass') {
      // Base: grams
      const inGrams: Record<string, number> = { kg: 1000, g: 1, mg: 0.001, lb: 453.592, oz: 28.3495 }
      const grams = value * (inGrams[from] || 1)
      return grams / (inGrams[to] || 1)
    }
    if (cat === 'storage') {
      // Base: MB
      const inMB: Record<string, number> = { B: 0.000001, KB: 0.001, MB: 1, GB: 1000, TB: 1000000 }
      const mb = value * (inMB[from] || 1)
      return mb / (inMB[to] || 1)
    }
    if (cat === 'speed') {
      // Base: km/h
      const inKmh: Record<string, number> = { 'km/h': 1, 'mph': 1.60934, 'm/s': 3.6, 'knot': 1.852 }
      const kmh = value * (inKmh[from] || 1)
      return kmh / (inKmh[to] || 1)
    }
    if (cat === 'temp') {
      if (from === to) return value
      if (from === 'C' && to === 'F') return (value * 9) / 5 + 32
      if (from === 'F' && to === 'C') return ((value - 32) * 5) / 9
      if (from === 'C' && to === 'K') return value + 273.15
      if (from === 'K' && to === 'C') return value - 273.15
    }
    return value
  }

  const numInput = parseFloat(valFrom) || 0
  const result = convertUnits(numInput, unitFrom, unitTo, category)

  const swapUnits = () => {
    soundService.playClick()
    const temp = unitFrom
    setUnitFrom(unitTo)
    setUnitTo(temp)
  }

  const getUnitsList = (cat: Category) => {
    switch (cat) {
      case 'length': return ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'in']
      case 'mass': return ['kg', 'g', 'mg', 'lb', 'oz']
      case 'storage': return ['B', 'KB', 'MB', 'GB', 'TB']
      case 'speed': return ['km/h', 'mph', 'm/s', 'knot']
      case 'temp': return ['C', 'F', 'K']
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Category Tabs */}
      <div className="flex items-center justify-between p-2.5 bg-neutral-800/80 border-b border-white/10">
        <div className="flex items-center space-x-1">
          {[
            { id: 'length', label: 'Length', icon: Ruler },
            { id: 'mass', label: 'Mass', icon: Scale },
            { id: 'storage', label: 'Storage', icon: HardDrive },
            { id: 'speed', label: 'Speed', icon: Gauge },
            { id: 'temp', label: 'Temp', icon: Thermometer },
          ].map(c => {
            const Icon = c.icon
            return (
              <button
                key={c.id}
                onClick={() => {
                  soundService.playClick()
                  setCategory(c.id as Category)
                  const units = getUnitsList(c.id as Category)
                  setUnitFrom(units[0])
                  setUnitTo(units[1] || units[0])
                }}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  category === c.id ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Conversion Cards */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full space-y-4">
        {/* From Card */}
        <div className="w-full bg-neutral-950/80 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-neutral-400 text-[10px] uppercase tracking-wider font-semibold">
            <span>From</span>
            <span>Input</span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={valFrom}
              onChange={(e) => setValFrom(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-bold font-mono text-white focus:outline-none"
            />
            <select
              value={unitFrom}
              onChange={(e) => setUnitFrom(e.target.value)}
              className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-bold focus:outline-none"
            >
              {getUnitsList(category).map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={swapUnits}
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all shadow-md"
          title="Swap units"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* To Card */}
        <div className="w-full bg-neutral-950/80 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-neutral-400 text-[10px] uppercase tracking-wider font-semibold">
            <span>To</span>
            <span>Result</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-1 text-2xl font-bold font-mono text-emerald-400 truncate">
              {Number.isInteger(result) ? result : result.toFixed(4)}
            </div>
            <select
              value={unitTo}
              onChange={(e) => setUnitTo(e.target.value)}
              className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-bold focus:outline-none"
            >
              {getUnitsList(category).map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
