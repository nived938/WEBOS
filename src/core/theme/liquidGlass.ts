import type { LiquidGlassSettings, LiquidGlassPreset } from '@/types'

export const LIQUID_GLASS_PRESETS: Record<LiquidGlassPreset, Partial<LiquidGlassSettings>> = {
  clear: {
    opacity: 20,
    blur: 16,
    saturation: 120,
    brightness: 85,
    borderVisibility: 40,
    shadowIntensity: 40,
    cornerRadius: 18,
    reflectionIntensity: 50,
    tint: 'white',
  },
  frosted: {
    opacity: 50,
    blur: 32,
    saturation: 110,
    brightness: 80,
    borderVisibility: 35,
    shadowIntensity: 50,
    cornerRadius: 18,
    reflectionIntensity: 25,
    tint: 'auto',
  },
  deep: {
    opacity: 75,
    blur: 40,
    saturation: 140,
    brightness: 65,
    borderVisibility: 45,
    shadowIntensity: 85,
    cornerRadius: 22,
    reflectionIntensity: 35,
    tint: 'black',
  },
  liquid: {
    opacity: 45,
    blur: 28,
    saturation: 160,
    brightness: 90,
    borderVisibility: 65,
    shadowIntensity: 75,
    cornerRadius: 24,
    reflectionIntensity: 80,
    tint: 'blue',
  },
  crystal: {
    opacity: 18,
    blur: 12,
    saturation: 130,
    brightness: 95,
    borderVisibility: 70,
    shadowIntensity: 30,
    cornerRadius: 16,
    reflectionIntensity: 90,
    tint: 'white',
  },
  dark: {
    opacity: 80,
    blur: 24,
    saturation: 100,
    brightness: 55,
    borderVisibility: 30,
    shadowIntensity: 90,
    cornerRadius: 16,
    reflectionIntensity: 20,
    tint: 'black',
  },
  colored: {
    opacity: 55,
    blur: 26,
    saturation: 180,
    brightness: 80,
    borderVisibility: 55,
    shadowIntensity: 70,
    cornerRadius: 20,
    reflectionIntensity: 65,
    tint: 'purple',
  },
  minimal: {
    opacity: 85,
    blur: 4,
    saturation: 100,
    brightness: 75,
    borderVisibility: 20,
    shadowIntensity: 25,
    cornerRadius: 12,
    reflectionIntensity: 10,
    tint: 'auto',
  },
}

export const DEFAULT_LIQUID_GLASS: LiquidGlassSettings = {
  enabled: true,
  preset: 'liquid',
  opacity: 45,
  blur: 24,
  saturation: 140,
  brightness: 80,
  borderVisibility: 50,
  shadowIntensity: 70,
  cornerRadius: 18,
  reflectionIntensity: 60,
  tint: 'auto',
  customTintColor: '#3b82f6',
  performanceMode: false,
}

export function applyLiquidGlassCSS(settings: LiquidGlassSettings): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  if (!settings.enabled) {
    root.style.setProperty('--glass-opacity', '0.92')
    root.style.setProperty('--glass-blur', '0px')
    root.style.setProperty('--glass-backdrop-filter', 'none')
    root.style.setProperty('--glass-border', '1px solid rgba(255, 255, 255, 0.12)')
    root.style.setProperty('--glass-shadow', '0 10px 25px rgba(0, 0, 0, 0.4)')
    root.style.setProperty('--glass-radius', `${settings.cornerRadius}px`)
    root.style.setProperty('--glass-bg', 'rgba(15, 17, 26, 0.95)')
    root.style.setProperty('--glass-reflection', 'none')
    return
  }

  const effectiveBlur = settings.performanceMode ? Math.min(8, settings.blur) : settings.blur
  const effectiveSaturation = settings.performanceMode ? 100 : settings.saturation
  const effectiveBrightness = settings.brightness
  const opacityFactor = settings.opacity / 100
  const borderAlpha = (settings.borderVisibility / 100) * 0.4
  const shadowAlpha = (settings.shadowIntensity / 100) * 0.7

  let tintRgb = '255, 255, 255'
  if (settings.tint === 'blue') tintRgb = '59, 130, 246'
  else if (settings.tint === 'purple') tintRgb = '168, 85, 247'
  else if (settings.tint === 'black') tintRgb = '10, 10, 15'
  else if (settings.tint === 'white') tintRgb = '255, 255, 255'
  else if (settings.tint === 'custom') {
    // Hex to RGB conversion
    const hex = settings.customTintColor.replace('#', '')
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      tintRgb = `${r}, ${g}, ${b}`
    }
  } else {
    // Auto: dark glass base with subtle white reflection
    tintRgb = '18, 20, 30'
  }

  const bgStyle =
    settings.tint === 'white'
      ? `rgba(${tintRgb}, ${opacityFactor * 0.3})`
      : `rgba(${tintRgb}, ${opacityFactor})`

  const backdropFilter = `blur(${effectiveBlur}px) saturate(${effectiveSaturation}%) brightness(${effectiveBrightness + 20}%)`
  const borderStyle = `1px solid rgba(255, 255, 255, ${Math.max(0.08, borderAlpha)})`
  const shadowStyle = `0 20px 45px -10px rgba(0, 0, 0, ${shadowAlpha}), 0 0 0 1px rgba(255, 255, 255, ${borderAlpha * 0.5}) inset`

  const reflectionOpacity = (settings.reflectionIntensity / 100) * 0.25
  const reflectionGradient = settings.performanceMode
    ? 'none'
    : `linear-gradient(135deg, rgba(255, 255, 255, ${reflectionOpacity}) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, ${reflectionOpacity * 0.4}) 100%)`

  root.style.setProperty('--glass-opacity', `${opacityFactor}`)
  root.style.setProperty('--glass-blur', `${effectiveBlur}px`)
  root.style.setProperty('--glass-saturation', `${effectiveSaturation}%`)
  root.style.setProperty('--glass-backdrop-filter', backdropFilter)
  root.style.setProperty('--glass-border', borderStyle)
  root.style.setProperty('--glass-shadow', shadowStyle)
  root.style.setProperty('--glass-radius', `${settings.cornerRadius}px`)
  root.style.setProperty('--glass-bg', bgStyle)
  root.style.setProperty('--glass-reflection', reflectionGradient)
}
