import type { CursorSettings, CursorPreset, CursorSize } from '@/types'

export const DEFAULT_CURSOR_SETTINGS: CursorSettings = {
  preset: 'nova-default',
  size: 32,
  color: '#00f0ff',
  outlineColor: '#0a101f',
  shadow: true,
  animation: true,
  trail: false,
  clickEffect: true,
  glow: true,
  visibility: true,
}

export interface CursorSvgPack {
  default: string
  pointer: string
  text: string
  busy: string
  move: string
  crosshair: string
  notAllowed: string
}

export function generateCursorSvgPack(settings: CursorSettings): CursorSvgPack {
  const size = settings.size
  const color = settings.color
  const outline = settings.outlineColor
  const glowFilter = settings.glow
    ? `<defs><filter id="cglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
    : ''
  const filterAttr = settings.glow ? 'filter="url(#cglow)"' : ''

  if (settings.preset === 'windows-classic') {
    return {
      default: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M4 2 L4 26 L10 20 L16 30 L20 28 L14 18 L22 18 Z" fill="#ffffff" stroke="#000000" stroke-width="1.8"/></svg>`,
      pointer: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M10 2 L10 14 L8 14 C6 14 5 16 5 18 L5 25 C5 29 8 31 12 31 L18 31 C22 31 24 28 24 24 L24 16 C24 14 22 14 21 14 L21 18 L19 14 C18 13 17 13 16 14 L16 18 L14 14 C13 13 12 13 11 14 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5"/></svg>`,
      text: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M12 6 H20 M16 6 V26 M12 26 H20" stroke="#ffffff" stroke-width="2"/></svg>`,
      busy: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><rect x="8" y="4" width="16" height="24" rx="2" fill="#3b82f6" stroke="#000000" stroke-width="2"/><path d="M10 6 H22 L16 16 L22 26 H10 L16 16 Z" fill="#ffffff"/></svg>`,
      move: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M16 2 L12 6 H14 V14 H6 V12 L2 16 L6 20 V18 H14 V26 H12 L16 30 L20 26 H18 V18 H26 V20 L30 16 L26 12 V14 H18 V6 H20 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5"/></svg>`,
      crosshair: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="none" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="4" x2="16" y2="28" stroke="#ffffff" stroke-width="2"/><line x1="4" y1="16" x2="28" y2="16" stroke="#ffffff" stroke-width="2"/></svg>`,
      notAllowed: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="#ef4444" stroke-width="3"/><line x1="8" y1="8" x2="24" y2="24" stroke="#ef4444" stroke-width="3"/></svg>`,
    }
  }

  if (settings.preset === 'windows-modern') {
    return {
      default: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M5 3 L5 25 L11 20 L16 29 L19 27 L14 18 L21 18 Z" fill="#000000" stroke="#ffffff" stroke-width="1.6"/></svg>`,
      pointer: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M12 4 C11 4 10 5 10 6 L10 16 C9 16 8 17 8 18 L8 24 C8 28 11 30 15 30 L19 30 C23 30 25 27 25 23 L25 18 C25 16 23 16 22 17 L22 19 L20 17 L20 19 L18 17 L18 19 L14 16 L14 6 C14 5 13 4 12 4 Z" fill="#000000" stroke="#ffffff" stroke-width="1.6"/></svg>`,
      text: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M11 6 H21 M16 6 V26 M11 26 H21" stroke="#000000" stroke-width="2.5"/><path d="M11 6 H21 M16 6 V26 M11 26 H21" stroke="#ffffff" stroke-width="1.2"/></svg>`,
      busy: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="9" fill="none" stroke="#0078d4" stroke-width="3" stroke-dasharray="28 14"><animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="1s" repeatCount="indefinite"/></circle></svg>`,
      move: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M16 3 L12 7 H14 V14 H7 V12 L3 16 L7 20 V18 H14 V25 H12 L16 29 L20 25 H18 V18 H25 V20 L29 16 L25 12 V14 H18 V7 H20 Z" fill="#000000" stroke="#ffffff" stroke-width="1.6"/></svg>`,
      crosshair: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="none" stroke="#0078d4" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="#0078d4"/></svg>`,
      notAllowed: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="none" stroke="#e11d48" stroke-width="2.5"/><line x1="8" y1="8" x2="24" y2="24" stroke="#e11d48" stroke-width="2.5"/></svg>`,
    }
  }

  if (settings.preset === 'retro-pixel') {
    return {
      default: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" shape-rendering="crispEdges"><path d="M4 2 h2 v2 h2 v2 h2 v2 h2 v2 h2 v2 h2 v2 h2 v2 h2 v2 h-6 v2 h-2 v4 h-4 v-4 h-2 v-6 h-2 v-6 h-2 v-6 z" fill="#facc15" stroke="#000000" stroke-width="1.5"/></svg>`,
      pointer: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" shape-rendering="crispEdges"><path d="M10 2 h4 v12 h4 v4 h4 v6 h-12 v-4 h-4 v-8 h4 z" fill="#facc15" stroke="#000000" stroke-width="1.5"/></svg>`,
      text: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" shape-rendering="crispEdges"><path d="M12 6 h8 M16 6 v20 M12 26 h8" stroke="#facc15" stroke-width="2"/></svg>`,
      busy: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" shape-rendering="crispEdges"><rect x="10" y="6" width="12" height="20" fill="#f59e0b" stroke="#000000" stroke-width="1.5"/></svg>`,
      move: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" shape-rendering="crispEdges"><path d="M16 2 L12 8 h3 v5 h-5 v-3 L4 16 l6 4 v-3 h5 v5 h-3 l4 6 4-6 h-3 v-5 h5 v3 l6-4 -6-4 v3 h-5 v-5 h3 z" fill="#facc15" stroke="#000000" stroke-width="1.5"/></svg>`,
      crosshair: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" shape-rendering="crispEdges"><rect x="14" y="2" width="4" height="28" fill="#facc15"/><rect x="2" y="14" width="28" height="4" fill="#facc15"/></svg>`,
      notAllowed: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" shape-rendering="crispEdges"><circle cx="16" cy="16" r="10" fill="none" stroke="#ef4444" stroke-width="3"/></svg>`,
    }
  }

  // Default Futuristic / Gaming Neon / Custom vector pack
  return {
    default: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">${glowFilter}<path d="M3 3 L12 27 L16 17 L26 13 Z" fill="${color}" stroke="${outline}" stroke-width="1.8" ${filterAttr}/></svg>`,
    pointer: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">${glowFilter}<circle cx="14" cy="14" r="8" fill="${color}" fill-opacity="0.35" stroke="${color}" stroke-width="2" ${filterAttr}/><circle cx="14" cy="14" r="2.5" fill="#ffffff"/></svg>`,
    text: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M11 5 H21 M16 5 V27 M11 27 H21" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    busy: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">${glowFilter}<circle cx="16" cy="16" r="10" fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="35 15" ${filterAttr}><animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="0.8s" repeatCount="indefinite"/></circle></svg>`,
    move: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">${glowFilter}<path d="M16 2 L11 7 H14 V14 H7 V11 L2 16 L7 21 V18 H14 V25 H11 L16 30 L21 25 H18 V18 H25 V21 L30 16 L25 11 V14 H18 V7 H21 Z" fill="${color}" stroke="${outline}" stroke-width="1.5" ${filterAttr}/></svg>`,
    crosshair: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">${glowFilter}<circle cx="16" cy="16" r="9" fill="none" stroke="${color}" stroke-width="1.8" ${filterAttr}/><circle cx="16" cy="16" r="2" fill="#ffffff"/><line x1="16" y1="3" x2="16" y2="9" stroke="${color}" stroke-width="1.8"/><line x1="16" y1="23" x2="16" y2="29" stroke="${color}" stroke-width="1.8"/><line x1="3" y1="16" x2="9" y2="16" stroke="${color}" stroke-width="1.8"/><line x1="23" y1="16" x2="29" y2="16" stroke="${color}" stroke-width="1.8"/></svg>`,
    notAllowed: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="none" stroke="#f43f5e" stroke-width="2.5"/><line x1="8" y1="8" x2="24" y2="24" stroke="#f43f5e" stroke-width="2.5"/></svg>`,
  }
}

export function encodeSvgForCursor(svg: string): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
}

export function applyCursorSettings(settings: CursorSettings): void {
  if (typeof document === 'undefined') return

  if (settings.preset === 'nova-default' && settings.size === 32 && !settings.trail && settings.color === '#00f0ff') {
    // If standard default without trail, use lightweight system default
  }

  const pack = generateCursorSvgPack(settings)
  const defaultCursorUri = settings.customUrl ? `url("${settings.customUrl}"), auto` : `${encodeSvgForCursor(pack.default)} 3 3, auto`
  const pointerCursorUri = `${encodeSvgForCursor(pack.pointer)} 14 14, pointer`
  const textCursorUri = `${encodeSvgForCursor(pack.text)} 16 16, text`
  const busyCursorUri = `${encodeSvgForCursor(pack.busy)} 16 16, wait`
  const moveCursorUri = `${encodeSvgForCursor(pack.move)} 16 16, move`
  const crosshairCursorUri = `${encodeSvgForCursor(pack.crosshair)} 16 16, crosshair`
  const notAllowedCursorUri = `${encodeSvgForCursor(pack.notAllowed)} 16 16, not-allowed`

  let styleEl = document.getElementById('nova-cursor-styles') as HTMLStyleElement
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'nova-cursor-styles'
    document.head.appendChild(styleEl)
  }

  styleEl.textContent = `
    * {
      cursor: ${defaultCursorUri} !important;
    }
    a, button, input[type="button"], input[type="submit"], [role="button"], .cursor-pointer {
      cursor: ${pointerCursorUri} !important;
    }
    input[type="text"], input[type="search"], textarea, [contenteditable="true"] {
      cursor: ${textCursorUri} !important;
    }
    .cursor-wait, [aria-busy="true"] {
      cursor: ${busyCursorUri} !important;
    }
    .cursor-move {
      cursor: ${moveCursorUri} !important;
    }
    .cursor-crosshair {
      cursor: ${crosshairCursorUri} !important;
    }
    .cursor-not-allowed, :disabled {
      cursor: ${notAllowedCursorUri} !important;
    }
  `
}
