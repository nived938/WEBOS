import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Cloud, Sun, CloudRain, Wind, Droplets, Compass, Eye, Thermometer, ShieldAlert } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface CityWeather {
  city: string
  country: string
  temp: number
  condition: string
  high: number
  low: number
  feelsLike: number
  humidity: number
  wind: number
  uv: number
  aqi: number
  hourly: { time: string; temp: number; icon: 'sun' | 'cloud' | 'rain' }[]
  forecast: { day: string; condition: string; high: number; low: number; icon: 'sun' | 'cloud' | 'rain' }[]
}

const CITIES_DATA: Record<string, CityWeather> = {
  sf: {
    city: 'San Francisco',
    country: 'United States',
    temp: 18,
    condition: 'Partly Cloudy',
    high: 21,
    low: 13,
    feelsLike: 17,
    humidity: 74,
    wind: 16,
    uv: 4,
    aqi: 28,
    hourly: [
      { time: 'Now', temp: 18, icon: 'cloud' },
      { time: '12 PM', temp: 20, icon: 'sun' },
      { time: '1 PM', temp: 21, icon: 'sun' },
      { time: '2 PM', temp: 21, icon: 'sun' },
      { time: '3 PM', temp: 19, icon: 'cloud' },
      { time: '4 PM', temp: 17, icon: 'cloud' },
      { time: '5 PM', temp: 16, icon: 'cloud' },
    ],
    forecast: [
      { day: 'Today', condition: 'Partly Cloudy', high: 21, low: 13, icon: 'cloud' },
      { day: 'Wed', condition: 'Sunny', high: 23, low: 14, icon: 'sun' },
      { day: 'Thu', condition: 'Sunny', high: 24, low: 15, icon: 'sun' },
      { day: 'Fri', condition: 'Foggy Morning', high: 19, low: 13, icon: 'cloud' },
      { day: 'Sat', condition: 'Showers', high: 17, low: 12, icon: 'rain' },
    ]
  },
  tokyo: {
    city: 'Tokyo',
    country: 'Japan',
    temp: 22,
    condition: 'Sunny',
    high: 25,
    low: 17,
    feelsLike: 23,
    humidity: 58,
    wind: 9,
    uv: 6,
    aqi: 32,
    hourly: [
      { time: 'Now', temp: 22, icon: 'sun' },
      { time: '1 PM', temp: 24, icon: 'sun' },
      { time: '2 PM', temp: 25, icon: 'sun' },
      { time: '3 PM', temp: 23, icon: 'sun' },
      { time: '4 PM', temp: 21, icon: 'cloud' },
      { time: '5 PM', temp: 19, icon: 'cloud' },
      { time: '6 PM', temp: 18, icon: 'cloud' },
    ],
    forecast: [
      { day: 'Today', condition: 'Clear Sky', high: 25, low: 17, icon: 'sun' },
      { day: 'Wed', condition: 'Clear Sky', high: 26, low: 18, icon: 'sun' },
      { day: 'Thu', condition: 'Light Rain', high: 20, low: 15, icon: 'rain' },
      { day: 'Fri', condition: 'Scattered Clouds', high: 23, low: 16, icon: 'cloud' },
      { day: 'Sat', condition: 'Sunny', high: 25, low: 17, icon: 'sun' },
    ]
  },
  london: {
    city: 'London',
    country: 'United Kingdom',
    temp: 14,
    condition: 'Light Rain',
    high: 16,
    low: 10,
    feelsLike: 13,
    humidity: 86,
    wind: 22,
    uv: 2,
    aqi: 19,
    hourly: [
      { time: 'Now', temp: 14, icon: 'rain' },
      { time: '1 PM', temp: 15, icon: 'rain' },
      { time: '2 PM', temp: 16, icon: 'cloud' },
      { time: '3 PM', temp: 15, icon: 'cloud' },
      { time: '4 PM', temp: 14, icon: 'rain' },
      { time: '5 PM', temp: 13, icon: 'rain' },
      { time: '6 PM', temp: 12, icon: 'rain' },
    ],
    forecast: [
      { day: 'Today', condition: 'Passing Showers', high: 16, low: 10, icon: 'rain' },
      { day: 'Wed', condition: 'Overcast', high: 15, low: 9, icon: 'cloud' },
      { day: 'Thu', condition: 'Sunny Intervals', high: 18, low: 11, icon: 'sun' },
      { day: 'Fri', condition: 'Drizzle', high: 14, low: 9, icon: 'rain' },
      { day: 'Sat', condition: 'Breezy & Rain', high: 15, low: 10, icon: 'rain' },
    ]
  }
}

export const WeatherApp: React.FC<AppInstanceProps> = () => {
  const [selectedCityKey, setSelectedCityKey] = useState<string>('sf')
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C')

  const current = CITIES_DATA[selectedCityKey] || CITIES_DATA.sf

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°`
    }
    return `${celsius}°`
  }

  const renderIcon = (type: 'sun' | 'cloud' | 'rain', className = 'w-5 h-5') => {
    switch (type) {
      case 'sun':
        return <Sun className={`${className} text-amber-400`} />
      case 'rain':
        return <CloudRain className={`${className} text-blue-400`} />
      default:
        return <Cloud className={`${className} text-slate-300`} />
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-sky-900 via-indigo-950 to-neutral-950 text-white select-none overflow-y-auto">
      {/* Top Header / Selector */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          {Object.entries(CITIES_DATA).map(([key, data]) => (
            <button
              key={key}
              onClick={() => {
                soundService.playClick()
                setSelectedCityKey(key)
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCityKey === key
                  ? 'bg-white/20 text-white shadow-sm border border-white/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {data.city}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            soundService.playClick()
            setTempUnit(u => u === 'C' ? 'F' : 'C')
          }}
          className="text-xs font-mono font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md border border-white/10 transition-colors"
        >
          °{tempUnit}
        </button>
      </div>

      {/* Main Condition Header */}
      <div className="flex flex-col items-center justify-center pt-8 pb-6 text-center">
        <h1 className="text-2xl font-bold tracking-wide">{current.city}</h1>
        <p className="text-xs text-indigo-200 uppercase tracking-widest mt-0.5">{current.country}</p>
        
        <div className="text-6xl font-light tracking-tighter my-3">
          {formatTemp(current.temp)}
        </div>

        <div className="flex items-center space-x-2 text-sm text-indigo-100">
          <span>{current.condition}</span>
          <span>•</span>
          <span>H: {formatTemp(current.high)} L: {formatTemp(current.low)}</span>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* Hourly Forecast Strip */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <div className="text-xs text-indigo-200 uppercase font-semibold mb-3 tracking-wider">Hourly Forecast</div>
          <div className="flex justify-between items-center overflow-x-auto gap-3 py-1">
            {current.hourly.map((h, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 min-w-[50px]">
                <span className="text-xs text-neutral-300">{h.time}</span>
                {renderIcon(h.icon, 'w-6 h-6')}
                <span className="text-sm font-semibold">{formatTemp(h.temp)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Day Outlook */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <div className="text-xs text-indigo-200 uppercase font-semibold mb-3 tracking-wider">5-Day Outlook</div>
          <div className="space-y-3">
            {current.forecast.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-none">
                <span className="w-16 font-medium text-neutral-200">{day.day}</span>
                <div className="flex items-center space-x-2">
                  {renderIcon(day.icon, 'w-4 h-4')}
                  <span className="text-xs text-neutral-300 w-28 truncate">{day.condition}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-neutral-400">L: {formatTemp(day.low)}</span>
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '65%' }} />
                  </div>
                  <span className="font-semibold text-white">H: {formatTemp(day.high)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center space-x-1.5 text-xs text-indigo-200 mb-1">
              <Thermometer className="w-3.5 h-3.5" />
              <span>FEELS LIKE</span>
            </div>
            <div className="text-xl font-bold">{formatTemp(current.feelsLike)}</div>
            <div className="text-[10px] text-neutral-400 mt-1">Wind makes it feel cooler</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center space-x-1.5 text-xs text-indigo-200 mb-1">
              <Droplets className="w-3.5 h-3.5" />
              <span>HUMIDITY</span>
            </div>
            <div className="text-xl font-bold">{current.humidity}%</div>
            <div className="text-[10px] text-neutral-400 mt-1">Dew point is 12°</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center space-x-1.5 text-xs text-indigo-200 mb-1">
              <Wind className="w-3.5 h-3.5" />
              <span>WIND</span>
            </div>
            <div className="text-xl font-bold">{current.wind} <span className="text-xs font-normal">km/h</span></div>
            <div className="text-[10px] text-neutral-400 mt-1">NW gusting to 24 km/h</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center space-x-1.5 text-xs text-indigo-200 mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>AIR QUALITY</span>
            </div>
            <div className="text-xl font-bold">{current.aqi}</div>
            <div className="text-[10px] text-emerald-400 mt-1">Good • Low Risk</div>
          </div>
        </div>
      </div>
    </div>
  )
}
