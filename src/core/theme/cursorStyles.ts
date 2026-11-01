import type { CursorStyle } from '@/types'

// High-fidelity SVG custom cursors encoded as CSS data URIs
const CURSOR_SVGS: Record<CursorStyle, { cursor: string; pointer: string }> = {
  default: {
    cursor: 'auto',
    pointer: 'pointer',
  },
  'glow-cyan': {
    cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><defs><filter id='glow' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='1.5' result='blur'/><feMerge><feMergeNode in='blur'/><feMergeNode in='SourceGraphic'/></feMerge></filter></defs><path d='M3 3L11 23L15 14L24 10L3 3Z' fill='%2300f0ff' stroke='%23083344' stroke-width='1.5' filter='url(%23glow)'/></svg>") 3 3, auto`,
    pointer: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><circle cx='12' cy='12' r='7' fill='%2300f0ff' fill-opacity='0.4' stroke='%2300f0ff' stroke-width='2'/><circle cx='12' cy='12' r='2' fill='%23ffffff'/></svg>") 12 12, pointer`,
  },
  'amber-retro': {
    cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M2 2L9 20L12 13L19 10L2 2Z' fill='%23f59e0b' stroke='%2378350f' stroke-width='1.5'/><rect x='3' y='3' width='2' height='2' fill='%23fef3c7'/></svg>") 2 2, auto`,
    pointer: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><rect x='4' y='4' width='16' height='16' fill='%23f59e0b' fill-opacity='0.3' stroke='%23f59e0b' stroke-width='2'/><path d='M12 2V22M2 12H22' stroke='%23f59e0b' stroke-width='1.5'/></svg>") 12 12, pointer`,
  },
  cyberpunk: {
    cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><path d='M2 2L10 24L14 15L23 11L2 2Z' fill='%23d946ef' stroke='%233b0764' stroke-width='2'/><circle cx='6' cy='6' r='1.5' fill='%2300f0ff'/></svg>") 2 2, auto`,
    pointer: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><polygon points='12,2 22,12 12,22 2,12' fill='%23d946ef' fill-opacity='0.4' stroke='%2300f0ff' stroke-width='2'/><circle cx='12' cy='12' r='2' fill='%23ffffff'/></svg>") 12 12, pointer`,
  },
  precision: {
    cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='none' stroke='%2338bdf8' stroke-width='1.5'/><path d='M12 2V7M12 17V22M2 12H7M17 12H22' stroke='%2338bdf8' stroke-width='1.5'/><circle cx='12' cy='12' r='1.5' fill='%23ffffff'/></svg>") 12 12, crosshair`,
    pointer: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='5' fill='%2338bdf8' fill-opacity='0.6' stroke='%23ffffff' stroke-width='1.5'/></svg>") 12 12, pointer`,
  },
}

export function applyCursorStyle(style: CursorStyle) {
  const existing = document.getElementById('nova-cursor-styles')
  if (style === 'default') {
    if (existing) existing.remove()
    return
  }

  const def = CURSOR_SVGS[style] || CURSOR_SVGS.default
  const css = `
    * {
      cursor: ${def.cursor} !important;
    }
    a, button, input[type="button"], input[type="submit"], [role="button"], .cursor-pointer {
      cursor: ${def.pointer} !important;
    }
    input[type="text"], input[type="search"], textarea {
      cursor: text !important;
    }
  `

  let el = existing as HTMLStyleElement
  if (!el) {
    el = document.createElement('style')
    el.id = 'nova-cursor-styles'
    document.head.appendChild(el)
  }
  el.textContent = css
}
